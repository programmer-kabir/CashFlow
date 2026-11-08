import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  PieChart, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  X,
  TrendingDown
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const BudgetManagerWidget = () => {
  const { stats, setCategoryBudget } = useCashFlow();
  const budgetsStatus = stats?.categoryBudgetsStatus || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  const openEdit = (b) => {
    setEditingCategory(b);
    setEditLimit(b.limit.toString());
    setModalOpen(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setCategoryBudget(editingCategory.categoryId, Number(editLimit) || 0);
    setModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="card-3d bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PieChart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              ক্যাটাগরি বাজেট ও ব্যয় নিয়ন্ত্রণ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              মাসিক খরচের সীমা ও ওভারস্পেন্ডিং অ্যানালিটিক্স
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300">
          চলতি মাস
        </span>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgetsStatus.map(b => {
          const isDanger = b.status === 'danger';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.categoryId}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] transition-all hover:border-slate-300 dark:hover:border-white/[0.1] group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {b.name}
                  </span>
                  {isDanger ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      বাজেট পার!
                    </span>
                  ) : isWarning ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      {b.percent}% ব্যবহৃত
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      নিরাপদ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      ৳<AnimatedNumber value={b.spent} />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono"> / ৳{b.limit.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => openEdit(b)}
                    title="বাজেট লিমিট পরিবর্তন করুন"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.07] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isDanger
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                      : isWarning
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, b.percent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>{b.percent}% বাজেট খরচ</span>
                <span>
                  {isDanger
                    ? `৳${(b.spent - b.limit).toLocaleString()} বেশি খরচ হয়েছে`
                    : `৳${b.remaining.toLocaleString()} অবশিষ্ট আছে`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl p-6 shadow-2xl relative card-3d">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                {editingCategory.name} এর মাসিক বাজেট
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  মাসিক বাজেট লিমিট (টাকা) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-600 dark:text-emerald-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    autoFocus
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                >
                  বাজেট আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagerWidget;

