import React from 'react';
import { Card, Player, PlayerRole, Suit } from '../types/game';
import { PlayingCard } from './PlayingCard';
import {
  ROLE_NAMES,
  ROLE_BADGE_COLORS,
  canBeatTable,
  getCombinationRank,
  getRankLabel,
  sortCards,
} from '../utils/cardUtils';
import { Play, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface HumanPlayerHandProps {
  player: Player;
  isMyTurn: boolean;
  tableCards: Card[] | null;
  isRevolution: boolean;
  isJBack: boolean;
  shibariSuits: Suit[] | null;
  selectedCardIds: string[];
  onToggleCard: (card: Card) => void;
  onPlaySelected: () => void;
  onPass: () => void;
  onClearSelection: () => void;
}

export const HumanPlayerHand: React.FC<HumanPlayerHandProps> = ({
  player,
  isMyTurn,
  tableCards,
  isRevolution,
  isJBack,
  shibariSuits,
  selectedCardIds,
  onToggleCard,
  onPlaySelected,
  onPass,
  onClearSelection,
}) => {
  const isFinished = player.cards.length === 0;
  const role = player.rank as PlayerRole;
  const roleName = role ? ROLE_NAMES[role] : '平民';
  const roleColor = role ? ROLE_BADGE_COLORS[role] : 'bg-slate-800 text-slate-300 border-slate-700';

  // Effective inverted state
  const isInverted = isRevolution ? !isJBack : isJBack;

  // Sort human cards nicely
  const sortedCards = sortCards(player.cards, isInverted);

  // Selected cards
  const selectedCards = player.cards.filter(c => selectedCardIds.includes(c.id));
  const isValidPlay =
    isMyTurn &&
    !player.passed &&
    !isFinished &&
    selectedCards.length > 0 &&
    canBeatTable(selectedCards, tableCards, isInverted, shibariSuits);

  // Determine special badge label if playing this selection
  let playActionLabel = 'カードを出す';
  if (selectedCards.length > 0) {
    const rank = getCombinationRank(selectedCards);
    if (rank !== null) {
      const rankLabel = getRankLabel(rank);
      if (selectedCards.length >= 4) {
        playActionLabel = isRevolution
          ? `革命返しを発動！(${rankLabel} 4枚)`
          : `🚩 革命を発動！(${rankLabel} 4枚)`;
      } else if (rank === 8) {
        playActionLabel = `8切りを発動！(${selectedCards.length}枚)`;
      } else if (rank === 12) {
        playActionLabel = `Qボンバーを発動！`;
      } else if (rank === 11) {
        playActionLabel = `Jバックを発動！`;
      } else if (rank === 5) {
        playActionLabel = `5スキップを発動！`;
      } else if (rank === 7) {
        playActionLabel = `7渡しを発動！`;
      } else if (rank === 10) {
        playActionLabel = `10捨てを発動！`;
      } else {
        playActionLabel = `${rankLabel} を出す (${selectedCards.length}枚)`;
      }
    }
  }

  // Get special badge for individual card
  const getCardSpecialBadge = (card: Card): string | undefined => {
    if (card.isJoker) return '万能';
    if (card.rank === 5) return 'スキップ';
    if (card.rank === 7) return '渡し';
    if (card.rank === 8) return '8切り';
    if (card.rank === 10) return '捨て';
    if (card.rank === 11) return 'Jバック';
    if (card.rank === 12) return 'ボンバー';
    return undefined;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Player Header Info Bar & Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl mb-2 backdrop-blur-xs">
        {/* Profile info */}
        <div className="flex items-center gap-2.5">
          <div className="text-2xl p-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            {player.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-100">{player.name}</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${roleColor}`}>
                {roleName}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              手札: <strong className="text-amber-300 font-bold">{player.cards.length}</strong> 枚
              · 累計: <strong className="text-slate-200">{player.score} pt</strong>
            </div>
          </div>
        </div>

        {/* Turn Status Message */}
        <div className="text-xs font-medium">
          {isFinished ? (
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              {player.finishedRank}位で上がり！🎉
            </span>
          ) : player.passed ? (
            <span className="text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full">
              パス中（場が流れるまで待機）
            </span>
          ) : isMyTurn ? (
            <span className="text-amber-300 font-bold bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              あなたのターンです！
            </span>
          ) : (
            <span className="text-slate-400">相手のターンです...</span>
          )}
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-2">
          {selectedCardIds.length > 0 && !isFinished && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              解除
            </button>
          )}

          <button
            type="button"
            disabled={!isMyTurn || player.passed || isFinished}
            onClick={onPass}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isMyTurn && !player.passed && !isFinished
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer active:scale-95'
                : 'bg-slate-900/50 text-slate-600 border border-slate-800/60 cursor-not-allowed'
            }`}
          >
            パス
          </button>

          <button
            type="button"
            disabled={!isValidPlay}
            onClick={onPlaySelected}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isValidPlay
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95 ring-2 ring-amber-400/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{playActionLabel}</span>
          </button>
        </div>
      </div>

      {/* Hand Cards Area */}
      <div className="w-full relative min-h-[110px] sm:min-h-[130px] flex items-center justify-center p-2 bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-x-auto">
        {isFinished ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            すべての手札を出し切りました！対戦相手の決着を見守りましょう。
          </div>
        ) : (
          <div className="flex -space-x-3 sm:-space-x-5 px-3 py-2 items-end justify-center min-w-max">
            {sortedCards.map(card => {
              const isSelected = selectedCardIds.includes(card.id);
              const badge = getCardSpecialBadge(card);

              return (
                <div key={card.id} className="relative transition-transform duration-150">
                  <PlayingCard
                    card={card}
                    selected={isSelected}
                    onClick={() => isMyTurn && !player.passed && onToggleCard(card)}
                    size="lg"
                    badge={badge}
                    disabled={!isMyTurn || player.passed}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
