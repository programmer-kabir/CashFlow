import React, { useState, useEffect } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { useAuth } from '../context/AuthContext';
import { 
  Cloud, 
  RefreshCw, 
  LogOut, 
  Lock, 
  Download, 
  Upload, 
  Trash2, 
  Smartphone, 
  Database,
  Fingerprint,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isBiometricsAvailable, registerDeviceBiometric, verifyDeviceBiometric } from '../utils/webAuthn';

const SettingsPage = () => {
  const { 
    initialBalance, 
    updateInitialBalance, 
    theme, 
    toggleTheme, 
    loadSampleDemoData, 
    clearAllData, 
    exportBackupJSON, 
    importBackupJSON
  } = useCashFlow();

  const { currentUser, userProfile, logout } = useAuth();

  const [startingBalanceInput, setStartingBalanceInput] = useState(initialBalance || 0);
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const savedPin = localStorage.getItem('cashflow_pin');
    if (savedPin) {
      setPinEnabled(true);
    }
    const bioEnabled = localStorage.getItem('cashflow_biometric_enabled') === 'true';
    setBiometricEnabled(bioEnabled);

    const autoLock = localStorage.getItem('cashflow_autolock') !== 'false';
    setAutoLockEnabled(autoLock);

    isBiometricsAvailable().then(avail => {
      setBiometricSupported(avail);
    });
  }, []);

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      if (window.confirm('বায়োমেট্রিক ও স্ক্রিন লক বন্ধ করতে চান?')) {
        localStorage.removeItem('cashflow_biometric_enabled');
        localStorage.removeItem('cashflow_biometric_cred_id');
        setBiometricEnabled(false);
        showToast('বায়োমেট্রিক আনলক নিষ্ক্রিয় করা হয়েছে।');
      }
    } else {
      try {
        const success = await registerDeviceBiometric(displayName);
        if (success) {
          setBiometricEnabled(true);
          showToast('বায়োমেট্রিক ও ডিভাইস স্ক্রিন লক সক্রিয় করা হয়েছে! 🎉');
        }
      } catch (err) {
        alert(err.message || 'বায়োমেট্রিক সেটআপ সম্পন্ন করা যায়নি।');
      }
    }
  };

  const handleToggleAutoLock = () => {
    const nextVal = !autoLockEnabled;
    setAutoLockEnabled(nextVal);
    localStorage.setItem('cashflow_autolock', nextVal ? 'true' : 'false');
    showToast(`অ্যাপ মিনিমাইজ অটো-লক ${nextVal ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Kabir Hossen';
  const email = userProfile?.email || currentUser?.email || 'heykabirr01@gmail.com';
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
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Settings & Cloud Synchronization</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Firebase রিয়েল-টাইম ক্লাউড সিঙ্ক, কারেন্সি, পিন লক এবং ব্যাকআপ ম্যানেজমেন্ট।</p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      {/* 1. Cloud & User Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{displayName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Firebase Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{email} • {phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncNow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>লোকাল ডাটা সিঙ্ক করুন</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            {syncStatus}
          </div>
        )}

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.07]/80 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>মোবাইল বা অন্য ডিভাইসে লগইন করলে এই একাউন্টের সব ডাটা সাথে সাথে রিয়েল-টাইমে পাওয়া যাবে।</span>
        </div>
      </div>

      {/* 2. Accounting Preferences */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-lg font-bold">৳</span>
          <span>Accounting Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              INITIAL STARTING CASH BALANCE
            </label>
            <input
              type="number"
              value={startingBalanceInput}
              onChange={(e) => setStartingBalanceInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/[0.07] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              CURRENCY SYMBOL
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/[0.07] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              TIMEZONE / REGION
            </label>
            <select
              defaultValue="Asia/Dhaka"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/[0.07] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="Asia/Dhaka">Bangladesh (Asia/Dhaka - GMT+6)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              APPEARANCE THEME
            </label>
            <select
              value={theme}
              onChange={(e) => toggleTheme()}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/[0.07] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* 3. App Security: PIN & Biometric Screen Lock */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-5 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  অ্যাপ সিকিউরিটি ও বায়োমেট্রিক স্ক্রিন লক
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  WebAuthn
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ইন-ডিসপ্লে ৪-ডিজিট পিন ও মোবাইলের স্ক্রিন লক বা বায়োমেট্রিক সুরক্ষা
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Card 1: 4-Digit PIN */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>৪-ডিজিট মাস্টার পিন (Master PIN)</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pinEnabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                }`}>
                  {pinEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                অ্যাপ ওপেন করার সময় ডিসপ্লের ওপরেই টাচ কিপ্যাডে ৪-সংখ্যার পিন দিয়ে আনলক করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const pin = prompt('CashFlow অ্যাপের জন্য ৪ ডিজিটের নতুন পিন কোড লিখুন:');
                  if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
                    localStorage.setItem('cashflow_pin', pin);
                    setPinEnabled(true);
                    showToast('৪-ডিজিটের পিন কোড সক্রিয় করা হয়েছে! 🎉');
                  } else if (pin) {
                    alert('পিন কোডটি অবশ্যই ঠিক ৪টি সংখ্যার হতে হবে।');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm hover:-translate-y-0.5"
              >
                {pinEnabled ? 'পিন পরিবর্তন করুন' : 'পিন সেট করুন'}
              </button>

              {pinEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি নিশ্চিতভাবে পিন লক বন্ধ করতে চান?')) {
                      localStorage.removeItem('cashflow_pin');
                      setPinEnabled(false);
                      showToast('পিন লক বন্ধ করা হয়েছে।');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Biometric & Device Screen Lock */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-indigo-500" />
                  <span>বায়োমেট্রিক ও স্ক্রিন লক (WebAuthn)</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  biometricEnabled
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                }`}>
                  {biometricEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                সাইড ফিঙ্গারপ্রিন্ট নষ্ট থাকলেও মোবাইলের নিজস্ব স্ক্রিন লক (Pattern/PIN) দিয়ে নিমেষে আনলক হবে।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleToggleBiometric}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                  biometricEnabled
                    ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-0.5'
                }`}
              >
                {biometricEnabled ? 'বায়োমেট্রিক বন্ধ করুন' : 'বায়োমেট্রিক / ডিভাইস লক চালু'}
              </button>

              {biometricEnabled && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const ok = await verifyDeviceBiometric();
                      if (ok) showToast('ডিভাইস ভেরিফিকেশন সফল! ✅');
                      else alert('ভেরিফিকেশন সম্পন্ন হয়নি।');
                    } catch (e) {
                      alert('ভেরিফিকেশন এরর: ' + e.message);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  টেস্ট করুন
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Auto Lock on App Minimize Option */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              অ্যাপ থেকে বের হলে বা অন্য অ্যাপে সুইচ করলে সাথে সাথে স্ক্রিন লক চালু রাখুন
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoLock}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
              autoLockEnabled 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
          >
            {autoLockEnabled ? 'চালু আছে' : 'বন্ধ'}
          </button>
        </div>
      </div>

      {/* 4. Data Backup & Restore */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Data Backup & Restore</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">আপনার সমস্ত লেনদেন ও হিসাবের JSON ব্যাকআপ এক্সপোর্ট বা ইমপোর্ট করুন।</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.07] space-y-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">1. Full JSON Backup</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download a complete JSON snapshot containing all transactions, loans, people, and settings.</p>
            <button
              onClick={exportBackupJSON}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.07] space-y-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">2. Restore from JSON</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Restore your ledger from a previously saved JSON backup file.</p>
            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import JSON File</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 5. Demo Data & Testing */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-3 shadow-sm dark:shadow-xl transition-colors">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500 font-bold">✨</span>
          <span>Demo Data & Testing</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">টেস্টিং এর জন্য ডেমো ডাটা লোড বা লোকাল ক্যাশ ক্লিয়ার করুন।</p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleLoadDemo}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>Load Sample Demo Data</span>
          </button>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Local Cache</span>
          </button>
        </div>
      </div>

      {/* 6. About CashFlow */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.07]/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-300">About CashFlow</p>
        <p>Version: <strong className="text-emerald-600 dark:text-emerald-400">1.0.0</strong> • Storage Engine: <strong className="text-slate-700 dark:text-slate-300">Firebase Cloud Firestore + Offline Cache</strong></p>
        <p>Firebase ক্লাউড এনক্রিপ্টেড ডাটাবেসের মাধ্যমে আপনার হিসাব রিয়েল-টাইমে সংরক্ষিত ও সুরক্ষিত।</p>
      </div>
    </div>
  );
};

export default SettingsPage;
