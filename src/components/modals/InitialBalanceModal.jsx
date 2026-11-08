import React, { useState, useEffect } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { X, Wallet } from 'lucide-react';
import MathAmountInput from '../MathAmountInput';

const InitialBalanceModal = ({ isOpen, onClose }) => {
  const { initialBalance, updateInitialBalance } = useCashFlow();
  const [val, setVal] = useState(initialBalance || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVal(initialBalance || 0);
    }
  }, [isOpen, initialBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateInitialBalance(val);
      onClose();
    } catch (e) {
      alert('Error updating balance: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl shadow-2xl p-6 card-3d">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              Change Initial Cash
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          হিসাব শুরু করার আগে আপনার পকেটে শুরুতে কত ক্যাশ ব্যালেন্স ছিল তা সেট করুন (যোগ, গুণ বা হিসাব লিখতে পারেন)।
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MathAmountInput
            value={val}
            onChange={(newVal) => setVal(newVal)}
            placeholder="0"
            autoFocus
            required
            accentColor="emerald"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 btn-shimmer btn-3d"
            >
              {loading ? 'Saving...' : 'Save Initial Cash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialBalanceModal;
