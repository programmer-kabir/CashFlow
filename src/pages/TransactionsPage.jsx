import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  Plus, 
  Trash2, 
  Receipt
} from 'lucide-react';
import ReceiptModal from '../components/modals/ReceiptModal';

const TransactionsPage = ({ onOpenQuickEntry }) => {
  const { transactions, deleteTransaction } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'in' | 'out'
  const [receiptTx, setReceiptTx] = useState(null);

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
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Transaction History</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">সব ক্যাশ ইন, ক্যাশ আউট ও লোন লেনদেনের পূর্ণাঙ্গ হিস্ট্রি</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onOpenQuickEntry('cash_out')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search category, note, person, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/[0.04] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] self-stretch sm:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all' 
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('in')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'in' 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            + In
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'out' 
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            - Out
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl bg-white dark:bg-white/[0.02] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">No transactions match your search</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Try clearing your filters or add a new cash transaction.</p>
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
                className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0d1424] hover:bg-slate-50/80 dark:hover:bg-[#111c33] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] flex items-center justify-between gap-4 transition-all duration-200 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isIn ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isIn ? <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" /> : <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{tx.category || (isIn ? 'Cash In' : 'Cash Out')}</span>
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

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`font-mono font-black text-base sm:text-lg tracking-tight ${
                      isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIn ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {tx.wallet ? tx.wallet.toUpperCase() : 'CASH'}
                    </p>
                  </div>

                  <button
                    onClick={() => setReceiptTx(tx)}
                    title="রসিদ দেখুন ও প্রিন্ট করুন"
                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(tx.id)}
                    title="Delete Transaction"
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

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptTx}
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
};

export default TransactionsPage;
