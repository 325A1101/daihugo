import React from 'react';
import { X, History } from 'lucide-react';
import { ActionLog } from '../types/game';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActionLog[];
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">ゲーム対戦ログ（棋譜）</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
          {logs.length === 0 ? (
            <div className="text-center text-slate-500 py-8">まだ記録がありません</div>
          ) : (
            logs.map(log => {
              const colorClass =
                log.type === 'special'
                  ? 'bg-amber-950/30 text-amber-200 border-amber-500/30 font-semibold'
                  : log.type === 'round'
                  ? 'bg-indigo-950/40 text-indigo-200 border-indigo-500/30 font-bold'
                  : log.type === 'pass'
                  ? 'bg-slate-950/30 text-slate-400 border-slate-800'
                  : 'bg-slate-950/50 text-slate-200 border-slate-800';

              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${colorClass}`}
                >
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span>{log.text}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
