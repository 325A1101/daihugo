import React from 'react';
import { Card, Suit } from '../types/game';
import { getRankLabel, SUIT_SYMBOLS, SUIT_COLORS } from '../utils/cardUtils';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  selected?: boolean;
  playable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  selected = false,
  playable = false,
  disabled = false,
  size = 'md',
  onClick,
  className = '',
  badge,
}) => {
  // Dimensions
  const sizeClasses = {
    sm: 'w-9 h-13 text-[10px] rounded',
    md: 'w-14 h-20 sm:w-16 sm:h-24 text-xs sm:text-sm rounded-lg',
    lg: 'w-16 h-24 sm:w-20 sm:h-30 text-sm sm:text-base rounded-xl',
  }[size];

  if (faceDown || !card) {
    return (
      <div
        className={`relative ${sizeClasses} bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-900 border border-indigo-500/40 shadow-md flex items-center justify-center select-none overflow-hidden ${className}`}
      >
        {/* Card back pattern */}
        <div className="absolute inset-1 border border-indigo-400/20 rounded flex items-center justify-center bg-indigo-950/40">
          <div className="w-4 h-6 border border-indigo-400/30 rotate-45 flex items-center justify-center opacity-60">
            <span className="text-[8px] text-indigo-300">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const isJoker = card.isJoker;
  const rankLabel = getRankLabel(card.rank);
  const symbol = SUIT_SYMBOLS[card.suit];

  const suitColor = isJoker
    ? 'text-purple-600'
    : isRed
    ? 'text-rose-600'
    : 'text-slate-900';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        relative ${sizeClasses}
        bg-gradient-to-b from-white via-slate-50 to-slate-100
        border transition-all duration-150 select-none
        shadow-md flex flex-col justify-between p-1 sm:p-1.5
        ${selected ? '-translate-y-3.5 sm:-translate-y-4 ring-2 ring-amber-400 border-amber-300 shadow-amber-500/30 shadow-lg z-20' : ''}
        ${playable && !selected ? 'hover:-translate-y-1.5 hover:shadow-lg ring-1 ring-emerald-400/70 border-emerald-400/70' : 'border-slate-300/80'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${isJoker ? 'border-purple-300 bg-gradient-to-b from-purple-50 via-white to-purple-50/60' : ''}
        ${className}
      `}
    >
      {/* Top Left Corner */}
      <div className={`flex flex-col items-center leading-none ${suitColor}`}>
        <span className="font-bold tracking-tighter">{rankLabel}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>

      {/* Center Art */}
      <div className={`flex-1 flex items-center justify-center ${suitColor} my-auto`}>
        {isJoker ? (
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-xl">🃏</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-purple-700 tracking-widest mt-0.5">JOKER</span>
          </div>
        ) : (
          <span className="text-xl sm:text-2xl font-semibold opacity-90 drop-shadow-xs">
            {symbol}
          </span>
        )}
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${suitColor}`}>
        <span className="font-bold tracking-tighter">{rankLabel}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>

      {/* Special Rule Badge */}
      {badge && (
        <span className="absolute -top-2 -right-1 px-1 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded shadow-xs">
          {badge}
        </span>
      )}
    </button>
  );
};
