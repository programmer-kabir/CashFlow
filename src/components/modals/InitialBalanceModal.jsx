import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { X, Wallet } from 'lucide-react';

const InitialBalanceModal = ({ isOpen, onClose }) => {
  const { initialBalance, updateInitialBalance } = useCashFlow();
  const [val, setVal] = useState(initialBalance || 0);
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Change Initial Cash</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Set the opening cash balance you had in your pocket before starting to record transactions.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">৳</span>
            <input
              type="number"
              required
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
            >
              {loading ? 'Saving...' : 'Update Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialBalanceModal;
