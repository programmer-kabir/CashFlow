import React, { useState } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../context/CashFlowContext';
import { 
  CalendarClock, 
  Plus, 
  Check, 
  Trash2, 
  CreditCard, 
  X,
  AlertCircle
} from 'lucide-react';

const MonthlyBillsWidget = () => {
  const { subscriptions, paySubscription, addSubscription, deleteSubscription } = useCashFlow();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [category, setCategory] = useState('Bills & Utilities');
  const [wallet, setWallet] = useState('bank');

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const handleAddSub = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    addSubscription({
      name,
      amount: Number(amount),
      dueDay: Number(dueDay) || 1,
      category,
      wallet
    });

    setName('');
    setAmount('');
    setDueDay('5');
    setModalOpen(false);
  };

  return (
    <div className="card-3d bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <CalendarClock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              মাসিক নিয়মিত বিল ও সাবস্ক্রিপশন
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বাসা ভাড়া, বিদ্যুৎ, ইন্টারনেট বিলের অটো-ট্র্যাকার
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন বিল</span>
        </button>
      </div>

      {/* Bills List */}
      {subscriptions.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.07] rounded-2xl">
          <CalendarClock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">কোনো নিয়মিত মাসিক বিল যুক্ত নেই</p>
          <p className="text-[11px] text-slate-400 mt-0.5">"+ নতুন বিল" চাপুন এবং প্রতি মাসের খরচের রিমাইন্ডার পান।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => {
            const isPaid = sub.lastPaidMonth === currentMonthStr;
            return (
              <div
                key={sub.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group ${
                  isPaid
                    ? 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.05] opacity-80'
                    : 'bg-white dark:bg-[#111c33]/40 border-slate-200 dark:border-white/[0.08] shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isPaid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-sky-500/15 text-sky-600'
                  }`}>
                    {isPaid ? <Check className="w-5 h-5 stroke-[2.5]" /> : <CreditCard className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {sub.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                        {sub.wallet ? sub.wallet.toUpperCase() : 'CASH'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      প্রতি মাসের {sub.dueDay} তারিখ • ৳{Number(sub.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {isPaid ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      পরিশোধিত ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => paySubscription(sub.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      পরিশোধ করুন
                    </button>
                  )}

                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    title="বিল মুছে ফেলুন"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl p-6 shadow-2xl relative card-3d">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                নিয়মিত মাসিক বিল যুক্ত করুন
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSub} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  বিলের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বাসা ভাড়া বা ওয়াইফাই বিল"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  টাকার পরিমাণ *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="যেমন: 12000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    মাসের কত তারিখ?
                  </label>
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} তারিখ</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    পেমেন্ট ওয়ালেট
                  </label>
                  <select
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {DEFAULT_WALLETS.map(w => (
                      <option key={w.id} value={w.id}>{w.badge}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                >
                  বিল যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyBillsWidget;

