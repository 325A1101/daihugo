import React from 'react';
import { Player, PlayerRole } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { ROLE_NAMES, ROLE_BADGE_COLORS } from '../utils/cardUtils';

interface BotPlayerViewProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right';
}

export const BotPlayerView: React.FC<BotPlayerViewProps> = ({
  player,
  isCurrentTurn,
  position,
}) => {
  const isFinished = player.cards.length === 0;
  const role = player.rank as PlayerRole;
  const roleName = role ? ROLE_NAMES[role] : '平民';
  const roleColor = role ? ROLE_BADGE_COLORS[role] : 'bg-slate-800 text-slate-300 border-slate-700';

  // Card fan limit for display: show at most 6 overlapping cards or count
  const maxDisplay = Math.min(player.cards.length, 6);
  const cardBacks = Array.from({ length: maxDisplay });

  const positionStyles = {
    top: 'flex-col items-center',
    left: 'flex-col sm:flex-row items-center',
    right: 'flex-col sm:flex-row-reverse items-center',
  }[position];

  return (
    <div
      className={`flex ${positionStyles} gap-2 p-2 sm:p-2.5 rounded-2xl transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-amber-500/10 border border-amber-500/40 shadow-lg shadow-amber-500/10'
          : 'bg-slate-900/40 border border-slate-800/80'
      }`}
    >
      {/* Bot Info Profile */}
      <div className="flex flex-col items-center min-w-[76px] sm:min-w-[88px] text-center">
        <div className="relative">
          <div className="text-2xl sm:text-3xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-xs">
            {player.avatar}
          </div>
          {isCurrentTurn && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </div>

        <div className="font-bold text-xs sm:text-sm text-slate-200 mt-1 truncate max-w-[85px]">
          {player.name}
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${roleColor}`}>
            {roleName}
          </span>
        </div>

        {/* Status flags */}
        {isFinished ? (
          <div className="mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
            {player.finishedRank}位 上がり！
          </div>
        ) : player.passed ? (
          <div className="mt-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold">
            パス
          </div>
        ) : (
          <div className="mt-1 text-[11px] font-mono text-slate-300">
            残り <strong className="text-amber-300 font-bold">{player.cards.length}</strong> 枚
          </div>
        )}
      </div>

      {/* Visual Overlapping Card Backs */}
      {!isFinished && (
        <div className="flex -space-x-4 sm:-space-x-5 items-center justify-center py-1">
          {cardBacks.map((_, i) => (
            <div
              key={i}
              className="transition-transform duration-200 hover:-translate-y-1"
              style={{
                transform: `rotate(${(i - maxDisplay / 2) * 4}deg)`,
              }}
            >
              <PlayingCard faceDown size="sm" />
            </div>
          ))}
          {player.cards.length > maxDisplay && (
            <span className="ml-1 text-[10px] font-bold text-slate-400">
              +{player.cards.length - maxDisplay}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
