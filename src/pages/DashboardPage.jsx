import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Handshake, 
  Store, 
  Clock, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Receipt,
  Mic,
  Users,
  Moon
} from 'lucide-react';
import InitialBalanceModal from '../components/modals/InitialBalanceModal';
import AddLoanModal from '../components/modals/AddLoanModal';
import ReceiptModal from '../components/modals/ReceiptModal';
import SplitBillModal from '../components/modals/SplitBillModal';
import DailyClosingModal from '../components/modals/DailyClosingModal';
import CashFlowTrendChart from '../components/CashFlowTrendChart';
import ExpenseDistributionChart from '../components/ExpenseDistributionChart';
import AnimatedNumber from '../components/AnimatedNumber';
import MultiWalletBar from '../components/MultiWalletBar';
import DashboardRemindersHub from '../components/DashboardRemindersHub';
import SavingsGoalsWidget from '../components/SavingsGoalsWidget';
import MonthlyBillsWidget from '../components/MonthlyBillsWidget';
import BudgetManagerWidget from '../components/BudgetManagerWidget';

const DashboardPage = ({ onOpenQuickEntry }) => {
  const { stats, transactions, initialBalance, setActiveTab } = useCashFlow();
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanModalType, setLoanModalType] = useState('lent');
  const [receiptTx, setReceiptTx] = useState(null);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [dailyClosingOpen, setDailyClosingOpen] = useState(false);

  // Top expenses breakdown calculation
  const topExpenses = React.useMemo(() => {
    const expenseMap = {};
    let totalExp = 0;

    transactions
      .filter(t => t.type === 'cash_out')
      .forEach(t => {
        const cat = t.category || 'Other Expense';
        const amt = Number(t.amount) || 0;
        expenseMap[cat] = (expenseMap[cat] || 0) + amt;
        totalExp += amt;
      });

    const list = Object.entries(expenseMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0
    }));

    list.sort((a, b) => b.amount - a.amount);
    return { list: list.slice(0, 5), totalExp };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 1. Hero Card: Executive Balance Card */}
      <div className="animate-slide-up relative p-6 sm:p-8 lg:p-9 rounded-3xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-white via-slate-50/90 to-emerald-50/30 dark:from-[#0d1527] dark:via-[#0f1b35] dark:to-[#090e1c] border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-200/40 dark:shadow-2xl">
        {/* Ambient Decorative Lighting with gentle floating animation */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>TOTAL CASH IN HAND</span>
            </div>
            
            <div className="flex items-baseline gap-1 mt-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-xs">
                <AnimatedNumber value={stats.netCashInHand} prefix="৳" className="text-slate-900 dark:text-white" />
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.06] font-medium">
                Initial: <strong className="text-slate-800 dark:text-slate-200 font-bold"><AnimatedNumber value={initialBalance} prefix="৳" duration={600} /></strong>
              </span>
              <button
                onClick={() => setInitialModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
              >
                Change Initial
              </button>
            </div>
          </div>

          {/* Quick Hero Buttons with Shimmer & Spring scale */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onOpenQuickEntry('voice')}
              className="btn-shimmer flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
              title="মুখে বলুন (Bangla Voice Entry)"
            >
              <Mic className="w-4.5 h-4.5 animate-pulse" />
              <span>মুখে বলুন 🎙️</span>
            </button>
            <button
              onClick={() => onOpenQuickEntry('cash_in')}
              className="btn-shimmer flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>+ Cash In</span>
            </button>
            <button
              onClick={() => onOpenQuickEntry('cash_out')}
              className="btn-shimmer flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>- Cash Out</span>
            </button>
          </div>
        </div>

        {/* Quick Action Pills: 6 Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-200/80 dark:border-white/[0.07] relative z-10">
          <button
            onClick={() => {
              setLoanModalType('lent');
              setLoanModalOpen(true);
            }}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-rose-50/80 dark:hover:bg-rose-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-300 dark:hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Handshake className="w-4 h-4 text-rose-500 dark:text-rose-400 transition-transform group-hover:scale-110" />
            <span>কাউকে ধার (- Out)</span>
          </button>
          <button
            onClick={() => {
              setLoanModalType('borrowed');
              setLoanModalOpen(true);
            }}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-emerald-50/80 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-300 dark:hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Handshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
            <span>ধার নেওয়া (+ In)</span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110" />
            <span>Pay / Collect Loan</span>
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-amber-50/80 dark:hover:bg-amber-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-amber-300 dark:hover:border-amber-500/30 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Store className="w-4 h-4 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110" />
            <span>দোকান বাকি</span>
          </button>
          <button
            onClick={() => setSplitBillOpen(true)}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-rose-50/80 dark:hover:bg-rose-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-300 dark:hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Users className="w-4 h-4 text-rose-500 transition-transform group-hover:scale-110" />
            <span>বিল স্প্লিট 👥</span>
          </button>
          <button
            onClick={() => setDailyClosingOpen(true)}
            className="group flex items-center justify-center gap-2 py-3 px-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] hover:bg-purple-50/80 dark:hover:bg-purple-500/10 border border-slate-200/80 dark:border-white/[0.07] hover:border-purple-300 dark:hover:border-purple-500/30 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110" />
            <span>ক্যাশ ক্লোজিং 🌙</span>
          </button>
        </div>
      </div>

      {/* Multi-Wallet Balances Bar */}
      <div className="animate-slide-up stagger-1">
        <MultiWalletBar />
      </div>

      {/* Smart Reminders & Action Hub */}
      <div className="animate-slide-up stagger-2">
        <DashboardRemindersHub onOpenClosing={() => setDailyClosingOpen(true)} />
      </div>

      {/* 2. Six Metric Cards Grid (Sleek Apple/Fintech Tiles with Staggered Entrance & 3D Hover Lift) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's In */}
        <div className="animate-slide-up stagger-1 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-400 dark:hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Today's In</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            <AnimatedNumber value={stats.todayIn} prefix="৳" duration={700} />
          </div>
        </div>

        {/* Today's Out */}
        <div className="animate-slide-up stagger-2 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-400 dark:hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Today's Out</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            <AnimatedNumber value={stats.todayOut} prefix="৳" duration={700} />
          </div>
        </div>

        {/* This Month In */}
        <div className="animate-slide-up stagger-3 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-400 dark:hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Month In</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            <AnimatedNumber value={stats.monthIn} prefix="৳" duration={750} />
          </div>
        </div>

        {/* This Month Out */}
        <div className="animate-slide-up stagger-4 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-400 dark:hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Month Out</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            <AnimatedNumber value={stats.monthOut} prefix="৳" duration={750} />
          </div>
        </div>

        {/* To Receive (Lent) */}
        <div className="animate-slide-up stagger-5 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-amber-400 dark:hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">To Receive</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Handshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
            <AnimatedNumber value={stats.toReceiveLent} prefix="৳" duration={800} />
          </div>
        </div>

        {/* To Pay (Borrowed) */}
        <div className="animate-slide-up stagger-6 card-interactive group p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-indigo-400 dark:hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider">To Pay</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Handshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            <AnimatedNumber value={stats.toPayBorrowed} prefix="৳" duration={800} />
          </div>
        </div>
      </div>

      {/* Cash Flow Analytics Spline Area Chart with Staggered Entrance */}
      <div className="animate-slide-up stagger-3">
        <CashFlowTrendChart transactions={transactions} />
      </div>

      {/* Financial Planning: Savings Goals & Monthly Recurring Bills */}
      <div className="animate-slide-up stagger-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsGoalsWidget />
        <MonthlyBillsWidget />
      </div>

      {/* Category Budget & Expense Control */}
      <div className="animate-slide-up stagger-5">
        <BudgetManagerWidget />
      </div>

      {/* 3. Bottom Columns: Recent Transactions & Top Expenses */}
      <div className="animate-slide-up stagger-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Recent Transactions</h3>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="px-3 py-1 rounded-full text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-semibold transition-colors cursor-pointer"
              >
                View All &rarr;
              </button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">No transactions yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                Start tracking your daily expenses, income, and loans by tapping the button below.
              </p>
              <button
                onClick={() => onOpenQuickEntry('cash_out')}
                className="btn-shimmer px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                + Add Cash Out
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto">
              {recentTransactions.map((tx) => {
                const isIn = tx.type === 'cash_in';
                const dateObj = new Date(tx.date || tx.createdAt);
                const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={tx.id}
                    onClick={() => setReceiptTx(tx)}
                    className="group p-3.5 rounded-2xl bg-slate-50/70 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1] flex items-center justify-between gap-3 transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105 ${
                        isIn ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isIn ? (
                          <ArrowDownLeft className="w-5 h-5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{tx.category || (isIn ? 'Cash In' : 'Cash Out')}</span>
                          {tx.personName && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200/70 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                              {tx.personName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">
                          {formattedDate} • {formattedTime} {tx.note ? `— ${tx.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right shrink-0">
                        <span className={`font-mono font-extrabold text-sm sm:text-base tracking-tight ${
                          isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isIn ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {tx.wallet ? tx.wallet.toUpperCase() : 'CASH'}
                        </p>
                      </div>

                      <div 
                        title="রসিদ দেখুন"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-400 transition-all"
                      >
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Expenses */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Top Expenses</h3>
            </div>
            {topExpenses.totalExp > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                ৳{topExpenses.totalExp.toLocaleString()}
              </span>
            )}
          </div>

          {topExpenses.list.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
              <p className="text-xs text-slate-400">No expense records to analyze yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 3D Radial Donut Chart */}
              <div className="pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <ExpenseDistributionChart expenses={topExpenses.list} totalExpense={topExpenses.totalExp} />
              </div>

              {/* Category Breakdown Progress Bars */}
              <div className="space-y-3">
                {topExpenses.list.map((item, idx) => (
                  <div key={idx} className="space-y-1.5 p-2 rounded-2xl hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{item.category}</span>
                      <span className="font-mono text-slate-900 dark:text-slate-100">৳{item.amount.toLocaleString()} <span className="text-slate-400 text-xs font-normal">({item.percentage}%)</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Initial Balance Modal */}
      <InitialBalanceModal
        isOpen={initialModalOpen}
        onClose={() => setInitialModalOpen(false)}
      />

      {/* Dedicated Add Loan Modal */}
      <AddLoanModal
        isOpen={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        initialType={loanModalType}
      />

      {/* Digital Receipt / Money Voucher Modal */}
      <ReceiptModal
        isOpen={!!receiptTx}
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={splitBillOpen}
        onClose={() => setSplitBillOpen(false)}
      />

      {/* Daily Cash Closing Modal */}
      <DailyClosingModal
        isOpen={dailyClosingOpen}
        onClose={() => setDailyClosingOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;