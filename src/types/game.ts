export type Suit = 'spade' | 'heart' | 'diamond' | 'club' | 'joker';

export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 1 | 2 | 99; // 99 for Joker

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isJoker?: boolean;
}

export type PlayerRole = 'daifugo' | 'fugo' | 'heimin' | 'daihinmin';

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  avatar: string;
  cards: Card[];
  rank?: PlayerRole;
  score: number;
  finishedRank?: number; // 1st, 2nd, 3rd, 4th in current round
  passed: boolean;
}

export interface PlayField {
  cards: Card[];
  playerId: string;
  playerName: string;
}

export interface ActionLog {
  id: string;
  text: string;
  type: 'play' | 'pass' | 'special' | 'round';
  timestamp: number;
}

export type SpecialRuleName =
  | '5_skip'
  | '7_pass'
  | '8_cut'
  | '10_discard'
  | 'j_back'
  | 'q_bomber'
  | 'shibari'
  | 'revolution';

export interface PendingSpecialAction {
  type: '7_pass' | '10_discard' | 'q_bomber' | 'exchange';
  playerId: string;
  targetPlayerId?: string;
  count?: number; // e.g., number of cards to pass/discard
  extra?: any;
}
