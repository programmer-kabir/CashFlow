import React, { useState, useEffect, useRef } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../../context/CashFlowContext';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  User, 
  FileText,
  Wallet,
  Mic,
  MicOff,
  Sparkles,
  Calculator,
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { startSpeechToText } from '../../utils/voiceRecognition';
import { evaluateMathExpression } from '../../utils/mathParser';
import { compressReceiptImage } from '../../utils/imageCompressor';
import MathAmountInput from '../MathAmountInput';

const QuickEntryModal = ({ isOpen, onClose, defaultType = 'cash_out' }) => {
  const { categories, addTransaction } = useCashFlow();

  const [activeMode, setActiveMode] = useState(defaultType === 'cash_in' ? 'cash_in' : 'cash_out');
  const [wallet, setWallet] = useState('cash');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [personName, setPersonName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [mathPreview, setMathPreview] = useState(null);
  const recognitionRef = useRef(null);

  // Sync mode if defaultType changes
  useEffect(() => {
    if (isOpen) {
      const mode = defaultType === 'cash_in' ? 'cash_in' : 'cash_out';
      setActiveMode(mode);
      setCategory(mode === 'cash_in' ? 'Salary' : 'Food & Groceries');
      setVoiceError('');
      setVoiceTranscript('');
      setMathPreview(null);

      // Auto start voice if requested as 'voice'
      if (defaultType === 'voice') {
        setTimeout(() => {
          handleToggleVoice();
        }, 300);
      }
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    }
  }, [isOpen, defaultType]);

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setVoiceError('');
    setVoiceTranscript('');

    const rec = startSpeechToText({
      onListening: () => {
        setIsListening(true);
      },
      onResult: (parsed, transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (parsed) {
          if (parsed.type) setActiveMode(parsed.type);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.amount) setAmount(parsed.amount.toString());
          if (parsed.personName) setPersonName(parsed.personName);
          if (parsed.note) setNote(parsed.note);
        }
      },
      onError: (err) => {
        setVoiceError(err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    recognitionRef.current = rec;
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);

    if (val && /[+\-*\/]/.test(val)) {
      const evaluated = evaluateMathExpression(val);
      setMathPreview(evaluated);
    } else {
      setMathPreview(null);
    }
  };

  const handleAmountBlur = () => {
    if (mathPreview !== null) {
      setAmount(mathPreview.toString());
      setMathPreview(null);
    }
  };

  if (!isOpen) return null;

  const isCashOut = activeMode === 'cash_out';

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalAmount = amount;
    if (typeof amount === 'string' && /[+\-*\/]/.test(amount)) {
      const evaluated = evaluateMathExpression(amount);
      if (evaluated !== null) finalAmount = evaluated;
    }

    const numAmt = parseFloat(finalAmount);
    if (!numAmt || numAmt <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    setLoading(true);
    try {
      if (isCashOut) {
        await addTransaction({
          type: 'cash_out',
          subType: 'real_expense',
          wallet,
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
          wallet,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden flex flex-col card-3d relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Quick Cash Entry
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                দৈনন্দিন আয় ও খরচের দ্রুত হিসাব লিপিবদ্ধ করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bangla Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:scale-105'
              }`}
              title="মুখে বলুন (Bangla Voice Entry)"
            >
              {isListening ? (
                <Mic className="w-4 h-4 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{isListening ? 'শুনছি...' : 'ভয়েস এন্ট্রি 🎙️'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Voice Indicator Banner */}
        {isListening && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <span className="font-bold block">মুখে বলুন (বাংলা / English):</span>
                <span className="italic text-slate-600 dark:text-slate-300">
                  {voiceTranscript ? `"${voiceTranscript}"` : 'যেমন: "খাবার ৪৫০ টাকা" বা "রিকশা ৬০ টাকা" বা "বেতন ২৫ হাজার"'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleVoice}
              className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shrink-0"
            >
              Stop
            </button>
          </div>
        )}

        {voiceError && (
          <div className="mx-4 sm:mx-5 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {voiceError}
          </div>
        )}

        {/* Clean 2-Tab Switcher (- Cash Out vs + Cash In) */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setActiveMode('cash_out'); setCategory('Food & Groceries'); }}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isCashOut 
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40 shadow-xs font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/[0.05]'
            }`}
          >
            <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="font-bold">- Cash Out (খরচ)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('cash_in'); setCategory('Salary'); }}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isCashOut 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 shadow-xs font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/[0.05]'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">+ Cash In (আয়)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Wallet Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              WALLET / অ্যাকাউন্ট বা ওয়ালেট
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_WALLETS.map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWallet(w.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    wallet === w.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px]">{w.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input with Multi-Functional Math Calculator Support */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                AMOUNT (টাকা / BDT) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                (যোগ +, বিয়োগ -, গুণ ×, ভাগ ÷ বা % লিখুন)
              </span>
            </div>

            <MathAmountInput
              value={amount}
              onChange={(val) => setAmount(val)}
              placeholder="0"
              autoFocus
              required
              accentColor={isCashOut ? 'rose' : 'emerald'}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              CATEGORY / ক্যাটাগরি
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              PERSON / SOURCE (ঐচ্ছিক)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="যেমন: অফিস, ফ্রেন্ড, বাজার"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">DATE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">NOTE / বিবরণ</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="যেমন: দুপুরের খাবার, রিকশা ভাড়া"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer btn-shimmer btn-3d ${
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
