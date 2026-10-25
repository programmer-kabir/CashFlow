import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  User, 
  FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const QuickEntryModal = ({ isOpen, onClose, defaultType = 'cash_out' }) => {
  const { categories, addTransaction } = useCashFlow();

  const [activeMode, setActiveMode] = useState(defaultType === 'cash_in' ? 'cash_in' : 'cash_out');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [personName, setPersonName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Sync mode if defaultType changes
  React.useEffect(() => {
    if (isOpen) {
      const mode = defaultType === 'cash_in' ? 'cash_in' : 'cash_out';
      setActiveMode(mode);
      setCategory(mode === 'cash_in' ? 'Salary' : 'Food & Groceries');
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const isCashOut = activeMode === 'cash_out';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) return;

    setLoading(true);
    try {
      if (isCashOut) {
        await addTransaction({
          type: 'cash_out',
          subType: 'real_expense',
          category: category || 'Food & Groceries',
          amount: numAmt,
          personName: personName.trim(),
          note: note.trim(),
          date: new Date(date).toISOString()
        });
      } else {
        await addTransaction({
          type: 'cash_in',
          subType: 'real_income',
          category: category || 'Salary',
          amount: numAmt,
          personName: personName.trim(),
          note: note.trim(),
          date: new Date(date).toISOString()
        });
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Reset & close
      setAmount('');
      setNote('');
      setPersonName('');
      onClose();
    } catch (err) {
      console.error('Failed to add entry:', err);
      alert('Error saving record: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Quick Cash Entry</h3>
            <p className="text-xs text-slate-400">দৈনন্দিন আয় ও খরচের দ্রুত হিসাব লিপিবদ্ধ করুন</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean 2-Tab Switcher (- Cash Out vs + Cash In) */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setActiveMode('cash_out'); setCategory('Food & Groceries'); }}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              isCashOut 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs' 
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowUpRight className="w-5 h-5 text-rose-400" />
            <span className="font-bold">- Cash Out (খরচ)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('cash_in'); setCategory('Salary'); }}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              !isCashOut 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs' 
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">+ Cash In (আয়)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              AMOUNT (টাকা / BDT) <span className="text-rose-400">*</span>
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
                  isCashOut 
                    ? 'border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              CATEGORY / ক্যাটাগরি
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-hidden focus:border-emerald-500"
            >
              {isCashOut ? (
                categories.expense.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
              ) : (
                categories.income.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
              )}
            </select>
          </div>

          {/* Person / Contact (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              PERSON / SOURCE (ঐচ্ছিক)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="যেমন: অফিস, ফ্রেন্ড, বাজার"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">DATE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">NOTE / বিবরণ</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="যেমন: দুপুরের খাবার, রিকশা ভাড়া"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
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
              disabled={loading || !amount}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                isCashOut 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {loading ? 'Saving...' : isCashOut ? 'খরচ এন্ট্রি করুন (- Out)' : 'আয় এন্ট্রি করুন (+ In)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickEntryModal;
