import React from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Clock,
  Moon
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const DashboardRemindersHub = ({ onOpenTransfer, onOpenClosing }) => {
  const { stats, paySubscription } = useCashFlow();
  const reminders = stats?.dashboardReminders || [];

  return (
    <div className="card-3d bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient subtle glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0d1424] animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                স্মার্ট রিমাইন্ডার ও অ্যাকশন হাব
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                AI Alert
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reminders.length > 0 
                ? `${reminders.length}টি গুরুত্বপূর্ণ বিষয় আপনার মনোযোগ আকর্ষণ করছে` 
                : 'সবকিছু পারফেক্ট! আপনার অ্যাকাউন্টে কোনো বকেয়া নেই'}
            </p>
          </div>
        </div>

        {reminders.length > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
            {reminders.length} টি সতর্কতা
          </span>
        )}
      </div>

      {/* Reminders List or All-Clear Peaceful Card */}
      {reminders.length === 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
                সবকিছু সম্পূর্ণ নিয়ন্ত্রণে আছে!
              </h4>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                আজ কোনো বকেয়া বিল, লোন ওভারডিউ বা বাজেট অতিরিক্ত খরচের ঝুঁকি নেই। চমৎকার ফিনান্সিয়াল শৃঙ্খলা!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              100% Safe Zone
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {reminders.map((rem) => {
            const isCritical = rem.severity === 'critical';
            const isDanger = rem.severity === 'danger';
            const isWarning = rem.severity === 'warning';

            return (
              <div
                key={rem.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                  isCritical
                    ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-300 dark:border-rose-500/30'
                    : isDanger
                    ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-500/20'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-500/25'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    isCritical || isDanger
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isCritical ? (
                      <Clock className="w-5 h-5 animate-spin-slow" />
                    ) : isDanger ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {rem.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical || isDanger
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {rem.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {rem.description}
                    </p>
                  </div>
                </div>

                {rem.actionType === 'pay_sub' && (
                  <button
                    onClick={() => paySubscription(rem.subId)}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>বিল পরিশোধ করুন</span>
                  </button>
                )}

                {rem.actionType === 'open_closing' && (
                  <button
                    onClick={onOpenClosing}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>ক্যাশ ক্লোজিং করুন 🌙</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardRemindersHub;

