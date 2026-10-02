import React from 'react';
import { X, Flame, Shield, ArrowUpDown, SkipForward, Gift, Trash2, Scissors } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      num: '5',
      title: '5スキップ (5 Skip)',
      icon: <SkipForward className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-950/20',
      description:
        '「5」を出すと、出された枚数分だけ次の順番のプレイヤーが強制的にスキップ（飛ば）されます。1枚なら次の1人、ペアなら2人スキップ！',
    },
    {
      num: '7',
      title: '7渡し (7 Pass)',
      icon: <Gift className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/20',
      description:
        '「7」を出したプレイヤーは、自身の手札から好きなカードを出した枚数分選んで、次の順番のプレイヤーに強制的に押し付けることができます。',
    },
    {
      num: '8',
      title: '8切り (8 Cut)',
      icon: <Scissors className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/20',
      description:
        '「8」が出された瞬間、場のカードが即座に流れて親の番になり、8を出したプレイヤーが新たに自由にカードを出せます（Jバックや縛りもリセット）。',
    },
    {
      num: '10',
      title: '10捨て (10 Discard)',
      icon: <Trash2 className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-950/20',
      description:
        '「10」を出したプレイヤーは、自身の手札から不要なカードを出した枚数分、直接墓地に破棄（捨て）して手札を一気に減らすことができます。',
    },
    {
      num: 'J',
      title: 'Jバック (Jack Back)',
      icon: <ArrowUpDown className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-950/20',
      description:
        '「J (11)」が出されると、場が流れるまでの間、カードの強さが一時的に完全逆転！「3」が最強、「2」が最弱になります。',
    },
    {
      num: 'Q',
      title: 'Qボンバー (Queen Bomber)',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-950/20',
      description:
        '「Q (12)」を出したプレイヤーは、好きな数字（3〜2、JOKER）を1つコール！自分を含む全員の手札から、その数字のカードがすべて即座に爆破・墓地破棄されます！',
    },
    {
      num: '縛',
      title: 'マーク縛り (Suit Lock)',
      icon: <Shield className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/30 bg-orange-950/20',
      description:
        '場に出ているカードと同じマーク（スート）が連続して出された場合、縛りが発生！場が流れるまで、そのマークのカードしか出せなくなります。',
    },
    {
      num: '革',
      title: '革命 (Revolution)',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: 'border-rose-500/40 bg-rose-950/30',
      description:
        '同じ数字のカードを4枚同時に出すと【革命】が発生！そのラウンドが終了するか、再度4枚出しで【革命返し】が起きるまでカードの強さが永続反転（3が最強、2が最弱）します。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">大富豪</span> ルール解説
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              有効な特殊効果とルール一覧（革命・7大特殊ルール）
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-amber-400">【基本ルール】</span>
            通常時のカード強さ: <strong>3 &lt; 4 ... &lt; K &lt; A &lt; 2 &lt; JOKER</strong>
            （※スペードの3は単体JOKERに勝てます）。カードを最も早く出し切った人が「大富豪」となります。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map(rule => (
              <div
                key={rule.num}
                className={`p-3.5 rounded-xl border ${rule.color} flex flex-col gap-2`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0">
                    {rule.num}
                  </div>
                  <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    {rule.icon}
                    {rule.title}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
