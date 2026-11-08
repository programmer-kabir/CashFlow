import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle, 
  Wallet, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const isIn = transaction.type === 'cash_in';
  const dateObj = new Date(transaction.date || transaction.createdAt || Date.now());
  const dateStr = dateObj.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const voucherId = `CF-${dateObj.getFullYear()}-${(transaction.id || '0000').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `📄 CashFlow Digital Receipt\n━━━━━━━━━━━━━━━\nভাউচার নং: ${voucherId}\nধরণ: ${isIn ? 'ক্যাশ ইন / আয়' : 'ক্যাশ আউট / খরচ'}\nটাকা: ৳${Number(transaction.amount).toLocaleString()}\nক্যাটাগরি: ${transaction.category || 'N/A'}\nতারিখ: ${dateStr} • ${timeStr}\nবিবরণ: ${transaction.note || 'N/A'}\n━━━━━━━━━━━━━━━\nCashFlow Verified`;
    if (navigator.share) {
      navigator.share({ title: 'CashFlow Receipt', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('রসিদ কপি করা হয়েছে! এখন মেসেঞ্জার বা হোয়াটসঅ্যাপে পেস্ট করতে পারেন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden card-3d relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden when printed) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02] print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              ডিজিটাল ক্যাশ ভাউচার
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Cash Receipt */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:bg-white print:p-8">
          {/* Receipt Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900/10 dark:border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ৳
                </div>
                <h2 className="text-xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white print:text-black">
                  CashFlow
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                Official Money Receipt / ক্যাশ মেমো
              </p>
            </div>

            {/* Stamp Seal */}
            <div className={`px-3 py-1 rounded-xl text-xs font-black tracking-widest uppercase border-2 rotate-[-6deg] shadow-xs ${
              isIn
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500'
            }`}>
              {isIn ? 'PAID / সংগৃহীত' : 'EXPENDED / পরিশোধিত'}
            </div>
          </div>

          {/* Receipt Meta (Voucher ID & Date) */}
          <div className="grid grid-cols-2 gap-4 text-xs p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] print:bg-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                VOUCHER ID
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 print:text-black">
                {voucherId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                DATE & TIME
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300 print:text-black">
                {dateStr} • {timeStr}
              </span>
            </div>
          </div>

          {/* Main Amount Card */}
          <div className={`p-5 rounded-2xl text-center border relative overflow-hidden ${
            isIn
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              {isIn ? 'TOTAL CASH RECEIVED (আয়)' : 'TOTAL CASH PAID (ব্যয়)'}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono mt-1 tracking-tight">
              {isIn ? '+' : '-'}৳{Number(transaction.amount).toLocaleString()}
            </div>
            <span className="text-xs font-semibold opacity-70 mt-1 block">
              টাকা মাত্র (CASH BDT)
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.05]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> ক্যাটাগরি
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                {transaction.category || (isIn ? 'Cash In' : 'Cash Out')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.05]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> ওয়ালেট অ্যাকাউন্ট
              </span>
              <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 print:text-black">
                {transaction.wallet ? transaction.wallet.toUpperCase() : 'CASH'}
              </span>
            </div>

            {transaction.personName && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.05]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> প্রেরক / প্রাপক
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  {transaction.personName}
                </span>
              </div>
            )}

            {transaction.note && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.05]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> নোট / বিবরণ
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 print:text-black max-w-xs text-right">
                  {transaction.note}
                </span>
              </div>
            )}
          </div>

          {/* Barcode & Security Signature Row */}
          <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.07] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Transaction</span>
            </div>

            <div className="text-right">
              <div className="w-28 border-b border-slate-400 dark:border-white/20 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

