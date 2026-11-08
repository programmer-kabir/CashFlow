import React from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Handshake, 
  Store, 
  Users, 
  BarChart3, 
  Tags, 
  Settings,
  LogOut,
  Wallet,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab } = useCashFlow();
  const { currentUser, userProfile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'All Transactions', icon: Receipt },
    { id: 'cash_in', label: 'Cash In & Income', icon: ArrowDownLeft, color: 'text-emerald-400' },
    { id: 'cash_out', label: 'Cash Out & Expenses', icon: ArrowUpRight, color: 'text-rose-400' },
    { id: 'loans', label: 'Loan Manager', icon: Handshake, color: 'text-indigo-400' },
    { id: 'shops', label: 'Shop Credit Ledger', icon: Store, color: 'text-amber-400' },
    { id: 'contacts', label: 'People / Contacts', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Kabir Hossen';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-[#090e1a] border-r border-slate-200/80 dark:border-white/[0.07] flex flex-col z-50 transition-colors duration-200 shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900 dark:text-white">CashFlow</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 truncate max-w-[140px] font-medium">{displayName}</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group text-left cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.07] bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090e1a]"></span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Cloud Live
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
