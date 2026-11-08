import React, { useState } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../../context/CashFlowContext';
import { X, ArrowRightLeft, Check, Sparkles } from 'lucide-react';

const TransferWalletModal = ({ isOpen, onClose }) => {
  const { transferWallet, stats } = useCashFlow();
  const [fromWallet, setFromWallet] = useState('cash');
  const [toWallet, setToWallet] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) return;

    if (fromWallet === toWallet) {
      alert('অনুগ্রহ করে দুটি ভিন্ন ওয়ালেট নির্বাচন করুন।');
      return;
    }

    const available = stats?.walletBalances?.[fromWallet] || 0;
    if (numAmt > available) {
      if (!window.confirm(`${fromWallet.toUpperCase()}-এ বর্তমান ব্যালেন্স ৳${available.toLocaleString()}। আপনি কি তবুও ট্রান্সফার সম্পন্ন করতে চান?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await transferWallet({
        fromWallet,
        toWallet,
        amount: numAmt,
        note: note || `${fromWallet.toUpperCase()} থেকে ${toWallet.toUpperCase()} ট্রান্সফার`
      });
      onClose();
      setAmount('');
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden card-3d"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient lights */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ArrowRightLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                ওয়ালেট টু ওয়ালেট ট্রান্সফার
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ক্যাশ, বিকাশ, নগদ বা ব্যাংকের মধ্যে টাকা স্থানান্তর
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* From -> To Selectors */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05]">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                যে ওয়ালেট থেকে যাবে (From)
              </label>
              <select
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-[#111c33] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              >
                {DEFAULT_WALLETS.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.badge} (৳{(stats?.walletBalances?.[w.id] || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                যে ওয়ালেটে জমা হবে (To)
              </label>
              <select
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-[#111c33] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              >
                {DEFAULT_WALLETS.map(w => (
                  <option key={w.id} value={w.id} disabled={w.id === fromWallet}>
                    {w.badge} (৳{(stats?.walletBalances?.[w.id] || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              ট্রান্সফারের পরিমাণ (টাকা) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                ৳
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-lg font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              সংক্ষিপ্ত নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: ব্যাংক থেকে ক্যাশ উত্তোলন বা বিকাশ ক্যাশ ইন"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-shimmer btn-3d"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>ট্রান্সফার সম্পন্ন করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferWalletModal;

