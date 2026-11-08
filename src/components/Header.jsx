import React, { useState, useEffect } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  Sun, 
  Moon, 
  Plus, 
  LogOut,
  Calendar,
  Sparkles,
  Wallet,
  Volume2,
  VolumeX,
  Download
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const Header = ({ setMobileOpen, onOpenQuickEntry }) => {
  const { stats, theme, toggleTheme, soundEnabled, toggleSound } = useCashFlow();
  const { logout } = useAuth();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const formattedBalance = stats.netCashInHand.toLocaleString();

  // Current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left side: Mobile menu & Live Date */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date & live status badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="capitalize">{dateStr}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud Live</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button (if eligible) */}
        {canInstall && (
          <button
            onClick={handleInstallClick}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer animate-pulse"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* Executive Balance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] shadow-2xs backdrop-blur-md">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1 text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] hidden xs:inline">ব্যালেন্স:</span>
            <AnimatedNumber 
              value={stats.netCashInHand} 
              prefix="৳" 
              className={`font-mono font-extrabold tracking-tight ${stats.netCashInHand >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} 
            />
          </div>
        </div>

        {/* Sound Effects Toggle Button */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'সাউন্ড অন (Mute করতে ক্লিক করুন)' : 'সাউন্ড অফ (Unmute করতে ক্লিক করুন)'}
          className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] transition-all duration-200 cursor-pointer shadow-2xs"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-300 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] transition-all duration-200 cursor-pointer shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Quick Entry Action with Subtle Glow & Shimmer */}
        <button
          onClick={onOpenQuickEntry}
          className="btn-shimmer flex items-center gap-1.5 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all duration-200 cursor-pointer hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Entry</span>
        </button>

        {/* Logout Quick Button */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 sm:p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100/80 hover:bg-rose-50 dark:bg-white/[0.04] dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/[0.07] transition-colors hidden sm:flex cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
