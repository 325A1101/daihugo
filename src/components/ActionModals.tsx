import React, { useState } from 'react';
import { Card, Rank, Player } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { RANKS, getRankLabel } from '../utils/cardUtils';

interface Pass7ModalProps {
  player: Player;
  targetPlayer: Player;
  count: number;
  onConfirm: (selectedCards: Card[]) => void;
}

export const Pass7Modal: React.FC<Pass7ModalProps> = ({
  player,
  targetPlayer,
  count,
  onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (card: Card) => {
    if (selectedIds.includes(card.id)) {
      setSelectedIds(selectedIds.filter(id => id !== card.id));
    } else {
      if (selectedIds.length < count) {
        setSelectedIds([...selectedIds, card.id]);
      }
    }
  };

  const handleConfirm = () => {
    const selected = player.cards.filter(c => selectedIds.includes(c.id));
    if (selected.length === count || selected.length === player.cards.length) {
      onConfirm(selected);
    }
  };

  const canConfirm =
    selectedIds.length === count ||
    (selectedIds.length === player.cards.length && player.cards.length < count);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
            7
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-300">7渡し（ななわたし）発動！</h3>
            <p className="text-xs text-slate-400">
              次のプレイヤー【{targetPlayer.name}】に渡すカードを
              <span className="text-amber-300 font-bold mx-1">{count}枚</span>選んでください
            </p>
          </div>
        </div>

        {/* Hand Cards Selection */}
        <div className="flex flex-wrap gap-2 justify-center max-h-56 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800 mb-5">
          {player.cards.map(card => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <PlayingCard
                key={card.id}
                card={card}
                selected={isSelected}
                onClick={() => toggleSelect(card)}
                size="md"
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            選択中: <span className="text-white font-bold">{selectedIds.length}</span> / {count}枚
          </div>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              canConfirm
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {targetPlayer.name} に渡す
          </button>
        </div>
      </div>
    </div>
  );
};

interface Discard10ModalProps {
  player: Player;
  count: number;
  onConfirm: (selectedCards: Card[]) => void;
}

export const Discard10Modal: React.FC<Discard10ModalProps> = ({
  player,
  count,
  onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (card: Card) => {
    if (selectedIds.includes(card.id)) {
      setSelectedIds(selectedIds.filter(id => id !== card.id));
    } else {
      if (selectedIds.length < count) {
        setSelectedIds([...selectedIds, card.id]);
      }
    }
  };

  const handleConfirm = () => {
    const selected = player.cards.filter(c => selectedIds.includes(c.id));
    if (selected.length === count || selected.length === player.cards.length) {
      onConfirm(selected);
    }
  };

  const canConfirm =
    selectedIds.length === count ||
    (selectedIds.length === player.cards.length && player.cards.length < count);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
            10
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-300">10捨て（じゅうすて）発動！</h3>
            <p className="text-xs text-slate-400">
              手札から墓地に直接破棄するカードを
              <span className="text-blue-300 font-bold mx-1">{count}枚</span>選んでください
            </p>
          </div>
        </div>

        {/* Hand Cards Selection */}
        <div className="flex flex-wrap gap-2 justify-center max-h-56 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800 mb-5">
          {player.cards.map(card => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <PlayingCard
                key={card.id}
                card={card}
                selected={isSelected}
                onClick={() => toggleSelect(card)}
                size="md"
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            選択中: <span className="text-white font-bold">{selectedIds.length}</span> / {count}枚
          </div>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              canConfirm
                ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            カードを捨てる
          </button>
        </div>
      </div>
    </div>
  );
};

interface QBomberModalProps {
  playerHand: Card[];
  onConfirm: (rank: Rank) => void;
}

export const QBomberModal: React.FC<QBomberModalProps> = ({
  playerHand,
  onConfirm,
}) => {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);

  // Count how many of each rank the player holds
  const countByRank: Record<number, number> = {};
  playerHand.forEach(c => {
    countByRank[c.rank] = (countByRank[c.rank] || 0) + 1;
  });

  const bombRanks: Rank[] = [...RANKS, 99]; // 3 to 2, plus Joker

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl">
            💣
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-300">Qボンバー発動！</h3>
            <p className="text-xs text-slate-400">
              指定した数字のカードを<span className="text-rose-400 font-bold">全員の手札から爆破破棄</span>します！
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 mb-3 font-medium">
          爆破する数字を選択（自分が持っていない数字を狙うと有利！）：
        </div>

        <div className="grid grid-cols-5 gap-2 mb-5">
          {bombRanks.map(rank => {
            const myCount = countByRank[rank] || 0;
            const isSelected = selectedRank === rank;
            return (
              <button
                key={rank}
                type="button"
                onClick={() => setSelectedRank(rank)}
                className={`
                  p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer
                  ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30 scale-105'
                      : myCount === 0
                      ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                      : 'bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border-rose-900/60'
                  }
                `}
              >
                <span className="font-extrabold text-base">{getRankLabel(rank)}</span>
                <span className={`text-[10px] ${myCount === 0 ? 'text-slate-400' : 'text-rose-400 font-semibold'}`}>
                  自所持:{myCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {selectedRank !== null ? (
              <span>
                選択: <strong className="text-rose-400 font-bold">{getRankLabel(selectedRank)}</strong> を爆破
              </span>
            ) : (
              '数字を選択してください'
            )}
          </div>
          <button
            type="button"
            disabled={selectedRank === null}
            onClick={() => selectedRank !== null && onConfirm(selectedRank)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedRank !== null
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            ボンバー発動！💥
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExchangeModalProps {
  player: Player;
  targetRoleName: string;
  count: number;
  onConfirm: (selectedCards: Card[]) => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  player,
  targetRoleName,
  count,
  onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (card: Card) => {
    if (selectedIds.includes(card.id)) {
      setSelectedIds(selectedIds.filter(id => id !== card.id));
    } else {
      if (selectedIds.length < count) {
        setSelectedIds([...selectedIds, card.id]);
      }
    }
  };

  const handleConfirm = () => {
    const selected = player.cards.filter(c => selectedIds.includes(c.id));
    if (selected.length === count) {
      onConfirm(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-300">階級カード交換</h3>
            <p className="text-xs text-slate-400">
              {targetRoleName} に渡す不要なカードを
              <span className="text-amber-300 font-bold mx-1">{count}枚</span>選んでください
            </p>
          </div>
        </div>

        {/* Hand Cards Selection */}
        <div className="flex flex-wrap gap-2 justify-center max-h-56 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800 mb-5">
          {player.cards.map(card => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <PlayingCard
                key={card.id}
                card={card}
                selected={isSelected}
                onClick={() => toggleSelect(card)}
                size="md"
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            選択中: <span className="text-white font-bold">{selectedIds.length}</span> / {count}枚
          </div>
          <button
            type="button"
            disabled={selectedIds.length !== count}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedIds.length === count
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            カードを渡す
          </button>
        </div>
      </div>
    </div>
  );
};
