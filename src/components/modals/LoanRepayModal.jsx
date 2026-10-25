import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { X, Handshake, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const LoanRepayModal = ({ isOpen, onClose, loan }) => {
  const { recordLoanRepayment } = useCashFlow();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !loan) return null;

  const isLent = loan.type === 'lent'; // You lent money to someone, they are returning it to you
  const remaining = Number(loan.remainingAmount ?? loan.totalAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) return;

    setLoading(true);
    try {
      await recordLoanRepayment({
        loanId: loan.id,
        amount: numAmt,
        note,
        date: new Date(date).toISOString()
      });

      confetti({ particleCount: 35, spread: 60 });
      setAmount('');
      setNote('');
      onClose();
    } catch (e) {
      alert('Error recording repayment: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isLent ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {isLent ? 'লোন ফেরত নেওয়া (+ Cash In)' : 'ধার ফেরত দেওয়া (- Cash Out)'}
              </h3>
              <p className="text-xs text-slate-400">
                {loan.personName} • {isLent ? 'পাওনা টাকা ক্যাশে ফেরত আসছে' : 'নেওয়া ধার ক্যাশ থেকে শোধ হচ্ছে'} (বাকি: ৳{remaining.toLocaleString()})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                REPAYMENT AMOUNT <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(remaining.toString())}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Pay Full (৳{remaining.toLocaleString()})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">৳</span>
              <input
                type="number"
                step="any"
                max={remaining}
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold font-mono text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">NOTE / বিবরণ</label>
            <input
              type="text"
              placeholder="e.g. 1st installment, Bank transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">DATE</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
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
              disabled={loading || !amount}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md"
            >
              {loading ? 'Processing...' : 'Confirm Repayment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRepayModal;
