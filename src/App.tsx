import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Player,
  PlayerRole,
  Rank,
  Suit,
  ActionLog,
  PendingSpecialAction,
} from './types/game';
import {
  createDeck,
  shuffleDeck,
  getCombinationRank,
  getRankLabel,
  canBeatTable,
  checkShibariTrigger,
  chooseBotMove,
  botChooseQBomberRank,
  botSelectWorstCards,
  botSelectCardsToDiscard,
  sortCards,
  ROLE_NAMES,
} from './utils/cardUtils';
import { sounds } from './utils/audio';
import { Header } from './components/Header';
import { TableCenter } from './components/TableCenter';
import { BotPlayerView } from './components/BotPlayerView';
import { HumanPlayerHand } from './components/HumanPlayerHand';
import { Pass7Modal, Discard10Modal, QBomberModal, ExchangeModal } from './components/ActionModals';
import { RulesModal } from './components/RulesModal';
import { LogModal } from './components/LogModal';
import { RoundSummaryModal } from './components/RoundSummaryModal';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'あなた',
    isBot: false,
    avatar: '👑',
    cards: [],
    score: 0,
    passed: false,
  },
  {
    id: 'p2',
    name: 'アリス',
    isBot: true,
    avatar: '🐰',
    cards: [],
    score: 0,
    passed: false,
  },
  {
    id: 'p3',
    name: 'ボブ',
    isBot: true,
    avatar: '🎩',
    cards: [],
    score: 0,
    passed: false,
  },
  {
    id: 'p4',
    name: 'チャーリー',
    isBot: true,
    avatar: '🦊',
    cards: [],
    score: 0,
    passed: false,
  },
];

export default function App() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [tableCards, setTableCards] = useState<Card[] | null>(null);
  const [lastPlayerToPlayId, setLastPlayerToPlayId] = useState<string | null>(null);
  const [shibariSuits, setShibariSuits] = useState<Suit[] | null>(null);
  const [isRevolution, setIsRevolution] = useState<boolean>(false);
  const [isJBack, setIsJBack] = useState<boolean>(false);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [round, setRound] = useState<number>(1);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [fastSpeed, setFastSpeed] = useState<boolean>(false);

  // Modals & UI States
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [roundSummaryOpen, setRoundSummaryOpen] = useState<boolean>(false);
  const [specialNotice, setSpecialNotice] = useState<string | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [pendingSpecial, setPendingSpecial] = useState<PendingSpecialAction | null>(null);

  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flash temporary banner
  const triggerNotice = useCallback((text: string) => {
    setSpecialNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setSpecialNotice(null);
    }, 2800);
  }, []);

  const addLog = useCallback(
    (text: string, type: 'play' | 'pass' | 'special' | 'round' = 'play') => {
      setLogs(prev => [
        {
          id: Math.random().toString(),
          text,
          type,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
    },
    []
  );

  // Find next active player index (skipping players with 0 cards)
  const getNextActivePlayerIndex = useCallback(
    (currentIndex: number, currentPlayers: Player[], step: number = 1): number => {
      const total = currentPlayers.length;
      let next = currentIndex;
      let stepsRemaining = step;

      while (stepsRemaining > 0) {
        next = (next + 1) % total;
        if (currentPlayers[next].cards.length > 0) {
          stepsRemaining--;
        }
      }
      return next;
    },
    []
  );

  // Check if round is finished (3 players have 0 cards)
  const checkRoundFinished = useCallback(
    (currentPlayers: Player[]) => {
      const activePlayers = currentPlayers.filter(p => p.cards.length > 0);
      if (activePlayers.length <= 1) {
        // Round Over!
        const finishedRankings: Player[] = [...currentPlayers].sort((a, b) => {
          if (a.finishedRank && b.finishedRank) return a.finishedRank - b.finishedRank;
          if (a.finishedRank) return -1;
          if (b.finishedRank) return 1;
          return 0;
        });

        // The remaining active player takes 4th place (大貧民)
        if (activePlayers.length === 1) {
          activePlayers[0].finishedRank = 4;
        }

        // Assign roles and scores
        const roles: PlayerRole[] = ['daifugo', 'fugo', 'heimin', 'daihinmin'];
        const scorePoints = [30, 20, 10, 0];

        const updated = currentPlayers.map(p => {
          const rankIdx = (p.finishedRank || 4) - 1;
          const assignedRole = roles[rankIdx];
          const gainedScore = scorePoints[rankIdx];
          return {
            ...p,
            rank: assignedRole,
            score: p.score + gainedScore,
          };
        });

        setPlayers(updated);
        setRoundSummaryOpen(true);
        addLog(`第 ${round} ラウンドが終了しました！`, 'round');
        return true;
      }
      return false;
    },
    [round, addLog]
  );

  // Deal cards & initialize round
  const dealCardsForRound = useCallback(
    (currentRound: number, existingPlayers: Player[]) => {
      const deck = shuffleDeck(createDeck());
      // 53 cards across 4 players: 14, 13, 13, 13
      const hands: Card[][] = [[], [], [], []];
      deck.forEach((card, idx) => {
        hands[idx % 4].push(card);
      });

      const updated = existingPlayers.map((p, idx) => ({
        ...p,
        cards: hands[idx],
        passed: false,
        finishedRank: undefined,
      }));

      setPlayers(updated);
      setTableCards(null);
      setLastPlayerToPlayId(null);
      setShibariSuits(null);
      setIsRevolution(false);
      setIsJBack(false);
      setDiscardPile([]);
      setSelectedCardIds([]);
      setPendingSpecial(null);

      // In Round 1, player with Spade 3 starts. In later rounds, Daihinmin starts!
      let starterIndex = 0;
      if (currentRound === 1) {
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].cards.some(c => c.suit === 'spade' && c.rank === 3)) {
            starterIndex = i;
            break;
          }
        }
      } else {
        const daihinminIdx = updated.findIndex(p => p.rank === 'daihinmin');
        if (daihinminIdx !== -1) starterIndex = daihinminIdx;
      }

      setCurrentTurnIndex(starterIndex);
      addLog(
        `第 ${currentRound} ラウンド開始！【${updated[starterIndex].name}】からスタート`,
        'round'
      );
    },
    [addLog]
  );

  // Start initial game on mount
  useEffect(() => {
    dealCardsForRound(1, INITIAL_PLAYERS);
  }, [dealCardsForRound]);

  // Execute card play
  const handlePlayCards = useCallback(
    (playerIndex: number, cardsToPlay: Card[]) => {
      sounds.playCardPlay();

      const player = players[playerIndex];
      const rank = getCombinationRank(cardsToPlay);
      const isPlayerGoingOut = player.cards.length === cardsToPlay.length;

      // Check Shibari Trigger (マーク縛り)
      let newShibariSuits = shibariSuits;
      const shibariTrigger = checkShibariTrigger(cardsToPlay, tableCards);
      if (shibariTrigger && !shibariSuits) {
        newShibariSuits = shibariTrigger;
        setShibariSuits(newShibariSuits);
        sounds.playShibari();
        triggerNotice(`【マーク縛り発動！】以降は同じマークのみ出せます`);
        addLog(`${player.name}の出し手により【マーク縛り】が発動しました！`, 'special');
      }

      // Remove cards from player's hand
      const remainingCards = player.cards.filter(
        c => !cardsToPlay.some(played => played.id === c.id)
      );

      // Record finish rank if emptied hand
      let finishedRank = player.finishedRank;
      if (isPlayerGoingOut && !finishedRank) {
        const alreadyFinishedCount = players.filter(p => p.cards.length === 0).length;
        finishedRank = alreadyFinishedCount + 1;
        const roleLabel =
          finishedRank === 1
            ? '大富豪'
            : finishedRank === 2
            ? '富豪'
            : finishedRank === 3
            ? '貧民'
            : '大貧民';
        triggerNotice(`🎉 ${player.name} が ${finishedRank}位（${roleLabel}）で上がり！`);
        addLog(`🎉 ${player.name} が ${finishedRank}位（${roleLabel}）で上がりました！`, 'round');
        if (!player.isBot) sounds.playFanfare();
      }

      // Update player in list
      const updatedPlayers = players.map((p, idx) =>
        idx === playerIndex ? { ...p, cards: remainingCards, finishedRank } : p
      );
      setPlayers(updatedPlayers);
      setTableCards(cardsToPlay);
      setLastPlayerToPlayId(player.id);
      setSelectedCardIds([]);

      addLog(
        `${player.name} が [${cardsToPlay.map(c => getRankLabel(c.rank)).join(', ')}] を出しました`
      );

      // Check if this card play ended the round
      if (checkRoundFinished(updatedPlayers)) {
        return;
      }

      // Special Rules Evaluation
      // 0. 革命 (Revolution): 同じ数字を4枚同時に出すと発動（革命返し対応）
      let currentRevolution = isRevolution;
      if (cardsToPlay.length >= 4) {
        sounds.playRevolution();
        currentRevolution = !isRevolution;
        setIsRevolution(currentRevolution);
        if (currentRevolution) {
          triggerNotice(`🚩【革命発生！】カードの強さが永続反転（3が最強、2が最弱）！`);
          addLog(
            `🚩 ${player.name} の4枚出しにより【革命】が発生！カードの強さが反転しました！`,
            'special'
          );
        } else {
          triggerNotice(`🚩【革命返し！】革命が返され、カードの強さが通常に戻りました！`);
          addLog(
            `🚩 ${player.name} の4枚出しにより【革命返し】が発生！強さが通常に復帰しました！`,
            'special'
          );
        }
      }

      const currentEffectiveInverted = currentRevolution ? !isJBack : isJBack;

      // 1. 8切り (8 Cut)
      if (rank === 8) {
        sounds.play8Cut();
        triggerNotice(`⚔️ ${player.name} の【8切り】！場が流れます！`);
        addLog(`${player.name} の【8切り】により場が即座に流れました！`, 'special');

        // Move table cards to discard
        setDiscardPile(prev => [...prev, ...(tableCards || []), ...cardsToPlay]);
        setTableCards(null);
        setLastPlayerToPlayId(null);
        setShibariSuits(null);
        setIsJBack(false);

        // Reset all passed flags
        const resetPassed = updatedPlayers.map(p => ({ ...p, passed: false }));
        setPlayers(resetPassed);

        // If player still active, they lead. Otherwise next active player leads.
        const nextIndex =
          remainingCards.length > 0
            ? playerIndex
            : getNextActivePlayerIndex(playerIndex, resetPassed, 1);
        setCurrentTurnIndex(nextIndex);
        return;
      }

      // 2. Jバック (J Back)
      if (rank === 11) {
        sounds.playJBack();
        setIsJBack(true);
        triggerNotice(`🔄【Jバック発動！】強さが一時逆転（3が最強、2が最弱）！`);
        addLog(
          `${player.name} がJを出したため【Jバック】が発動！場の強さが逆転しました！`,
          'special'
        );
      }

      // 3. Qボンバー (Q Bomber)
      if (rank === 12) {
        sounds.playQBomber();
        triggerNotice(`💣【Qボンバー発動！】`);
        if (!player.isBot) {
          // Human player picks a rank to bomb
          setPendingSpecial({
            type: 'q_bomber',
            playerId: player.id,
          });
          return;
        } else {
          // Bot picks smartly
          const targetRank = botChooseQBomberRank(remainingCards);
          executeQBomber(player, targetRank, updatedPlayers, cardsToPlay);
          return;
        }
      }

      // 4. 7渡し (7 Pass)
      if (rank === 7 && remainingCards.length > 0) {
        sounds.play7Pass();
        const passCount = Math.min(cardsToPlay.length, remainingCards.length);
        const targetIndex = getNextActivePlayerIndex(playerIndex, updatedPlayers, 1);
        const targetPlayer = updatedPlayers[targetIndex];

        triggerNotice(`🎁 ${player.name} の【7渡し】！${targetPlayer.name} へカードを渡します`);
        if (!player.isBot) {
          // Human picks cards to pass
          setPendingSpecial({
            type: '7_pass',
            playerId: player.id,
            targetPlayerId: targetPlayer.id,
            count: passCount,
          });
          return;
        } else {
          // Bot passes worst cards
          const toPass = botSelectWorstCards(remainingCards, passCount, currentEffectiveInverted);
          execute7Pass(player, targetPlayer, toPass, updatedPlayers, cardsToPlay);
          return;
        }
      }

      // 5. 10捨て (10 Discard)
      if (rank === 10 && remainingCards.length > 0) {
        sounds.play10Discard();
        const discardCount = Math.min(cardsToPlay.length, remainingCards.length);
        triggerNotice(`🗑️ ${player.name} の【10捨て】！手札を破棄します`);
        if (!player.isBot) {
          // Human picks cards to discard
          setPendingSpecial({
            type: '10_discard',
            playerId: player.id,
            count: discardCount,
          });
          return;
        } else {
          // Bot discards worst cards
          const toDiscard = botSelectCardsToDiscard(remainingCards, discardCount, currentEffectiveInverted);
          execute10Discard(player, toDiscard, updatedPlayers, cardsToPlay);
          return;
        }
      }

      // 6. 5スキップ (5 Skip)
      if (rank === 5) {
        sounds.play5Skip();
        const skipCount = cardsToPlay.length;
        triggerNotice(`⏩【5スキップ発動！】次の ${skipCount} 人をスキップ！`);
        addLog(`${player.name} の【5スキップ】により ${skipCount} 人スキップされました`, 'special');

        const nextIndex = getNextActivePlayerIndex(
          playerIndex,
          updatedPlayers,
          skipCount + 1
        );
        setCurrentTurnIndex(nextIndex);
        return;
      }

      // Normal turn advancement
      const nextIndex = getNextActivePlayerIndex(playerIndex, updatedPlayers, 1);
      setCurrentTurnIndex(nextIndex);
    },
    [
      players,
      tableCards,
      shibariSuits,
      isJBack,
      triggerNotice,
      addLog,
      checkRoundFinished,
      getNextActivePlayerIndex,
    ]
  );

  // Execute Q-Bomber resolution
  const executeQBomber = (
    player: Player,
    bombedRank: Rank,
    currentPlayers: Player[],
    lastPlayedCards: Card[]
  ) => {
    const bombedCards: Card[] = [];
    const updated = currentPlayers.map(p => {
      const kept: Card[] = [];
      p.cards.forEach(c => {
        if (c.rank === bombedRank) {
          bombedCards.push(c);
        } else {
          kept.push(c);
        }
      });

      let finishedRank = p.finishedRank;
      if (p.cards.length > 0 && kept.length === 0 && !finishedRank) {
        const alreadyFinishedCount = currentPlayers.filter(x => x.cards.length === 0).length;
        finishedRank = alreadyFinishedCount + 1;
      }

      return {
        ...p,
        cards: kept,
        finishedRank,
      };
    });

    setDiscardPile(prev => [...prev, ...bombedCards]);
    setPlayers(updated);
    setPendingSpecial(null);

    triggerNotice(
      `💥 Qボンバー炸裂！『${getRankLabel(bombedRank)}』が全員の手札から合計 ${bombedCards.length} 枚爆破！`
    );
    addLog(
      `💥 Qボンバー！『${getRankLabel(bombedRank)}』が指定され、全員の手札から合計 ${bombedCards.length} 枚が墓地に破棄されました！`,
      'special'
    );

    if (checkRoundFinished(updated)) return;

    // Advance turn normally
    const playerIdx = updated.findIndex(p => p.id === player.id);
    const nextIndex = getNextActivePlayerIndex(playerIdx, updated, 1);
    setCurrentTurnIndex(nextIndex);
  };

  // Execute 7-Pass resolution
  const execute7Pass = (
    giver: Player,
    receiver: Player,
    cardsToPass: Card[],
    currentPlayers: Player[],
    _lastPlayedCards: Card[]
  ) => {
    const updated = currentPlayers.map(p => {
      if (p.id === giver.id) {
        const remaining = p.cards.filter(c => !cardsToPass.some(tp => tp.id === c.id));
        let finishedRank = p.finishedRank;
        if (p.cards.length > 0 && remaining.length === 0 && !finishedRank) {
          const alreadyFinishedCount = currentPlayers.filter(x => x.cards.length === 0).length;
          finishedRank = alreadyFinishedCount + 1;
        }
        return { ...p, cards: remaining, finishedRank };
      }
      if (p.id === receiver.id) {
        return { ...p, cards: [...p.cards, ...cardsToPass] };
      }
      return p;
    });

    setPlayers(updated);
    setPendingSpecial(null);

    triggerNotice(`🎁 ${giver.name} が ${receiver.name} に ${cardsToPass.length}枚 渡しました`);
    addLog(
      `${giver.name} が【7渡し】で ${receiver.name} に ${cardsToPass.length}枚のカードを押し付けました`,
      'special'
    );

    if (checkRoundFinished(updated)) return;

    const giverIdx = updated.findIndex(p => p.id === giver.id);
    const nextIndex = getNextActivePlayerIndex(giverIdx, updated, 1);
    setCurrentTurnIndex(nextIndex);
  };

  // Execute 10-Discard resolution
  const execute10Discard = (
    player: Player,
    cardsToDiscard: Card[],
    currentPlayers: Player[],
    _lastPlayedCards: Card[]
  ) => {
    const updated = currentPlayers.map(p => {
      if (p.id === player.id) {
        const remaining = p.cards.filter(c => !cardsToDiscard.some(td => td.id === c.id));
        let finishedRank = p.finishedRank;
        if (p.cards.length > 0 && remaining.length === 0 && !finishedRank) {
          const alreadyFinishedCount = currentPlayers.filter(x => x.cards.length === 0).length;
          finishedRank = alreadyFinishedCount + 1;
        }
        return { ...p, cards: remaining, finishedRank };
      }
      return p;
    });

    setDiscardPile(prev => [...prev, ...cardsToDiscard]);
    setPlayers(updated);
    setPendingSpecial(null);

    triggerNotice(`🗑️ ${player.name} が ${cardsToDiscard.length}枚 捨てました！`);
    addLog(
      `${player.name} が【10捨て】で不要な手札 ${cardsToDiscard.length}枚を直接墓地に破棄しました`,
      'special'
    );

    if (checkRoundFinished(updated)) return;

    const playerIdx = updated.findIndex(p => p.id === player.id);
    const nextIndex = getNextActivePlayerIndex(playerIdx, updated, 1);
    setCurrentTurnIndex(nextIndex);
  };

  // Handle Pass
  const handlePass = useCallback(
    (playerIndex: number) => {
      sounds.playPass();
      const player = players[playerIndex];
      addLog(`${player.name} がパスしました`, 'pass');

      const updated = players.map((p, idx) => (idx === playerIndex ? { ...p, passed: true } : p));
      setPlayers(updated);

      // Check if everyone active has passed (or only the last player to play remains unpassed)
      const activeUnpassed = updated.filter(p => p.cards.length > 0 && !p.passed);

      // If 0 or 1 active players remain unpassed, and there's a last player
      if (activeUnpassed.length === 0 || (activeUnpassed.length === 1 && activeUnpassed[0].id === lastPlayerToPlayId)) {
        // Field Clears! (場が流れる)
        triggerNotice(`場が流れました（リセット）`);
        addLog(`全員がパスしたため、場が流れました`, 'special');

        setDiscardPile(prev => [...prev, ...(tableCards || [])]);
        setTableCards(null);
        setShibariSuits(null);
        setIsJBack(false);

        // Reset passed states for all active players
        const resetPassed = updated.map(p => ({ ...p, passed: false }));
        setPlayers(resetPassed);

        // Find who gets the lead: lastPlayerToPlayId if active, or next active
        let leaderIdx = resetPassed.findIndex(p => p.id === lastPlayerToPlayId);
        if (leaderIdx === -1 || resetPassed[leaderIdx].cards.length === 0) {
          leaderIdx = getNextActivePlayerIndex(playerIndex, resetPassed, 1);
        }
        setCurrentTurnIndex(leaderIdx);
      } else {
        // Advance to next active unpassed player
        let next = playerIndex;
        let count = 0;
        while (count < updated.length) {
          next = (next + 1) % updated.length;
          if (updated[next].cards.length > 0 && !updated[next].passed) {
            setCurrentTurnIndex(next);
            break;
          }
          count++;
        }
      }
    },
    [players, lastPlayerToPlayId, tableCards, triggerNotice, addLog, getNextActivePlayerIndex]
  );

  // Bot Turn Automation Effect
  useEffect(() => {
    if (roundSummaryOpen || pendingSpecial) return;

    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isBot || currentPlayer.cards.length === 0) {
      return;
    }

    const botDelay = fastSpeed ? 260 : 850;
    const timer = setTimeout(() => {
      // Re-check current player state
      const current = players[currentTurnIndex];
      if (!current || !current.isBot || current.cards.length === 0) return;

      const effectiveInverted = isRevolution ? !isJBack : isJBack;
      const activeOpponents = players.filter(p => p.id !== current.id && p.cards.length > 0).length;
      const botMove = chooseBotMove(
        current.cards,
        tableCards,
        effectiveInverted,
        shibariSuits,
        activeOpponents
      );

      if (botMove && botMove.length > 0) {
        handlePlayCards(currentTurnIndex, botMove);
      } else {
        handlePass(currentTurnIndex);
      }
    }, botDelay);

    return () => clearTimeout(timer);
  }, [
    currentTurnIndex,
    players,
    tableCards,
    isRevolution,
    isJBack,
    shibariSuits,
    roundSummaryOpen,
    pendingSpecial,
    fastSpeed,
    handlePlayCards,
    handlePass,
  ]);

  // Card exchange resolution between rounds
  const handleNextRoundWithExchange = () => {
    setRoundSummaryOpen(false);

    // Check if human needs to exchange cards
    const human = players.find(p => !p.isBot);
    const humanRole = human?.rank;

    // Check if human is Daifugo (needs to give 2 cards to Daihinmin) or Fugo (gives 1 to Hinmin)
    if (human && humanRole === 'daifugo') {
      const daihinmin = players.find(p => p.rank === 'daihinmin');
      if (daihinmin) {
        setPendingSpecial({
          type: 'exchange',
          playerId: human.id,
          targetPlayerId: daihinmin.id,
          count: 2,
          extra: { roleName: '大貧民' },
        });
        return;
      }
    } else if (human && humanRole === 'fugo') {
      const heimin = players.find(p => p.rank === 'heimin');
      if (heimin) {
        setPendingSpecial({
          type: 'exchange',
          playerId: human.id,
          targetPlayerId: heimin.id,
          count: 1,
          extra: { roleName: '貧民' },
        });
        return;
      }
    }

    // Otherwise automated exchange for bots & start round
    executeAutomatedExchangeAndStartRound(players, null);
  };

  const executeAutomatedExchangeAndStartRound = (
    currentPlayers: Player[],
    humanGivenCards: Card[] | null
  ) => {
    // Deal fresh cards first
    const deck = shuffleDeck(createDeck());
    const hands: Card[][] = [[], [], [], []];
    deck.forEach((card, idx) => {
      hands[idx % 4].push(card);
    });

    let updated = currentPlayers.map((p, idx) => ({
      ...p,
      cards: hands[idx],
      passed: false,
      finishedRank: undefined,
    }));

    // Find players by role
    const daifugo = updated.find(p => p.rank === 'daifugo');
    const fugo = updated.find(p => p.rank === 'fugo');
    const heimin = updated.find(p => p.rank === 'heimin');
    const daihinmin = updated.find(p => p.rank === 'daihinmin');

    // 1. Daifugo & Daihinmin Exchange (2 cards)
    if (daifugo && daihinmin) {
      // Daihinmin gives their top 2 best cards
      const sortedDaihinmin = sortCards(daihinmin.cards, false);
      const daihinminBest = sortedDaihinmin.slice(-2); // top 2

      // Daifugo gives 2 cards
      let daifugoGive = humanGivenCards && daifugo.id === 'p1'
        ? humanGivenCards
        : botSelectWorstCards(daifugo.cards, 2, false);

      daifugo.cards = daifugo.cards.filter(c => !daifugoGive.some(g => g.id === c.id)).concat(daihinminBest);
      daihinmin.cards = daihinmin.cards.filter(c => !daihinminBest.some(b => b.id === c.id)).concat(daifugoGive);
    }

    // 2. Fugo & Heimin Exchange (1 card)
    if (fugo && heimin) {
      const sortedHeimin = sortCards(heimin.cards, false);
      const heiminBest = sortedHeimin.slice(-1); // top 1

      let fugoGive = humanGivenCards && fugo.id === 'p1'
        ? humanGivenCards
        : botSelectWorstCards(fugo.cards, 1, false);

      fugo.cards = fugo.cards.filter(c => !fugoGive.some(g => g.id === c.id)).concat(heiminBest);
      heimin.cards = heimin.cards.filter(c => !heiminBest.some(b => b.id === c.id)).concat(fugoGive);
    }

    const nextRound = round + 1;
    setRound(nextRound);
    setPlayers(updated);
    setTableCards(null);
    setLastPlayerToPlayId(null);
    setShibariSuits(null);
    setIsRevolution(false);
    setIsJBack(false);
    setDiscardPile([]);
    setSelectedCardIds([]);
    setPendingSpecial(null);

    // Daihinmin leads round 2+
    let starterIndex = updated.findIndex(p => p.rank === 'daihinmin');
    if (starterIndex === -1) starterIndex = 0;
    setCurrentTurnIndex(starterIndex);

    triggerNotice(`第 ${nextRound} ラウンド開始！階級交換が完了しました`);
    addLog(`第 ${nextRound} ラウンド開始！階級カード交換完了`, 'round');
  };

  const handleResetGame = () => {
    setRound(1);
    const reset = INITIAL_PLAYERS.map(p => ({
      ...p,
      score: 0,
      rank: undefined,
      finishedRank: undefined,
      passed: false,
    }));
    dealCardsForRound(1, reset);
    setRoundSummaryOpen(false);
    setPendingSpecial(null);
    triggerNotice('ゲームを初期化しました');
  };

  // Human card click toggle
  const handleToggleCard = (card: Card) => {
    if (selectedCardIds.includes(card.id)) {
      setSelectedCardIds(selectedCardIds.filter(id => id !== card.id));
    } else {
      setSelectedCardIds([...selectedCardIds, card.id]);
    }
  };

  // Human play trigger
  const handlePlaySelected = () => {
    const selected = players[0].cards.filter(c => selectedCardIds.includes(c.id));
    if (selected.length === 0) return;
    const effectiveInverted = isRevolution ? !isJBack : isJBack;
    if (canBeatTable(selected, tableCards, effectiveInverted, shibariSuits)) {
      handlePlayCards(0, selected);
    }
  };

  const handleHumanPass = () => {
    handlePass(0);
  };

  const handleClearSelection = () => {
    setSelectedCardIds([]);
  };

  const humanPlayer = players[0];
  const isHumanTurn = currentTurnIndex === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        round={round}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          sounds.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        fastSpeed={fastSpeed}
        onToggleSpeed={() => setFastSpeed(!fastSpeed)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onResetGame={handleResetGame}
      />

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-6xl mx-auto w-full relative">
        {/* Top Arena Row: Bot 2 (ボブ / Bob) */}
        <div className="flex justify-center w-full z-10">
          <BotPlayerView
            player={players[2]}
            isCurrentTurn={currentTurnIndex === 2}
            position="top"
          />
        </div>

        {/* Center Middle Arena Row: Bot 1 (Left), TableCenter (Center), Bot 3 (Right) */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 my-2 sm:my-3 w-full">
          {/* Left Bot (アリス / Alice) */}
          <div className="shrink-0">
            <BotPlayerView
              player={players[1]}
              isCurrentTurn={currentTurnIndex === 1}
              position="left"
            />
          </div>

          {/* Center Play Table */}
          <div className="flex-1 flex justify-center px-1">
            <TableCenter
              tableCards={tableCards}
              lastPlayerName={
                lastPlayerToPlayId
                  ? players.find(p => p.id === lastPlayerToPlayId)?.name || null
                  : null
              }
              isRevolution={isRevolution}
              isJBack={isJBack}
              shibariSuits={shibariSuits}
              discardCount={discardPile.length}
              specialNotice={specialNotice}
            />
          </div>

          {/* Right Bot (チャーリー / Charlie) */}
          <div className="shrink-0">
            <BotPlayerView
              player={players[3]}
              isCurrentTurn={currentTurnIndex === 3}
              position="right"
            />
          </div>
        </div>

        {/* Bottom Arena Row: Human Player Controls & Interactive Hand */}
        <div className="w-full z-10">
          <HumanPlayerHand
            player={humanPlayer}
            isMyTurn={isHumanTurn}
            tableCards={tableCards}
            isRevolution={isRevolution}
            isJBack={isJBack}
            shibariSuits={shibariSuits}
            selectedCardIds={selectedCardIds}
            onToggleCard={handleToggleCard}
            onPlaySelected={handlePlaySelected}
            onPass={handleHumanPass}
            onClearSelection={handleClearSelection}
          />
        </div>
      </main>

      {/* Interactive Action Modals for Special Rules */}
      {pendingSpecial?.type === '7_pass' && (
        <Pass7Modal
          player={humanPlayer}
          targetPlayer={players.find(p => p.id === pendingSpecial.targetPlayerId) || players[1]}
          count={pendingSpecial.count || 1}
          onConfirm={selected => {
            const target = players.find(p => p.id === pendingSpecial.targetPlayerId) || players[1];
            execute7Pass(humanPlayer, target, selected, players, tableCards || []);
          }}
        />
      )}

      {pendingSpecial?.type === '10_discard' && (
        <Discard10Modal
          player={humanPlayer}
          count={pendingSpecial.count || 1}
          onConfirm={selected => {
            execute10Discard(humanPlayer, selected, players, tableCards || []);
          }}
        />
      )}

      {pendingSpecial?.type === 'q_bomber' && (
        <QBomberModal
          playerHand={humanPlayer.cards}
          onConfirm={rank => {
            executeQBomber(humanPlayer, rank, players, tableCards || []);
          }}
        />
      )}

      {pendingSpecial?.type === 'exchange' && (
        <ExchangeModal
          player={humanPlayer}
          targetRoleName={pendingSpecial.extra?.roleName || '対戦相手'}
          count={pendingSpecial.count || 1}
          onConfirm={selected => {
            executeAutomatedExchangeAndStartRound(players, selected);
          }}
        />
      )}

      {/* Game Reference Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <LogModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} logs={logs} />
      {roundSummaryOpen && (
        <RoundSummaryModal
          round={round}
          players={players}
          onNextRound={handleNextRoundWithExchange}
          onResetGame={handleResetGame}
        />
      )}
    </div>
  );
}
