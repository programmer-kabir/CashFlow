import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  PieChart, 
  Trash2 
} from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';

const CashOutPage = ({ onOpenQuickEntry }) => {
  const { transactions, stats, deleteTransaction } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const cashOutList = transactions.filter(t => t.type === 'cash_out');

  // Breakdown by category
  const categoryBreakdown = React.useMemo(() => {
    const map = {};
    let total = 0;
    cashOutList.forEach(t => {
      const cat = t.category || 'Other Expense';
      const amt = Number(t.amount) || 0;
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pct: total > 0 ? Math.round((amount / total) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [cashOutList]);

  const filtered = cashOutList.filter(tx => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = (tx.category || '').toLowerCase().includes(term) ||
                    (tx.personName || '').toLowerCase().includes(term) ||
                    (tx.note || '').toLowerCase().includes(term) ||
                    tx.amount?.toString().includes(term);
      if (!match) return false;
    }

    // Time filter
    if (timeFilter !== 'all') {
      const txDate = new Date(tx.date || tx.createdAt);
      const now = new Date();
      if (timeFilter === 'today') {
        if (txDate.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        if (txDate < weekAgo) return false;
      } else if (timeFilter === 'month') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Cash Out & Expenses</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">দৈনন্দিন খরচ, বিল, সিগারেট, পার্টি ও লোনের বহির্গমন ট্র্যাকার</p>
          </div>
        </div>

        <button
          onClick={() => onOpenQuickEntry('cash_out')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all self-start sm:self-auto cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>- Record Cash Out</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-300 dark:hover:border-rose-500/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TOTAL CASH OUT</p>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.totalCashOut} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{cashOutList.length} total entries</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-300 dark:hover:border-rose-500/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">REAL LIVING EXPENSES</p>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.realExpenses} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Food, Cigarette, Party, Bills...</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-rose-300 dark:hover:border-rose-500/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TODAY'S OUT</p>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.todayOut} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Spent today</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400/90 uppercase tracking-wider">LOANS GIVEN / REPAID</p>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.loansGiven + stats.loanRepaymentsPaid} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Principal movements</p>
        </div>
      </div>

      {/* Category Breakdown Widget */}
      {categoryBreakdown.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <span>Where Did Your Money Go? (Category Breakdown)</span>
            </h4>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              Total: ৳{stats.totalCashOut.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categoryBreakdown.map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.05] transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">৳{item.amount.toLocaleString()} ({item.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500 shadow-xs" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Time Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search note, category, person, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/[0.04] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] self-stretch sm:self-auto shrink-0 shadow-2xs">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === f.id 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Out List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl bg-white dark:bg-white/[0.02] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">No expense records found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">You have no recorded expenses matching this filter.</p>
          </div>
        ) : (
          filtered.map(tx => {
            const dateObj = new Date(tx.date || tx.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0d1424] hover:bg-slate-50/80 dark:hover:bg-[#111c33] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] flex items-center justify-between gap-4 transition-all duration-200 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{tx.category || 'Expense'}</span>
                      {tx.personName && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/[0.08]">
                          {tx.personName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">
                      {formattedDate} • {formattedTime} {tx.note ? `— ${tx.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-black text-base sm:text-lg text-rose-600 dark:text-rose-400 tracking-tight">
                      -৳{Number(tx.amount).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold">CASH</p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this expense record?')) deleteTransaction(tx.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CashOutPage;
