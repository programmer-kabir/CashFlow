import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { 
  X, 
  Handshake, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Phone, 
  Calendar, 
  FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AddLoanModal = ({ isOpen, onClose, initialType = 'lent' }) => {
  const { addLoan } = useCashFlow();

  const [loanType, setLoanType] = useState(initialType); // 'lent' (কাউকে দিয়েছি - Cash Out) | 'borrowed' (কারো থেকে নিয়েছি - Cash In)
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync loanType if initialType changes when opened
  React.useEffect(() => {
    if (isOpen) {
      setLoanType(initialType);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const isLent = loanType === 'lent';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0 || !personName.trim()) return;

    setLoading(true);
    try {
      await addLoan({
        type: loanType,
        personName: personName.trim(),
        phone: phone.trim(),
        amount: numAmt,
        note: note.trim(),
        dueDate: dueDate || null
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Reset & close
      setAmount('');
      setPersonName('');
      setPhone('');
      setNote('');
      setDueDate('');
      onClose();
    } catch (err) {
      console.error('Failed to create loan:', err);
      alert('Error creating loan record: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isLent ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {isLent ? 'কাউকে লোন দেওয়া' : 'কারো থেকে লোন নেওয়া'}
              </h3>
              <p className="text-xs text-slate-400">
                {isLent 
                  ? 'আপনার পকেট থেকে টাকা দিলেন (ক্যাশ থেকে বিয়োগ হবে)' 
                  : 'আপনি ধার নিয়ে পকেটে আনলেন (ক্যাশে যোগ হবে)'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Way Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoanType('lent')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              isLent 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs' 
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>কাউকে লোন দিলাম (- Cash Out)</span>
          </button>
          <button
            type="button"
            onClick={() => setLoanType('borrowed')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              !isLent 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs' 
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>লোন নিয়েছি (+ Cash In)</span>
          </button>
        </div>

        {/* Helper Badge Banner */}
        <div className={`px-5 py-2.5 text-xs font-medium border-b flex items-center justify-between ${
          isLent 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        }`}>
          <span>
            {isLent 
              ? '👉 টাকা অন্যকে দিয়েছেন: এটি দেনাদার থেকে পরে পাওনা হিসেবে জমা থাকবে।' 
              : '👉 টাকা ধার এনেছেন: এটি পরবর্তীতে পরিশোধ করার দেনা হিসেবে জমা থাকবে।'}
          </span>
          <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-slate-950/60 text-[11px]">
            {isLent ? '- Cash Out' : '+ Cash In'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              লোনের পরিমাণ (টাকা / BDT) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">৳</span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-2xl text-2xl font-bold font-mono text-white placeholder-slate-600 focus:outline-hidden ${
                  isLent 
                    ? 'border-slate-800 focus:border-rose-500' 
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Person Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isLent ? 'যাকে লোন দিয়েছেন (নাম)' : 'যার থেকে লোন নিয়েছেন (নাম)'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: আবু বকর, কবির"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ফোন নম্বর (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Return Due Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                টাকা ফেরত দেওয়ার সম্ভাব্য তারিখ
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                লোনের কারণ / নোট
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="যেমন: বাইক পার্টস, জরুরী ওষুধ"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || !personName}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                isLent 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : isLent ? 'লোন এন্ট্রি করুন (- Cash Out)' : 'লোন গ্রহণ করুন (+ Cash In)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLoanModal;
