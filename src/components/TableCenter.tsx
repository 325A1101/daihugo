import React from 'react';
import { Card, Suit } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { SUIT_NAMES, SUIT_SYMBOLS } from '../utils/cardUtils';
import { ArrowUpDown, Shield, Flame, Trash2 } from 'lucide-react';

interface TableCenterProps {
  tableCards: Card[] | null;
  lastPlayerName: string | null;
  isRevolution: boolean;
  isJBack: boolean;
  shibariSuits: Suit[] | null;
  discardCount: number;
  specialNotice: string | null;
}

export const TableCenter: React.FC<TableCenterProps> = ({
  tableCards,
  lastPlayerName,
  isRevolution,
  isJBack,
  shibariSuits,
  discardCount,
  specialNotice,
}) => {
  return (
    <div className="relative w-full max-w-xl h-52 sm:h-60 rounded-3xl bg-radial from-emerald-900/90 via-emerald-950 to-slate-950 border border-emerald-500/20 shadow-2xl flex flex-col items-center justify-center p-3 overflow-hidden">
      {/* Decorative Felt Table Texture & Watermark */}
      <div className="absolute inset-2 border border-emerald-400/10 rounded-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0,transparent_70%)] pointer-events-none" />

      {/* Discard Pile indicator (Top Right) */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[11px] text-emerald-300/70 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <Trash2 className="w-3 h-3 text-emerald-400" />
        <span>墓地: <strong className="font-mono text-emerald-200">{discardCount}</strong>枚</span>
      </div>

      {/* Active Special Status Banners (Top Center) */}
      <div className="absolute top-3 left-4 flex flex-wrap items-center gap-2 z-10">
        {isRevolution && (
          <div className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-950/50 animate-pulse">
            <span className="text-xs">🚩</span>
            <span>革命中 {isJBack ? '(Jバックで通常強度に一時反転)' : '(3最強・2最弱)'}</span>
          </div>
        )}

        {!isRevolution && isJBack && (
          <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-md animate-pulse">
            <ArrowUpDown className="w-3 h-3 text-purple-400" />
            <span>Jバック中 (3最強・2最弱)</span>
          </div>
        )}

        {shibariSuits && shibariSuits.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-md">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>
              マーク縛り [
              {shibariSuits.map(s => `${SUIT_SYMBOLS[s]} ${SUIT_NAMES[s]}`).join(', ')}
              ]
            </span>
          </div>
        )}
      </div>

      {/* Active Flash Notice Toast */}
      {specialNotice && (
        <div className="absolute top-12 z-30 px-4 py-1.5 rounded-full bg-slate-900/95 border border-amber-400/80 text-amber-300 font-bold text-xs sm:text-sm shadow-xl animate-in fade-in zoom-in-90 duration-150 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{specialNotice}</span>
        </div>
      )}

      {/* Center Table Cards */}
      <div className="flex flex-col items-center justify-center my-auto z-10">
        {tableCards && tableCards.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {tableCards.map((card, idx) => {
                // Slight fan angle
                const rotateDeg = (idx - (tableCards.length - 1) / 2) * 5;
                return (
                  <div
                    key={card.id}
                    style={{ transform: `rotate(${rotateDeg}deg)` }}
                    className="transition-transform duration-200"
                  >
                    <PlayingCard card={card} size="lg" disabled />
                  </div>
                );
              })}
            </div>
            {lastPlayerName && (
              <div className="mt-2 text-[11px] text-emerald-200/80 font-medium">
                {lastPlayerName} が場に出しました
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-400/40 py-6">
            <div className="w-16 h-24 border-2 border-dashed border-emerald-500/20 rounded-xl flex items-center justify-center mb-1">
              <span className="text-xl opacity-30">🂠</span>
            </div>
            <span className="text-xs font-medium tracking-wide">場は流れています（自由にカードを出せます）</span>
          </div>
        )}
      </div>
    </div>
  );
};
