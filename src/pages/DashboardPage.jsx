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
  Plus, 
  Receipt 
} from 'lucide-react';
import InitialBalanceModal from '../components/modals/InitialBalanceModal';
import AddLoanModal from '../components/modals/AddLoanModal';

const DashboardPage = ({ onOpenQuickEntry }) => {
  const { stats, transactions, initialBalance, setActiveTab } = useCashFlow();
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanModalType, setLoanModalType] = useState('lent');

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
      {/* 1. Hero Card: TOTAL CASH IN HAND */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0f172a] to-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>TOTAL CASH IN HAND</span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono text-white">
                ৳{stats.netCashInHand.toLocaleString()}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-400">
              <span>Initial: <strong className="text-slate-200 font-mono">৳{initialBalance.toLocaleString()}</strong></span>
              <button
                onClick={() => setInitialModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
              >
                Change Initial
              </button>
            </div>
          </div>

          {/* Quick Hero Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenQuickEntry('cash_in')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all"
            >
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              <span>+ Cash In</span>
            </button>
            <button
              onClick={() => onOpenQuickEntry('cash_out')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-600/25 transition-all"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              <span>- Cash Out</span>
            </button>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => {
              setLoanModalType('lent');
              setLoanModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <Handshake className="w-4 h-4 text-rose-400" />
            <span>কাউকে ধার (- Out)</span>
          </button>
          <button
            onClick={() => {
              setLoanModalType('borrowed');
              setLoanModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <Handshake className="w-4 h-4 text-emerald-400" />
            <span>ধার নেওয়া (+ In)</span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
          >
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Pay / Collect Loan</span>
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Shop Due (৳{stats.totalOutstandingShopDue.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* 2. Six Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's In */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's In</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-emerald-400">
            ৳{stats.todayIn.toLocaleString()}
          </p>
        </div>

        {/* Today's Out */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Out</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-rose-400">
            ৳{stats.todayOut.toLocaleString()}
          </p>
        </div>

        {/* This Month In */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>This Month In</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-emerald-400">
            ৳{stats.monthIn.toLocaleString()}
          </p>
        </div>

        {/* This Month Out */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>This Month Out</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-rose-400">
            ৳{stats.monthOut.toLocaleString()}
          </p>
        </div>

        {/* To Receive (Lent) */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>To Receive (Lent)</span>
            <Handshake className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-amber-400">
            ৳{stats.toReceiveLent.toLocaleString()}
          </p>
        </div>

        {/* To Pay (Borrowed) */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>To Pay (Borrowed)</span>
            <Handshake className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-indigo-400">
            ৳{stats.toPayBorrowed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 3. Bottom Columns: Recent Transactions & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions */}
        <div className="lg:col-span-7 bg-[#111827]/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-heading font-bold text-lg text-white">Recent Transactions</h3>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                View All
              </button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">No transactions yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Start tracking your daily expenses, income, and loans by tapping the button below.
              </p>
              <button
                onClick={() => onOpenQuickEntry('cash_out')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
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
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-100">{tx.category || (isIn ? 'Cash In' : 'Cash Out')}</span>
                          {tx.personName && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              {tx.personName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formattedDate} • {formattedTime} {tx.note ? `— ${tx.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm sm:text-base ${
                        isIn ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIn ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">CASH</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Expenses */}
        <div className="lg:col-span-5 bg-[#111827]/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-rose-400" />
            <h3 className="font-heading font-bold text-lg text-white">Top Expenses</h3>
          </div>

          {topExpenses.list.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">No expense records to analyze yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topExpenses.list.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="font-mono text-slate-200">৳{item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default DashboardPage;
