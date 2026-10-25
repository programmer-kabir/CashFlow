import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  PieChart, 
  Trash2 
} from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">Cash Out & Expenses</h2>
            <p className="text-xs sm:text-sm text-slate-400">Track where your money was spent with exact category breakdowns.</p>
          </div>
        </div>

        <button
          onClick={() => onOpenQuickEntry('cash_out')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>- Record Cash Out</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TOTAL CASH OUT</p>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">৳{stats.totalCashOut.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{cashOutList.length} total entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">REAL LIVING EXPENSES</p>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">৳{stats.realExpenses.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Food, Cigarette, Party, Bills...</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TODAY'S OUT</p>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">৳{stats.todayOut.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Spent today</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40">
          <p className="text-xs font-semibold text-indigo-400/90 uppercase tracking-wider">LOANS GIVEN / REPAID</p>
          <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            ৳{(stats.loansGiven + stats.loanRepaymentsPaid).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Principal movements</p>
        </div>
      </div>

      {/* Category Breakdown Widget */}
      {categoryBreakdown.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              Where Did Your Money Go? (Category Breakdown)
            </h4>
            <span className="text-xs text-slate-400">Total: ৳{stats.totalCashOut.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categoryBreakdown.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-300 truncate">{item.name}</span>
                  <span className="font-mono text-rose-400 font-bold">৳{item.amount.toLocaleString()} ({item.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Time Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search note, category, person, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto shrink-0">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeFilter === f.id ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
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
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            <ArrowUpRight className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No expense records found</p>
            <p className="text-xs text-slate-500 mt-1">You have no recorded expenses matching this filter.</p>
          </div>
        ) : (
          filtered.map(tx => {
            const dateObj = new Date(tx.date || tx.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#111827]/80 hover:bg-[#131c2e] border border-slate-800 flex items-center justify-between gap-4 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-white">{tx.category || 'Expense'}</span>
                      {tx.personName && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.personName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formattedDate} • {formattedTime} {tx.note ? `— ${tx.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-bold text-base sm:text-lg text-rose-400">
                      -৳{Number(tx.amount).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">CASH</p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this expense record?')) deleteTransaction(tx.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 rounded-xl transition-all"
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
