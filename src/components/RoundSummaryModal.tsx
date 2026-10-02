import React, { useEffect } from 'react';
import { Player, PlayerRole } from '../types/game';
import { ROLE_NAMES, ROLE_BADGE_COLORS } from '../utils/cardUtils';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';

interface RoundSummaryModalProps {
  round: number;
  players: Player[];
  onNextRound: () => void;
  onResetGame: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  round,
  players,
  onNextRound,
  onResetGame,
}) => {
  // Find human player rank
  const human = players.find(p => !p.isBot);
  const isHumanDaifugo = human?.rank === 'daifugo';

  useEffect(() => {
    if (isHumanDaifugo) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isHumanDaifugo]);

  // Sort players by finished rank for display (1st to 4th)
  const sorted = [...players].sort((a, b) => (a.finishedRank || 4) - (b.finishedRank || 4));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">第 {round} ラウンド 決着！</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isHumanDaifugo
              ? 'お見事！あなたが見事【大富豪】の座を勝ち取りました！'
              : '激戦が終了しました！階級に応じたカード交換へ進みます。'}
          </p>
        </div>

        {/* Player Ranks List */}
        <div className="space-y-2.5 mb-6">
          {sorted.map(p => {
            const role = p.rank as PlayerRole;
            const roleName = role ? ROLE_NAMES[role] : '平民';
            const badgeColor = role ? ROLE_BADGE_COLORS[role] : 'bg-slate-800 text-slate-300';
            const isMe = !p.isBot;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-slate-400 text-sm">
                    {p.finishedRank}位
                  </span>
                  <div className="text-2xl">{p.avatar}</div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {p.name}
                      {isMe && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-sm font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      累計得点: <span className="font-semibold text-slate-200">{p.score} pt</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${badgeColor}`}
                  >
                    {roleName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onResetGame}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            初めからやり直す
          </button>

          <button
            type="button"
            onClick={onNextRound}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            次へ（カード交換・第{round + 1}R）
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
