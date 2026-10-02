import React from 'react';
import { Volume2, VolumeX, Zap, BookOpen, RotateCcw, ListOrdered } from 'lucide-react';

interface HeaderProps {
  round: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  fastSpeed: boolean;
  onToggleSpeed: () => void;
  onOpenRules: () => void;
  onOpenLogs: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  round,
  soundEnabled,
  onToggleSound,
  fastSpeed,
  onToggleSpeed,
  onOpenRules,
  onOpenLogs,
  onResetGame,
}) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 font-serif">
          大富豪 極
        </span>
        <span className="hidden sm:inline text-xs font-medium text-amber-400/80 border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 rounded">
          第 {round} 回戦
        </span>
      </div>

      {/* Zone 2: Navigation / Modal links */}
      <nav className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-300">
        <button
          type="button"
          onClick={onOpenRules}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-800/60"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>7大ルール</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogs}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-800/60"
        >
          <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
          <span>棋譜履歴</span>
        </button>
      </nav>

      {/* Zone 3: Primary actions / settings */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSpeed}
          title={fastSpeed ? '進行速度: 高速' : '進行速度: 通常'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            fastSpeed
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{fastSpeed ? '高速' : '通常'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? '効果音: ON' : '効果音: OFF'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onResetGame}
          title="新規ゲーム"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
