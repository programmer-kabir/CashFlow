import React, { useState } from 'react';
import { useCashFlow, DEFAULT_WALLETS } from '../context/CashFlowContext';
import { 
  Banknote, 
  Smartphone, 
  Zap, 
  Building2, 
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import TransferWalletModal from './modals/TransferWalletModal';

const MultiWalletBar = () => {
  const { stats } = useCashFlow();
  const [transferOpen, setTransferOpen] = useState(false);

  const getWalletIcon = (id) => {
    switch (id) {
      case 'bkash':
        return <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#e2136e]" />;
      case 'nagad':
        return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#f97316]" />;
      case 'bank':
        return <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284c7]" />;
      case 'cash':
      default:
        return <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getWalletGlow = (id) => {
    switch (id) {
      case 'bkash':
        return 'hover:shadow-[0_8px_25px_rgba(226,19,110,0.2)] border-pink-500/20 dark:border-pink-500/25';
      case 'nagad':
        return 'hover:shadow-[0_8px_25px_rgba(249,115,22,0.2)] border-orange-500/20 dark:border-orange-500/25';
      case 'bank':
        return 'hover:shadow-[0_8px_25px_rgba(2,132,199,0.2)] border-sky-500/20 dark:border-sky-500/25';
      case 'cash':
      default:
        return 'hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)] border-emerald-500/20 dark:border-emerald-500/25';
    }
  };

  return (
    <>
      <div className="card-3d bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                মাল্টি-ওয়ালেট একাউন্ট ব্যালেন্স
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                ক্যাশ, বিকাশ, নগদ ও ব্যাংক একাউন্টের লাইভ হিসাব
              </p>
            </div>
          </div>

          <button
            onClick={() => setTransferOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>ওয়ালেট ট্রান্সফার</span>
          </button>
        </div>

        {/* 4 Wallet Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DEFAULT_WALLETS.map(w => {
            const balance = stats?.walletBalances?.[w.id] ?? 0;
            return (
              <div
                key={w.id}
                className={`p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border transition-all duration-300 card-interactive group ${getWalletGlow(w.id)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                    {w.name}
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-white/[0.06] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    {getWalletIcon(w.id)}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-400">৳</span>
                    <span className="font-mono text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      <AnimatedNumber value={balance} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {w.badge}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70 group-hover:opacity-100 group-hover:animate-ping" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TransferWalletModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </>
  );
};

export default MultiWalletBar;

