import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCashFlow } from './context/CashFlowContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CashInPage from './pages/CashInPage';
import CashOutPage from './pages/CashOutPage';
import LoanManagerPage from './pages/LoanManagerPage';
import ShopCreditPage from './pages/ShopCreditPage';
import PeoplePage from './pages/PeoplePage';
import ReportsPage from './pages/ReportsPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import QuickEntryModal from './components/modals/QuickEntryModal';
import { Lock, ArrowRight } from 'lucide-react';

function App() {
  const { currentUser, loading } = useAuth();
  const { activeTab } = useCashFlow();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState('cash_out');

  // PIN Lock State
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('cashflow_pin');
    if (savedPin) {
      setIsPinLocked(true);
    }
  }, []);

  const handleUnlockPin = (e) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('cashflow_pin');
    if (enteredPin === savedPin) {
      setIsPinLocked(false);
      setPinError(false);
      setEnteredPin('');
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  const handleOpenQuickEntry = (type = 'cash_out') => {
    setQuickEntryType(type);
    setQuickEntryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-bold animate-pulse">
            ৳
          </div>
          <p className="text-xs text-slate-400">Loading CashFlow...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth Login Screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // If PIN lock is active on this device
  if (isPinLocked) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">CashFlow is Locked</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your 4-digit security PIN to proceed</p>
          </div>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <input
              type="password"
              maxLength="4"
              autoFocus
              required
              placeholder="••••"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full text-center text-3xl font-mono tracking-widest py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-hidden focus:border-emerald-500"
            />
            {pinError && <p className="text-xs text-rose-400">Incorrect PIN code. Try again.</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render main application
  return (
    <div className="min-h-screen bg-[#0b0f17] flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          setMobileOpen={setMobileSidebarOpen}
          onOpenQuickEntry={() => handleOpenQuickEntry('cash_out')}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage onOpenQuickEntry={handleOpenQuickEntry} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsPage onOpenQuickEntry={handleOpenQuickEntry} />
          )}
          {activeTab === 'cash_in' && (
            <CashInPage onOpenQuickEntry={handleOpenQuickEntry} />
          )}
          {activeTab === 'cash_out' && (
            <CashOutPage onOpenQuickEntry={handleOpenQuickEntry} />
          )}
          {activeTab === 'loans' && (
            <LoanManagerPage onOpenQuickEntry={handleOpenQuickEntry} />
          )}
          {activeTab === 'shops' && (
            <ShopCreditPage />
          )}
          {activeTab === 'contacts' && (
            <PeoplePage />
          )}
          {activeTab === 'reports' && (
            <ReportsPage />
          )}
          {activeTab === 'categories' && (
            <CategoriesPage />
          )}
          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Quick Entry Modal */}
      <QuickEntryModal
        isOpen={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        defaultType={quickEntryType}
      />
    </div>
  );
}

export default App;
