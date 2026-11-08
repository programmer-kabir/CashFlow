import React, { useState } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../context/CashFlowContext';
import { 
  Target, 
  Plus, 
  Trash2, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Bike, 
  Car, 
  Laptop, 
  Home, 
  Check, 
  X,
  Coins
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const SavingsGoalsWidget = () => {
  const { savingsGoals, addSavingsGoal, depositToSavingsGoal, deleteSavingsGoal } = useCashFlow();
  const [modalOpen, setModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositWallet, setDepositWallet] = useState('cash');

  // New goal state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    addSavingsGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: targetDate || null,
      color: selectedColor
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setModalOpen(false);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const numAmt = Number(depositAmount);
    if (!numAmt || numAmt <= 0) return;

    await depositToSavingsGoal(depositGoalId, numAmt, depositWallet);
    setDepositGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="card-3d bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              সেভিংস গোল ও ড্রিম প্ল্যানার
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ভবিষ্যতের স্বপ্ন ও সঞ্চয়ের ৩ডি প্রগ্রেস ট্র্যাকার
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন গোল</span>
        </button>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.07] rounded-2xl">
          <Target className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">কোনো সেভিংস গোল নেই</p>
          <p className="text-[11px] text-slate-400 mt-0.5">"+ নতুন গোল" চাপুন এবং আপনার স্বপ্নের সঞ্চয় ট্র্যাক করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map(goal => {
            const target = Number(goal.targetAmount) || 1;
            const current = Number(goal.currentAmount) || 0;
            const percent = Math.min(100, Math.round((current / target) * 100));
            const remaining = Math.max(0, target - current);

            return (
              <div
                key={goal.id}
                className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 card-interactive relative group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: goal.color || '#10b981' }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        টার্গেট: ৳{target.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    title="গোল মুছে ফেলুন"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar & Percent */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      সঞ্চয়: ৳<AnimatedNumber value={current} />
                    </span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {percent}%
                    </span>
                  </div>

                  {/* 3D Progress Bar Track */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-xs"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: goal.color || '#10b981',
                        boxShadow: `0 0 10px ${goal.color || '#10b981'}88`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {percent >= 100 ? '🎉 লক্ষ্য অর্জিত হয়েছে!' : `আর মাত্র ৳${remaining.toLocaleString()} বাকি`}
                    </span>

                    <button
                      onClick={() => setDepositGoalId(goal.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3" />
                      <span>টাকা জমান</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl p-6 shadow-2xl relative card-3d">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                নতুন সেভিংস গোল যুক্ত করুন
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  গোলের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নতুন ল্যাপটপ বা বাইক"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  টার্গেট টাকার পরিমাণ *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="যেমন: 50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  বর্তমানে জমা আছে (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  পছন্দের থিম কালার
                </label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                >
                  গোল সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit to Goal Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl p-6 shadow-2xl relative card-3d">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                সেভিংসে টাকা জমা করুন
              </h4>
              <button onClick={() => setDepositGoalId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  যে ওয়ালেট থেকে যাবে
                </label>
                <select
                  value={depositWallet}
                  onChange={(e) => setDepositWallet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {DEFAULT_WALLETS.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.badge})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  টাকার পরিমাণ *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-600 dark:text-emerald-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    autoFocus
                    placeholder="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!depositAmount}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  সঞ্চয় কনফার্ম করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsWidget;

