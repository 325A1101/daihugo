import { Card, Rank, Suit, PlayerRole, Player } from '../types/game';

export const SUITS: Suit[] = ['spade', 'heart', 'diamond', 'club'];
export const RANKS: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
  joker: '★',
};

export const SUIT_NAMES: Record<Suit, string> = {
  spade: 'スペード',
  heart: 'ハート',
  diamond: 'ダイヤ',
  club: 'クラブ',
  joker: 'ジョーカー',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spade: 'text-slate-900',
  heart: 'text-rose-600',
  diamond: 'text-rose-600',
  club: 'text-slate-900',
  joker: 'text-purple-600',
};

export const ROLE_NAMES: Record<PlayerRole, string> = {
  daifugo: '大富豪',
  fugo: '富豪',
  heimin: '貧民',
  daihinmin: '大貧民',
};

export const ROLE_BADGE_COLORS: Record<PlayerRole, string> = {
  daifugo: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  fugo: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  heimin: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  daihinmin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

export function getRankLabel(rank: Rank): string {
  if (rank === 99) return 'JOKER';
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return rank.toString();
}

/**
 * Standard strength value of card
 * Normal: 3(3) ... 10(10), J(11), Q(12), K(13), A(14), 2(15), Joker(16)
 * Inverted (革命 / J-back): 2(3), A(4), K(5), Q(6), J(7), 10(8), 9(9), 8(10), 7(11), 6(12), 5(13), 4(14), 3(15), Joker(16)
 */
export function getRankStrength(rank: Rank, isInverted: boolean): number {
  if (rank === 99) return 16; // Joker is always highest (or wild)

  if (!isInverted) {
    if (rank === 1) return 14;
    if (rank === 2) return 15;
    return rank; // 3 to 13
  } else {
    // Inverted: 3 is 15, 4 is 14, ..., 2 is 3
    if (rank === 2) return 3;
    if (rank === 1) return 4;
    if (rank === 13) return 5;
    if (rank === 12) return 6;
    if (rank === 11) return 7;
    if (rank === 10) return 8;
    if (rank === 9) return 9;
    if (rank === 8) return 10;
    if (rank === 7) return 11;
    if (rank === 6) return 12;
    if (rank === 5) return 13;
    if (rank === 4) return 14;
    if (rank === 3) return 15;
    return rank;
  }
}

/**
 * Create a fresh 53-card deck (52 standard cards + 1 Joker)
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 1;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `card-${id++}`,
        suit,
        rank,
        isJoker: false,
      });
    }
  }
  // Add 1 Joker
  deck.push({
    id: `card-${id++}`,
    suit: 'joker',
    rank: 99,
    isJoker: true,
  });
  return deck;
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sort hand cards by strength
 */
export function sortCards(cards: Card[], isJBack: boolean = false): Card[] {
  return [...cards].sort((a, b) => {
    const valA = getRankStrength(a.rank, isJBack);
    const valB = getRankStrength(b.rank, isJBack);
    if (valA !== valB) return valA - valB;
    // Secondary sort by suit
    const suitOrder: Record<Suit, number> = { spade: 4, heart: 3, diamond: 2, club: 1, joker: 5 };
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

/**
 * Check if a selection of cards is a valid combination
 * Returns effective rank or null if invalid
 */
export function getCombinationRank(cards: Card[]): Rank | null {
  if (cards.length === 0) return null;
  if (cards.length === 1) return cards[0].rank;

  // For multi-card (pair, triple, quad):
  // Either all cards share the same rank, or all non-Joker cards share the same rank
  const nonJokers = cards.filter(c => !c.isJoker);
  if (nonJokers.length === 0) {
    // Only jokers? If 1 joker it handled above; multiple jokers would be same
    return 99;
  }

  const firstRank = nonJokers[0].rank;
  const allSame = nonJokers.every(c => c.rank === firstRank);
  return allSame ? firstRank : null;
}

/**
 * Checks if played cards are strictly higher than table cards
 */
export function canBeatTable(
  playedCards: Card[],
  tableCards: Card[] | null,
  isJBack: boolean,
  shibariSuits: Suit[] | null
): boolean {
  if (playedCards.length === 0) return false;

  const playedRank = getCombinationRank(playedCards);
  if (playedRank === null) return false;

  // Shibari check
  if (shibariSuits && shibariSuits.length > 0) {
    // Each non-joker played card must match one of the shibari suits
    const nonJokers = playedCards.filter(c => !c.isJoker);
    const validSuits = nonJokers.every(c => shibariSuits.includes(c.suit));
    if (!validSuits) return false;
  }

  // If table is empty, any valid combination can be played
  if (!tableCards || tableCards.length === 0) {
    return true;
  }

  // Count must match
  if (playedCards.length !== tableCards.length) {
    return false;
  }

  const tableRank = getCombinationRank(tableCards);
  if (tableRank === null) return true;

  // Special rule: Spade 3 beats single Joker (スペ3返し)
  if (
    tableCards.length === 1 &&
    tableCards[0].isJoker &&
    playedCards.length === 1 &&
    playedCards[0].suit === 'spade' &&
    playedCards[0].rank === 3
  ) {
    return true;
  }

  const playedVal = getRankStrength(playedRank, isJBack);
  const tableVal = getRankStrength(tableRank, isJBack);

  return playedVal > tableVal;
}

/**
 * Check if the newly played cards trigger Shibari (マーク縛り)
 * Triggers when the played cards have the exact same suit(s) as the previous table play
 */
export function checkShibariTrigger(
  newCards: Card[],
  prevCards: Card[] | null
): Suit[] | null {
  if (!prevCards || prevCards.length === 0 || newCards.length === 0) return null;
  if (prevCards.length !== newCards.length) return null;

  // Get non-joker suits
  const prevSuits = prevCards
    .filter(c => !c.isJoker)
    .map(c => c.suit)
    .sort();
  const newSuits = newCards
    .filter(c => !c.isJoker)
    .map(c => c.suit)
    .sort();

  if (prevSuits.length === 0 || newSuits.length === 0) return null;

  // Check if they match
  const matches =
    prevSuits.length === newSuits.length &&
    prevSuits.every((s, i) => s === newSuits[i]);

  if (matches) {
    return Array.from(new Set(newSuits));
  }

  return null;
}

/**
 * Find all playable combinations from a hand
 */
export function getPlayableCombinations(
  hand: Card[],
  tableCards: Card[] | null,
  isJBack: boolean,
  shibariSuits: Suit[] | null
): Card[][] {
  const playable: Card[][] = [];
  const requiredCount = tableCards ? tableCards.length : null;

  // Single cards
  if (requiredCount === null || requiredCount === 1) {
    for (const card of hand) {
      if (canBeatTable([card], tableCards, isJBack, shibariSuits)) {
        playable.push([card]);
      }
    }
  }

  // Pairs
  if (requiredCount === null || requiredCount === 2) {
    const pairs = findSetsOfSize(hand, 2);
    for (const pair of pairs) {
      if (canBeatTable(pair, tableCards, isJBack, shibariSuits)) {
        playable.push(pair);
      }
    }
  }

  // Triples
  if (requiredCount === null || requiredCount === 3) {
    const triples = findSetsOfSize(hand, 3);
    for (const triple of triples) {
      if (canBeatTable(triple, tableCards, isJBack, shibariSuits)) {
        playable.push(triple);
      }
    }
  }

  // Quads
  if (requiredCount === null || requiredCount === 4) {
    const quads = findSetsOfSize(hand, 4);
    for (const quad of quads) {
      if (canBeatTable(quad, tableCards, isJBack, shibariSuits)) {
        playable.push(quad);
      }
    }
  }

  return playable;
}

function findSetsOfSize(hand: Card[], size: number): Card[][] {
  const results: Card[][] = [];
  const jokers = hand.filter(c => c.isJoker);
  const rankGroups: Record<number, Card[]> = {};

  for (const card of hand) {
    if (!card.isJoker) {
      if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
      rankGroups[card.rank].push(card);
    }
  }

  for (const rank in rankGroups) {
    const group = rankGroups[rank];
    if (group.length >= size) {
      // Pick combinations of size from group
      const combs = getCombinations(group, size);
      results.push(...combs);
    } else if (jokers.length > 0 && group.length + jokers.length >= size) {
      // With Joker
      const neededJokers = size - group.length;
      if (neededJokers <= jokers.length) {
        const combo = [...group, ...jokers.slice(0, neededJokers)];
        results.push(combo);
      }
    }
  }

  return results;
}

function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map(item => [item]);
  if (size === array.length) return [array];
  if (size > array.length) return [];

  const head = array[0];
  const tail = array.slice(1);
  const withHead = getCombinations(tail, size - 1).map(comb => [head, ...comb]);
  const withoutHead = getCombinations(tail, size);
  return [...withHead, ...withoutHead];
}

/**
 * Intelligent AI Decision Maker for Daifugo
 */
export function chooseBotMove(
  hand: Card[],
  tableCards: Card[] | null,
  isJBack: boolean,
  shibariSuits: Suit[] | null,
  _activeOpponentsCount: number
): Card[] | null {
  const playable = getPlayableCombinations(hand, tableCards, isJBack, shibariSuits);
  if (playable.length === 0) return null; // Pass

  // If table is empty, bot prefers:
  // 1. Multiple cards (pairs/triples) starting from lowest value
  // 2. Special cards like 8 or 5 strategically
  // 3. Lowest single card
  if (!tableCards || tableCards.length === 0) {
    // Sort playable by card count descending, then by strength ascending
    playable.sort((a, b) => {
      if (b.length !== a.length) return b.length - a.length;
      const rankA = getCombinationRank(a) ?? 3;
      const rankB = getCombinationRank(b) ?? 3;
      return getRankStrength(rankA, isJBack) - getRankStrength(rankB, isJBack);
    });
    return playable[0];
  }

  // If table has cards:
  // Prefer lowest beating card to preserve stronger cards
  // Check if 8-cut is available and hand is large
  const eightPlay = playable.find(p => p.some(c => c.rank === 8));
  if (eightPlay && hand.length <= 4) {
    // Great opportunity to 8-cut and win or advance!
    return eightPlay;
  }

  // Otherwise, play the lowest strength combination that beats table
  playable.sort((a, b) => {
    const rankA = getCombinationRank(a) ?? 3;
    const rankB = getCombinationRank(b) ?? 3;
    return getRankStrength(rankA, isJBack) - getRankStrength(rankB, isJBack);
  });

  // If lowest play is a Joker and table isn't that high, bot might pass rather than waste Joker
  const chosen = playable[0];
  if (chosen.length === 1 && chosen[0].isJoker && hand.length > 3) {
    const tableRank = getCombinationRank(tableCards) ?? 3;
    const tableVal = getRankStrength(tableRank, isJBack);
    if (tableVal < 12) {
      // Don't waste solo Joker on a weak card if you have many cards left
      return null;
    }
  }

  return chosen;
}

/**
 * Helper to select cards to pass for 7-渡し or card exchange
 * Bot selects their lowest strength cards
 */
export function botSelectWorstCards(cards: Card[], count: number, isJBack: boolean = false): Card[] {
  const sorted = sortCards(cards, isJBack);
  return sorted.slice(0, count);
}

/**
 * Helper to select cards for 10-捨て
 * Bot chooses isolated low rank singles
 */
export function botSelectCardsToDiscard(cards: Card[], count: number, isJBack: boolean = false): Card[] {
  const sorted = sortCards(cards, isJBack);
  return sorted.slice(0, count);
}

/**
 * Bot smart choice for Q-Bomber:
 * Chooses a high rank that the bot itself DOES NOT have!
 */
export function botChooseQBomberRank(botHand: Card[]): Rank {
  const myRanks = new Set(botHand.map(c => c.rank));
  // Threat ranking in normal mode: 2, 99 (Joker), 1 (A), 13 (K), 8, 7, etc.
  const threatPriorities: Rank[] = [2, 99, 1, 13, 8, 7, 10, 5, 3, 4, 6, 9];

  for (const rank of threatPriorities) {
    if (!myRanks.has(rank)) {
      return rank;
    }
  }

  // Fallback to rank 2 or 1
  return 2;
}
