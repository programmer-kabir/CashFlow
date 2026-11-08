import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { X, Store } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathAmountInput from '../MathAmountInput';

const ShopActionModal = ({ isOpen, onClose, shop, actionType = 'purchase' }) => {
  const { recordShopPurchase, recordShopPayment } = useCashFlow();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !shop) return null;

  const isPurchase = actionType === 'purchase';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) return;

    setLoading(true);
    try {
      if (isPurchase) {
        await recordShopPurchase({
          shopId: shop.id,
          amount: numAmt,
          note,
          date: new Date(date).toISOString()
        });
      } else {
        await recordShopPayment({
          shopId: shop.id,
          amount: numAmt,
          note,
          date: new Date(date).toISOString()
        });
        confetti({ particleCount: 35, spread: 60 });
      }
      setAmount('');
      setNote('');
      onClose();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl shadow-2xl p-6 card-3d">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isPurchase ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {isPurchase ? '+ Credit Purchase (বাকি নেওয়া)' : 'Pay Due (বাকি পরিশোধ)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {shop.name} • Current Due: ৳{shop.currentDue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                AMOUNT (টাকা / BDT) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                (যোগ, বিয়োগ, গুণ, ভাগ বা % লিখুন)
              </span>
            </div>

            <MathAmountInput
              value={amount}
              onChange={(val) => setAmount(val)}
              placeholder="0"
              autoFocus
              required
              accentColor={isPurchase ? 'amber' : 'emerald'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NOTE / বিবরণ</label>
            <input
              type="text"
              placeholder={isPurchase ? "যেমন: চিনি ২ কেজি, চা ও বিস্কুট" : "যেমন: নগদ পরিশোধ"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">DATE</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

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
              disabled={loading || !amount}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer btn-shimmer btn-3d ${
                isPurchase 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {loading ? 'Saving...' : isPurchase ? 'রেকর্ড বাকি (+ Due)' : 'পরিশোধ কনফার্ম (- Pay)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopActionModal;
