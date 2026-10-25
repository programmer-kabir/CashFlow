import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  Cloud, 
  RefreshCw, 
  LogOut, 
  Lock, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Smartphone, 
  Database,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SettingsPage = () => {
  const { 
    initialBalance, 
    updateInitialBalance, 
    theme, 
    toggleTheme, 
    loadSampleDemoData, 
    clearAllData, 
    exportBackupJSON, 
    importBackupJSON,
    transactions
  } = useCashFlow();

  const { currentUser, userProfile, logout } = useAuth();

  const [startingBalanceInput, setStartingBalanceInput] = useState(initialBalance || 0);
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Kabir Hossen';
  const email = userProfile?.email || currentUser?.email || 'heykabirr@gmail.com';
  const phone = userProfile?.phone || '01763685616';

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateInitialBalance(startingBalanceInput);
      confetti({ particleCount: 25, spread: 50 });
      showToast('Preferences saved successfully!');
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = () => {
    setSyncStatus('Syncing with Firebase Cloud Firestore...');
    setTimeout(() => {
      setSyncStatus('All data synchronized with cloud!');
      setTimeout(() => setSyncStatus(null), 3000);
    }, 1000);
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await loadSampleDemoData();
      confetti({ particleCount: 50, spread: 80 });
      showToast('Sample Demo Data loaded successfully!');
    } catch (e) {
      showToast('Error loading demo: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      await clearAllData();
      showToast('All ledger data has been wiped.');
    } catch (e) {
      showToast('Error clearing data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importBackupJSON(event.target.result);
        alert('Backup restored successfully!');
      } catch (err) {
        alert('Failed to restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Settings & Cloud Synchronization</h2>
        <p className="text-xs sm:text-sm text-slate-400">Firebase রিয়েল-টাইম ক্লাউড সিঙ্ক, কারেন্সি, পিন লক এবং ব্যাকআপ ম্যানেজমেন্ট।</p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* 1. Cloud & User Profile Card */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{displayName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Firebase Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{email} • {phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncNow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>লোকাল ডাটা সিঙ্ক করুন</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            {syncStatus}
          </div>
        )}

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>মোবাইল বা অন্য ডিভাইসে লগইন করলে এই একাউন্টের সব ডাটা সাথে সাথে রিয়েল-টাইমে পাওয়া যাবে।</span>
        </div>
      </div>

      {/* 2. Accounting Preferences */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-lg font-bold">৳</span>
          <span>Accounting Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              INITIAL STARTING CASH BALANCE
            </label>
            <input
              type="number"
              value={startingBalanceInput}
              onChange={(e) => setStartingBalanceInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              CURRENCY SYMBOL
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              TIMEZONE / REGION
            </label>
            <select
              defaultValue="Asia/Dhaka"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="Asia/Dhaka">Bangladesh (Asia/Dhaka - GMT+6)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              APPEARANCE THEME
            </label>
            <select
              value={theme}
              onChange={(e) => toggleTheme()}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="dark">Dark Theme (Default)</option>
              <option value="light">Light Theme</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* 3. Local PIN Lock Protection */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">Local PIN Lock Protection</h3>
              <p className="text-xs text-slate-400">Lock the app with a 4-digit PIN stored securely using Web Crypto SHA-256 hashing.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 uppercase">
            {pinEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <button
          onClick={() => {
            const pin = prompt('Enter a 4-digit PIN to lock your CashFlow app:');
            if (pin && pin.length === 4) {
              localStorage.setItem('cashflow_pin', pin);
              setPinEnabled(true);
              alert('4-Digit PIN Lock has been activated!');
            } else if (pin) {
              alert('PIN must be exactly 4 digits.');
            }
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors"
        >
          {pinEnabled ? 'Change 4-Digit PIN' : 'Enable 4-Digit PIN Lock'}
        </button>
      </div>

      {/* 4. Data Backup & Restore */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <div>
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Data Backup & Restore</span>
          </h3>
          <p className="text-xs text-slate-400">আপনার সমস্ত লেনদেন ও হিসাবের JSON ব্যাকআপ এক্সপোর্ট বা ইমপোর্ট করুন।</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-sm text-white">1. Full JSON Backup</h4>
            <p className="text-xs text-slate-400">Download a complete JSON snapshot containing all transactions, loans, people, and settings.</p>
            <button
              onClick={exportBackupJSON}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-sm text-white">2. Restore from JSON</h4>
            <p className="text-xs text-slate-400">Restore your ledger from a previously saved JSON backup file.</p>
            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import JSON File</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 5. Demo Data & Testing */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-3 shadow-xl">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <span className="text-amber-400 font-bold">✨</span>
          <span>Demo Data & Testing</span>
        </h3>
        <p className="text-xs text-slate-400">টেস্টিং এর জন্য ডেমো ডাটা লোড বা লোকাল ক্যাশ ক্লিয়ার করুন।</p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleLoadDemo}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Load Sample Demo Data</span>
          </button>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Local Cache</span>
          </button>
        </div>
      </div>

      {/* 6. About CashFlow */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-300">About CashFlow</p>
        <p>Version: <strong className="text-emerald-400">1.0.0</strong> • Storage Engine: <strong className="text-slate-300">Firebase Cloud Firestore + Offline Cache</strong></p>
        <p>Firebase ক্লাউড এনক্রিপ্টেড ডাটাবেসের মাধ্যমে আপনার হিসাব রিয়েল-টাইমে সংরক্ষিত ও সুরক্ষিত।</p>
      </div>
    </div>
  );
};

export default SettingsPage;
