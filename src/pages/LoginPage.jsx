import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

const LoginPage = () => {
  const { login, loginWithDemo, demoPreset } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handle1ClickFill = () => {
    setEmailOrPhone(demoPreset.phone);
    setPassword(demoPreset.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone || !password) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await login(emailOrPhone, password);
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'ভুল ইমেইল অথবা পাসওয়ার্ড! অননুমোদিত ইউজার প্রবেশ নিষেধ।');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithDemo();
    } catch (err) {
      console.error('Demo error:', err);
      setErrorMsg(err.message || 'লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
          <span className="font-heading font-black text-3xl">৳</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">CashFlow</h1>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            Cloud Live
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">রিয়েল-টাইম ক্লাউড সিঙ্ক ও পার্সোনাল ক্যাশ ম্যানেজার</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a]/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span>ব্যক্তিগত একাউন্টে লগইন করুন</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            কবির হোসেন (Kabir Hossen)-এর সুরক্ষিত ব্যক্তিগত ক্যাশ খাতা
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Mobile */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              মোবাইল নাম্বার অথবা ইমেইল
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                required
                placeholder="01763685616 অথবা heykabirr01@gmail.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ব্যক্তিগত পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'ব্যক্তিগত একাউন্টে প্রবেশ করুন'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>সিঙ্গেল-ইউজার মোড সক্রিয় • অননুমোদিত এক্সেস ব্লকড</span>
          </div>
        </form>

        {/* 1-Click Fill Preset Box */}
        <div className="pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                KH
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>Kabir Hossen</span>
                  <span className="text-amber-500 text-[10px]">👑</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">heykabirr01@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handle1ClickFill}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Fill
              </button>
              <button
                type="button"
                onClick={handleDirectDemoLogin}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-6 text-xs text-slate-400 dark:text-slate-500 z-10">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-500" /> Real-time Sync
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Secure
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
