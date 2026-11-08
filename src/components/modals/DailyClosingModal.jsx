import React, { useState, useEffect, useRef } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { 
  Moon, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  Coins, 
  Save, 
  History,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  Wallet,
  Building2,
  Smartphone,
  SmartphoneNfc,
  Check,
  ExternalLink,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import sounds from '../../utils/soundEffects';

const DENOMINATIONS = [
  { value: 1000, label: '৳১০০০', isCoin: false },
  { value: 500, label: '৳৫০০', isCoin: false },
  { value: 200, label: '৳২০০', isCoin: false },
  { value: 100, label: '৳১০০', isCoin: false },
  { value: 50, label: '৳৫০', isCoin: false },
  { value: 20, label: '৳২০', isCoin: false },
  { value: 10, label: '৳১০', isCoin: false },
  { value: 5, label: '৳৫', isCoin: true },
  { value: 2, label: '৳২', isCoin: true },
  { value: 1, label: '৳১', isCoin: true }
];

const DailyClosingModal = ({ isOpen, onClose }) => {
  const { stats, initialBalance, walletBalances, addTransaction, userProfile } = useCashFlow();

  const [activeTab, setActiveTab] = useState('closing'); // 'closing' | 'multi_wallet' | 'history'
  const [actualCash, setActualCash] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [showNoteCounter, setShowNoteCounter] = useState(true);
  const [noteCounts, setNoteCounts] = useState({
    1000: '',
    500: '',
    200: '',
    100: '',
    50: '',
    20: '',
    10: '',
    5: '',
    2: '',
    1: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [closingsHistory, setClosingsHistory] = useState([]);
  const [selectedClosingForSlip, setSelectedClosingForSlip] = useState(null);

  // Multi-wallet reconciliation inputs
  const [actualWallets, setActualWallets] = useState({
    bkash: '',
    nagad: '',
    bank: ''
  });

  const printRef = useRef(null);

  // Expected drawer cash for today
  const todayIn = stats?.todayIn || 0;
  const todayOut = stats?.todayOut || 0;
  // Cash in hand from walletBalances or netCashInHand
  const expectedCash = walletBalances?.cash !== undefined ? walletBalances.cash : (stats?.netCashInHand || 0);

  // Load history from localStorage on open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = JSON.parse(localStorage.getItem('cashflow_daily_closings') || '[]');
        setClosingsHistory(saved);
      } catch (err) {
        setClosingsHistory([]);
      }
      setIsSaved(false);
      setSelectedClosingForSlip(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Note Counter change
  const handleNoteCountChange = (denom, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0).toString();
    const updated = { ...noteCounts, [denom]: cleanVal };
    setNoteCounts(updated);

    let sum = 0;
    Object.entries(updated).forEach(([d, count]) => {
      const c = Number(count) || 0;
      sum += Number(d) * c;
    });

    setActualCash(sum > 0 ? sum.toString() : '');
  };

  const handleStepCount = (denom, step) => {
    const current = Number(noteCounts[denom]) || 0;
    const nextVal = Math.max(0, current + step);
    handleNoteCountChange(denom, nextVal === 0 ? '' : nextVal.toString());
  };

  const handleResetCounter = () => {
    const cleared = {};
    DENOMINATIONS.forEach(d => { cleared[d.value] = ''; });
    setNoteCounts(cleared);
    setActualCash('');
  };

  const numActual = Number(actualCash) || 0;
  const diff = actualCash !== '' ? numActual - expectedCash : null;
  const isPerfectMatch = actualCash !== '' && diff === 0;
  const isShortage = actualCash !== '' && diff < 0;
  const isSurplus = actualCash !== '' && diff > 0;

  // Save closing action
  const handleSaveClosing = async (e) => {
    if (e) e.preventDefault();
    if (actualCash === '') {
      alert('অনুগ্রহ করে ড্রয়ারে বাস্তবে কত ক্যাশ আছে তা লিখুন বা নোট কাউন্টারে সংখ্যা দিন।');
      return;
    }

    // Auto-adjust transaction if selected
    if (autoAdjust && diff !== 0) {
      try {
        if (isShortage) {
          // Shortage: Record expense
          await addTransaction({
            type: 'cash_out',
            amount: Math.abs(diff),
            category: 'Cash Shortage / অমিল',
            personName: 'Cash Drawer Audit',
            wallet: 'cash',
            note: `দিন শেষের হিসাব ঘাটতি অ্যাডজাস্টমেন্ট (${closingNote || 'ক্লোজিং'})`,
            date: new Date().toISOString()
          });
        } else if (isSurplus) {
          // Surplus: Record income
          await addTransaction({
            type: 'cash_in',
            amount: diff,
            category: 'Cash Surplus / উদ্বৃত্ত',
            personName: 'Cash Drawer Audit',
            wallet: 'cash',
            note: `দিন শেষের হিসাব উদ্বৃত্ত অ্যাডজাস্টমেন্ট (${closingNote || 'ক্লোজিং'})`,
            date: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Auto-adjust transaction error:', err);
      }
    }

    const record = {
      id: `closing_${Date.now()}`,
      date: new Date().toISOString(),
      expectedCash,
      actualCash: numActual,
      difference: diff,
      status: diff === 0 ? 'perfect' : diff < 0 ? 'shortage' : 'surplus',
      autoAdjusted: autoAdjust && diff !== 0,
      note: closingNote,
      noteCounts: { ...noteCounts },
      todayIn,
      todayOut
    };

    const updatedHistory = [record, ...closingsHistory];
    setClosingsHistory(updatedHistory);

    try {
      localStorage.setItem('cashflow_daily_closings', JSON.stringify(updatedHistory));
      localStorage.setItem('cashflow_last_closing_date', new Date().toISOString().split('T')[0]);
    } catch (err) {}

    if (isPerfectMatch) {
      sounds.playCashIn();
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } else if (isShortage) {
      sounds.playWarning();
    } else {
      sounds.playCashIn();
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1800);
  };

  const handleDeleteHistoryItem = (id) => {
    if (!window.confirm('এই ক্যাশ ক্লোজিং রেকর্ডটি ডিলিট করতে চান?')) return;
    const filtered = closingsHistory.filter(item => item.id !== id);
    setClosingsHistory(filtered);
    try {
      localStorage.setItem('cashflow_daily_closings', JSON.stringify(filtered));
    } catch (err) {}
  };

  const handleShareWhatsApp = (record) => {
    const dateFormatted = new Date(record.date).toLocaleDateString('bn-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeFormatted = new Date(record.date).toLocaleTimeString('bn-BD', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const statusText = record.difference === 0 
      ? '✅ নিখুঁত হিসাব (100% Balanced)' 
      : record.difference < 0 
      ? `⚠️ ঘাটতি: -৳${Math.abs(record.difference).toLocaleString()}` 
      : `ℹ️ উদ্বৃত্ত: +৳${record.difference.toLocaleString()}`;

    const text = `🌙 *দৈনিক ক্যাশ ক্লোজিং রিপোর্ট*
━━━━━━━━━━━━━━━━━━━━
📅 তারিখ: ${dateFormatted} (${timeFormatted})
💰 সিস্টেম ক্যাশ: ৳${record.expectedCash.toLocaleString()}
💵 ড্রয়ারে বাস্তব ক্যাশ: ৳${record.actualCash.toLocaleString()}
📊 ক্লোজিং স্ট্যাটাস: ${statusText}

📈 আজকের মোট ক্যাশ ইন: +৳${(record.todayIn || 0).toLocaleString()}
📉 আজকের মোট ক্যাশ আউট: -৳${(record.todayOut || 0).toLocaleString()}
${record.autoAdjusted ? '⚙️ অমিল স্বয়ংক্রিয়ভাবে অ্যাডজাস্ট করা হয়েছে' : ''}
${record.note ? `📝 নোট: ${record.note}` : ''}
━━━━━━━━━━━━━━━━━━━━
_Generated by CashFlow Pro Fintech_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrintSlip = (record) => {
    setSelectedClosingForSlip(record);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden card-3d relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  দিন শেষের ক্যাশ ক্লোজিং (Daily Cash Closing)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                  Reconciliation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ড্রয়ারের নগদ টাকার সাথে সিস্টেমের হিসাব মিলিয়ে ক্যাশ ড্রয়ার লক করুন
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-100/50 dark:bg-white/[0.01] px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('closing')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'closing'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0d1424] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>আজকের ক্যাশ ক্লোজিং</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multi_wallet')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'multi_wallet'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0d1424] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>মাল্টি-ওয়ালেট অডিট</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0d1424] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ক্লোজিং হিস্ট্রি ({closingsHistory.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: TODAY'S CLOSING */}
          {activeTab === 'closing' && (
            <form onSubmit={handleSaveClosing} className="space-y-4">
              {/* Expected vs Today Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/70 dark:border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      সিস্টেমের হিসাব অনুযায়ী প্রত্যাশিত ক্যাশ
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ৳{expectedCash.toLocaleString()}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      💵 Cash Drawer
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2.5 border-t border-indigo-200/50 dark:border-indigo-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">আজকের মোট ইন:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+৳{todayIn.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">আজকের মোট আউট:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-৳{todayOut.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">দিন শুরুর প্রারম্ভিক ক্যাশ:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">৳{Number(initialBalance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Physical Drawer Cash Input */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>ড্রয়ারে বাস্তবে মোট কত ক্যাশ আছে?</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNoteCounter(!showNoteCounter)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showNoteCounter ? 'নোট কাউন্টার লুকান' : 'নোট গুনে হিসাব করুন'}</span>
                    {showNoteCounter ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-500">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="বাস্তব ক্যাশের মোট পরিমাণ লিখুন"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#111c33] border border-slate-300 dark:border-white/[0.1] rounded-2xl text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
                  />
                </div>

                {/* Collapsible Banknote and Coin Counter */}
                {showNoteCounter && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>নোট ও কয়েনের সংখ্যা লিখুন (স্বয়ংক্রিয় যোগফল):</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleResetCounter}
                        className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>সব রিসেট</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {DENOMINATIONS.map((d) => {
                        const count = Number(noteCounts[d.value]) || 0;
                        const subtotal = d.value * count;

                        return (
                          <div 
                            key={d.value}
                            className={`p-2 rounded-xl border transition-all ${
                              count > 0 
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40 shadow-xs' 
                                : 'bg-white dark:bg-[#131e38] border-slate-200 dark:border-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                                {d.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {d.isCoin ? 'কয়েন' : 'নোট'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStepCount(d.value, -1)}
                                disabled={count <= 0}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={noteCounts[d.value]}
                                onChange={(e) => handleNoteCountChange(d.value, e.target.value)}
                                className="w-full text-center py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white bg-transparent focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleStepCount(d.value, 1)}
                                className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right mt-1 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                                {subtotal > 0 ? `৳${subtotal.toLocaleString()}` : '৳০'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Reconciliation Verdict */}
              {actualCash !== '' && (
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isPerfectMatch
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : isShortage
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100 shadow-sm'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isPerfectMatch ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : isShortage ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-heading font-extrabold text-sm sm:text-base">
                          {isPerfectMatch
                            ? '🎉 নিখুঁত মিল! ক্যাশ ড্রয়ার ১০০% মিলেছে।'
                            : isShortage
                            ? `⚠️ ক্যাশ ড্রয়ারে ৳${Math.abs(diff).toLocaleString()} টাকা ঘাটতি (Shortage)!`
                            : `ℹ️ ক্যাশ ড্রয়ারে ৳${diff.toLocaleString()} টাকা উদ্বৃত্ত (Surplus)!`}
                        </h4>
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-black/30 border border-current">
                          {isPerfectMatch ? '0.00% Variance' : `${((Math.abs(diff) / (expectedCash || 1)) * 100).toFixed(1)}% অমিল`}
                        </span>
                      </div>
                      <p className="text-xs opacity-85 leading-relaxed">
                        {isPerfectMatch
                          ? 'সিস্টেমের রেকর্ডকৃত হিসাব এবং আপনার ড্রয়ারের বাস্তব নগদ টাকা হুবহু সমান। দিন শেষ করার জন্য সম্পূর্ণ নিরাপদ ও প্রস্তুত।'
                          : isShortage
                          ? 'ড্রয়ারে প্রত্যাশিত টাকার চেয়ে কম টাকা আছে। হয়তো কোনো রিকশা ভাড়া, চা-নাস্তা বা ছোট খরচ এন্ট্রি দিতে ভুলে গেছেন।'
                          : 'ড্রয়ারে সিস্টেমের হিসাবের চেয়ে বেশি টাকা রয়েছে। হয়তো কোনো খুচরা বা প্রাপ্তি এন্ট্রি করা হয়নি।'}
                      </p>

                      {/* Auto Adjust Toggle */}
                      {!isPerfectMatch && (
                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold">
                            <input
                              type="checkbox"
                              checked={autoAdjust}
                              onChange={(e) => setAutoAdjust(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span>
                              {isShortage 
                                ? `☑️ অমিল ৳${Math.abs(diff).toLocaleString()} টাকার জন্য সিস্টেমে 'Cash Shortage' খরচ এন্ট্রি স্বয়ংক্রিয়ভাবে তৈরি করুন` 
                                : `☑️ অতিরিক্ত ৳${diff.toLocaleString()} টাকার জন্য সিস্টেমে 'Cash Surplus' আয় এন্ট্রি স্বয়ংক্রিয়ভাবে তৈরি করুন`}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Closing Memo / Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  দিন শেষের নোট বা মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সব হিসাব ওকে, ড্রয়ার চাবি ম্যানেজারের কাছে"
                  value={closingNote}
                  onChange={(e) => setClosingNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  disabled={actualCash === '' || isSaved}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 btn-shimmer btn-3d flex items-center justify-center gap-2"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ক্লোজিং সেভ সম্পন্ন হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>দিন শেষ ও ক্যাশ ক্লোজিং সেভ করুন</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actualCash === ''}
                    onClick={() => handlePrintSlip({
                      id: `closing_preview_${Date.now()}`,
                      date: new Date().toISOString(),
                      expectedCash,
                      actualCash: numActual,
                      difference: diff,
                      status: diff === 0 ? 'perfect' : diff < 0 ? 'shortage' : 'surplus',
                      note: closingNote,
                      noteCounts,
                      todayIn,
                      todayOut
                    })}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>ক্লোজিং স্লিপ প্রিন্ট</span>
                  </button>

                  <button
                    type="button"
                    disabled={actualCash === ''}
                    onClick={() => handleShareWhatsApp({
                      date: new Date().toISOString(),
                      expectedCash,
                      actualCash: numActual,
                      difference: diff,
                      note: closingNote,
                      todayIn,
                      todayOut,
                      autoAdjusted: autoAdjust
                    })}
                    className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="WhatsApp এ রিপোর্ট পাঠান"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: MULTI-WALLET RECONCILIATION */}
          {activeTab === 'multi_wallet' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  আপনার বিভিন্ন মোবাইল ব্যাংকিং ও ব্যাংক অ্যাপ খুলে বর্তমান ব্যালেন্স এখানে মিলিয়ে দেখতে পারেন:
                </span>
              </div>

              <div className="space-y-3">
                {/* Cash in Hand */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        Cash in Hand (ড্রয়ার ক্যাশ)
                      </span>
                      <span className="text-xs text-slate-500">
                        সিস্টেম ব্যালেন্স: <strong className="text-slate-800 dark:text-slate-200">৳{(walletBalances?.cash || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">বাস্তব ক্যাশ:</span>
                    <input
                      type="number"
                      placeholder="৳..."
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#131e38] text-right font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                {/* bKash */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        bKash Wallet (বিকাশ)
                      </span>
                      <span className="text-xs text-slate-500">
                        সিস্টেম ব্যালেন্স: <strong className="text-pink-600 font-bold">৳{(walletBalances?.bkash || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">bKash অ্যাপ ব্যালেন্স:</span>
                    <input
                      type="number"
                      placeholder="৳..."
                      value={actualWallets.bkash}
                      onChange={(e) => setActualWallets({ ...actualWallets, bkash: e.target.value })}
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#131e38] text-right font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Nagad */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                      <SmartphoneNfc className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        Nagad Wallet (নগদ)
                      </span>
                      <span className="text-xs text-slate-500">
                        সিস্টেম ব্যালেন্স: <strong className="text-orange-600 font-bold">৳{(walletBalances?.nagad || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Nagad অ্যাপ ব্যালেন্স:</span>
                    <input
                      type="number"
                      placeholder="৳..."
                      value={actualWallets.nagad}
                      onChange={(e) => setActualWallets({ ...actualWallets, nagad: e.target.value })}
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#131e38] text-right font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Bank */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        Bank Account (ব্যাংক)
                      </span>
                      <span className="text-xs text-slate-500">
                        সিস্টেম ব্যালেন্স: <strong className="text-blue-600 font-bold">৳{(walletBalances?.bank || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">ব্যাংক ব্যালেন্স:</span>
                    <input
                      type="number"
                      placeholder="৳..."
                      value={actualWallets.bank}
                      onChange={(e) => setActualWallets({ ...actualWallets, bank: e.target.value })}
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#131e38] text-right font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOSING AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {closingsHistory.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.07]">
                  <Moon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    কোনো পূর্ববর্তী ক্লোজিং রেকর্ড পাওয়া যায়নি
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    আজকের হিসাব মেলানোর পর "দিন শেষ ও সেভ করুন" চাপলে সেই দিনের সম্পূর্ণ হিস্ট্রি এখানে সংরক্ষিত থাকবে।
                  </p>
                </div>
              ) : (
                closingsHistory.map((rec) => {
                  const dateStr = new Date(rec.date).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = new Date(rec.date).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={rec.id}
                      className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-400/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {dateStr}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({timeStr})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.status === 'perfect'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                              : rec.status === 'shortage'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                          }`}>
                            {rec.status === 'perfect' ? '✅ নিখুঁত মিল' : rec.status === 'shortage' ? '⚠️ ঘাটতি' : 'ℹ️ উদ্বৃত্ত'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-slate-500">
                            প্রত্যাশিত: <strong>৳{rec.expectedCash.toLocaleString()}</strong>
                          </span>
                          <span className="text-slate-500">
                            বাস্তব: <strong>৳{rec.actualCash.toLocaleString()}</strong>
                          </span>
                          {rec.difference !== 0 && (
                            <span className={rec.difference < 0 ? 'text-rose-500 font-bold' : 'text-amber-500 font-bold'}>
                              {rec.difference < 0 ? `-৳${Math.abs(rec.difference).toLocaleString()}` : `+৳${rec.difference.toLocaleString()}`}
                            </span>
                          )}
                        </div>

                        {rec.note && (
                          <p className="text-[11px] text-slate-500 italic">
                            "{rec.note}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handlePrintSlip(rec)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                          title="ভাউচার প্রিন্ট"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(rec)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs transition-colors cursor-pointer"
                          title="WhatsApp এ শেয়ার"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(rec.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs transition-colors cursor-pointer"
                          title="রেকর্ড মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Printable Hidden Slip Component */}
        {selectedClosingForSlip && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-6 rounded-2xl max-w-sm w-full font-mono text-xs shadow-2xl relative">
              <button 
                onClick={() => setSelectedClosingForSlip(null)}
                className="absolute top-3 right-3 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="text-base font-black tracking-wider">CASHFLOW FINTECH</h3>
                <p className="text-[10px] text-slate-500">DAILY CASH CLOSING MEMO</p>
                <p className="text-[9px] text-slate-400 mt-1">ID: {selectedClosingForSlip.id}</p>
              </div>

              <div className="py-2.5 space-y-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>তারিখ:</span>
                  <span>{new Date(selectedClosingForSlip.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>সময়:</span>
                  <span>{new Date(selectedClosingForSlip.date).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>অডিটর:</span>
                  <span>{userProfile?.name || 'Owner'}</span>
                </div>
              </div>

              <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>সিস্টেম প্রত্যাশিত ক্যাশ:</span>
                  <span className="font-bold">৳{selectedClosingForSlip.expectedCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>বাস্তব ড্রয়ার ক্যাশ:</span>
                  <span className="font-bold">৳{selectedClosingForSlip.actualCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                  <span>অমিল / Variance:</span>
                  <span className={`font-black ${selectedClosingForSlip.difference === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedClosingForSlip.difference === 0 ? '৳০ (MATCHED)' : `৳${selectedClosingForSlip.difference.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {selectedClosingForSlip.note && (
                <div className="py-2 text-[10px] text-slate-600 italic border-b border-dashed border-slate-300">
                  নোট: {selectedClosingForSlip.note}
                </div>
              )}

              <div className="pt-6 pb-2 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1">
                  ক্যাশিয়ার স্বাক্ষর
                </div>
                <div className="border-t border-slate-400 pt-1">
                  ম্যানেজার স্বাক্ষর
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-center cursor-pointer hover:bg-indigo-700"
                >
                  প্রিন্ট করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyClosingModal;
