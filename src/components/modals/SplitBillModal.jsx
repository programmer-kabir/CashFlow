import React, { useState } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../../context/CashFlowContext';
import { 
  Users, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Coins, 
  ArrowRight,
  Handshake,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SplitBillModal = ({ isOpen, onClose }) => {
  const { addTransaction, addLoan, contacts } = useCashFlow();

  const [billTitle, setBillTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [wallet, setWallet] = useState('cash');
  const [includeMe, setIncludeMe] = useState(true);
  const [people, setPeople] = useState([
    { id: 1, name: 'বন্ধু ১' },
    { id: 2, name: 'বন্ধু ২' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Add person
  const addPerson = () => {
    setPeople(prev => [...prev, { id: Date.now(), name: `বন্ধু ${prev.length + 1}` }]);
  };

  // Remove person
  const removePerson = (id) => {
    if (people.length <= 1) return;
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  // Update person name
  const updatePersonName = (id, name) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  // Calculations
  const numTotal = Number(totalAmount) || 0;
  const totalHeads = people.length + (includeMe ? 1 : 0);
  const perPersonShare = totalHeads > 0 ? Math.round(numTotal / totalHeads) : 0;
  const myShare = includeMe ? perPersonShare : 0;
  const toCollectTotal = numTotal - myShare;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numTotal || numTotal <= 0) return;

    setIsSubmitting(true);
    try {
      // 1. Record total payment out from the selected wallet
      await addTransaction({
        type: 'cash_out',
        subType: 'real_expense',
        wallet,
        category: 'Party & Dine Out',
        amount: numTotal,
        note: `বিল পরিশোধ: ${billTitle || 'আড্ডার বিল ভাগাভাগি'} (মোট: ৳${numTotal.toLocaleString()})`
      });

      // 2. Automatically record each friend's share as a Loan Given (To Receive)
      for (const p of people) {
        if (perPersonShare > 0) {
          await addLoan({
            type: 'lent',
            personName: p.name.trim(),
            amount: perPersonShare,
            note: `${billTitle || 'বিল স্প্লিট'} এর শেয়ার`,
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString() // 3 days default
          });
        }
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
      setBillTitle('');
      setTotalAmount('');
    } catch (err) {
      console.error(err);
      alert('Error splitting bill: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden card-3d relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                আড্ডার বিল ভাগাভাগি (Split Bill)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বন্ধুদের সাথে রেস্টুরেন্ট বা ট্যুরের খরচ সমান ভাগে ভাগ করুন
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Bill Title & Total Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                বিল বা উপলক্ষের নাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: পাঁচ ভাই রেস্টুরেন্টে ডিনার"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                মোট বিলের পরিমাণ (টাকা) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-rose-500">৳</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Wallet Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              আপনি কোন ওয়ালেট থেকে পুরো বিল দিয়েছেন?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_WALLETS.map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWallet(w.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    wallet === w.id
                      ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {w.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Include myself checkbox */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              এই বিলে আপনার নিজের অংশও কি অন্তর্ভুক্ত?
            </span>
            <input
              type="checkbox"
              checked={includeMe}
              onChange={(e) => setIncludeMe(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer accent-rose-600"
            />
          </div>

          {/* People List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                যাদের মাঝে ভাগ হবে ({people.length} জন বন্ধু)
              </label>
              <button
                type="button"
                onClick={addPerson}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ বন্ধু যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {people.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs text-slate-400 font-bold">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder="বন্ধুর নাম"
                    value={p.name}
                    onChange={(e) => updatePersonName(p.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                  />
                  {people.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerson(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Calculation Result Preview Card */}
          {numTotal > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200">
                <span>প্রতি জনের সমান অংশ:</span>
                <span className="font-mono text-base font-extrabold">৳{perPersonShare.toLocaleString()}</span>
              </div>
              {includeMe && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>আপনার নিজের খরচ (Cash Out):</span>
                  <span className="font-mono font-bold">৳{myShare.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-rose-500/20">
                <span>বন্ধুদের থেকে মোট পাওনা (To Receive):</span>
                <span className="font-mono font-extrabold">৳{toCollectTotal.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                * সেভ বাটনে চাপলে স্বয়ংক্রিয়ভাবে বন্ধুদের নামের পাশে ধার হিসাব যুক্ত হয়ে যাবে।
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !numTotal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 btn-shimmer btn-3d flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>বিল স্প্লিট ও ধার রেকর্ড করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitBillModal;

