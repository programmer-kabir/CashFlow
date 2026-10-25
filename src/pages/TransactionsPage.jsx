import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  Plus, 
  Trash2, 
  Filter,
  Receipt
} from 'lucide-react';

const TransactionsPage = ({ onOpenQuickEntry }) => {
  const { transactions, deleteTransaction } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'in' | 'out'

  const filteredTransactions = transactions.filter(tx => {
    // Type filter
    if (filterType === 'in' && tx.type !== 'cash_in') return false;
    if (filterType === 'out' && tx.type !== 'cash_out') return false;

    // Search query
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const cat = (tx.category || '').toLowerCase();
    const note = (tx.note || '').toLowerCase();
    const person = (tx.personName || '').toLowerCase();
    const amt = (tx.amount || '').toString();

    return cat.includes(term) || note.includes(term) || person.includes(term) || amt.includes(term);
  });

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Type', 'SubType', 'Category', 'Person', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      `"${t.date || t.createdAt || ''}"`,
      `"${t.type || ''}"`,
      `"${t.subType || ''}"`,
      `"${t.category || ''}"`,
      `"${t.personName || ''}"`,
      t.amount || 0,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CashFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Transaction History</h2>
          <p className="text-xs sm:text-sm text-slate-400">Complete record of your cash inflows, outflows, and loan activities.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onOpenQuickEntry('cash_out')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search category, note, person, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('in')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            + In
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'out' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            - Out
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No transactions match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or add a new record.</p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const isIn = tx.type === 'cash_in';
            const dateObj = new Date(tx.date || tx.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#111827]/80 hover:bg-[#131c2e] border border-slate-800 flex items-center justify-between gap-4 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isIn ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-white">{tx.category || (isIn ? 'Cash In' : 'Cash Out')}</span>
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
                    <span className={`font-mono font-bold text-base sm:text-lg ${
                      isIn ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIn ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">CASH</p>
                  </div>

                  <button
                    onClick={() => handleDelete(tx.id)}
                    title="Delete Transaction"
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
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

export default TransactionsPage;
