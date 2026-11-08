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
import InDisplayLockScreen from './components/InDisplayLockScreen';
import { Lock } from 'lucide-react';

function App() {
  const { currentUser, loading, logout } = useAuth();
  const { activeTab } = useCashFlow();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState('cash_out');

  // PIN & Biometric Lock State
  const [isPinLocked, setIsPinLocked] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('cashflow_pin');
    if (savedPin) {
      setIsPinLocked(true);
    }
  }, []);

  // Auto-lock when tab is hidden or backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      const savedPin = localStorage.getItem('cashflow_pin');
      const autoLock = localStorage.getItem('cashflow_autolock') !== 'false';
      if (document.hidden && savedPin && autoLock) {
        setIsPinLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleOpenQuickEntry = (type = 'cash_out') => {
    setQuickEntryType(type);
    setQuickEntryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-bold animate-pulse shadow-md">
            ৳
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading CashFlow...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth Login Screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // If PIN or Biometric lock is active on this device
  if (isPinLocked) {
    return (
      <InDisplayLockScreen
        onUnlock={() => setIsPinLocked(false)}
        onLogout={logout}
      />
    );
  }

  // Render main application
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
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
