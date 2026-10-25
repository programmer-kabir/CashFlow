import React from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  Sun, 
  Moon, 
  Plus, 
  LogOut,
  ShieldAlert
} from 'lucide-react';

const Header = ({ setMobileOpen, onOpenQuickEntry }) => {
  const { stats, theme, toggleTheme } = useCashFlow();
  const { logout } = useAuth();

  const formattedBalance = stats.netCashInHand.toLocaleString();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0b0f17]/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
        {/* Balance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-semibold shadow-inner">
          <span className="text-slate-400">Balance:</span>
          <span className={`font-mono font-bold tracking-tight ${stats.netCashInHand >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ৳{formattedBalance}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 border border-slate-800 transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Quick Entry Action */}
        <button
          onClick={onOpenQuickEntry}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all duration-150"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Entry</span>
        </button>

        {/* Logout Quick Button */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors hidden sm:flex"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
