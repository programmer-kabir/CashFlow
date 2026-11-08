import React, { useState, useMemo } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Handshake, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import LoanRepayModal from '../components/modals/LoanRepayModal';
import AddLoanModal from '../components/modals/AddLoanModal';
import AnimatedNumber from '../components/AnimatedNumber';

const LoanManagerPage = () => {
  const { loans, stats } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'lent' | 'borrowed' | 'active' | 'overdue' | 'paid'
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState(null);
  const [addLoanModalOpen, setAddLoanModalOpen] = useState(false);
  const [addLoanType, setAddLoanType] = useState('lent');

  const filteredLoans = useMemo(() => {
    const now = new Date();
    return loans.filter(loan => {
      const remaining = Number(loan.remainingAmount ?? loan.totalAmount);
      const isPaid = remaining <= 0;
      let isOverdue = false;
      if (!isPaid && loan.dueDate) {
        const d = new Date(loan.dueDate);
        d.setHours(23, 59, 59, 999);
        isOverdue = d < now;
      }

      if (filterTab === 'lent' && loan.type !== 'lent') return false;
      if (filterTab === 'borrowed' && loan.type !== 'borrowed') return false;
      if (filterTab === 'active' && isPaid) return false;
      if (filterTab === 'overdue' && !isOverdue) return false;
      if (filterTab === 'paid' && !isPaid) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = (loan.personName || '').toLowerCase().includes(term) ||
                      (loan.note || '').toLowerCase().includes(term) ||
                      loan.totalAmount?.toString().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [loans, filterTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Loan & Debt Manager</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">পাওনা টাকা আদায় ও দেনা পরিশোধের নিখুঁত লেজার খাতা</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAddLoanType('lent');
              setAddLoanModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ধার দিয়েছি (- Out)</span>
          </button>
          <button
            onClick={() => {
              setAddLoanType('borrowed');
              setAddLoanModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ধার নিয়েছি (+ In)</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>You Receive (Lent)</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
            <AnimatedNumber value={stats.toReceiveLent} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">From people who borrowed from you</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
            <span>You Pay (Borrowed)</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2 tracking-tight">
            <AnimatedNumber value={stats.toPayBorrowed} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">To people who gave you loans</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-300 dark:hover:border-emerald-500/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Active Loans</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            <AnimatedNumber value={stats.activeLoansCount} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Loans currently ongoing</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            <span>Overdue Loans</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2 tracking-tight">
            <AnimatedNumber value={stats.overdueLoansCount} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Past agreed due date</p>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by person name or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-stretch sm:self-auto overflow-x-auto shrink-0 shadow-2xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'lent', label: 'Lent (Receivable)' },
            { id: 'borrowed', label: 'Borrowed (Payable)' },
            { id: 'active', label: 'Active' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'paid', label: 'Paid' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterTab === t.id 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 shadow-xs">
            <Handshake className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">No loans found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">You have no loans in this category.</p>
            <button
              onClick={() => {
                setAddLoanType('lent');
                setAddLoanModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              + Give Loan
            </button>
          </div>
        ) : (
          filteredLoans.map(loan => {
            const isLent = loan.type === 'lent';
            const total = Number(loan.totalAmount) || 0;
            const remaining = Number(loan.remainingAmount ?? total);
            const paid = total - remaining;
            const pctPaid = total > 0 ? Math.round((paid / total) * 100) : 0;
            const isPaid = remaining <= 0;
            let isOverdue = false;
            if (!isPaid && loan.dueDate) {
              const d = new Date(loan.dueDate);
              d.setHours(23, 59, 59, 999);
              isOverdue = d < new Date();
            }

            return (
              <div
                key={loan.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all shadow-sm dark:shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isLent ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <Handshake className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">{loan.personName}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isLent 
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' 
                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                        }`}>
                          {isLent ? 'Lent (পাওনা)' : 'Borrowed (দেনা)'}
                        </span>
                        {isPaid ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-500/20">
                            Fully Settled
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-500/20 animate-pulse">
                            Overdue!
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">
                        {loan.note ? `Note: ${loan.note}` : 'No description'}
                        {loan.phone && ` • Phone: ${loan.phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Balance</p>
                      <p className={`font-mono text-xl sm:text-2xl font-black tracking-tight ${isLent ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        ৳{remaining.toLocaleString()}
                      </p>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => setSelectedLoanForRepay(loan)}
                        className={`px-4 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:-translate-y-0.5 ${
                          isLent ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/25' : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/25'
                        }`}
                      >
                        {isLent ? 'টাকা ফেরত নেওয়া (+ In)' : 'ধার শোধ দেওয়া (- Out)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Repaid: <strong className="text-slate-800 dark:text-slate-200 font-mono">৳{paid.toLocaleString()}</strong> ({pctPaid}%)</span>
                    <span>Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">৳{total.toLocaleString()}</strong></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 shadow-xs ${isLent ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                </div>

                {/* Repayments log if any */}
                {loan.repayments && loan.repayments.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Repayment History ({loan.repayments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loan.repayments.map((r, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">
                          +৳{Number(r.amount).toLocaleString()} on {new Date(r.date).toLocaleDateString()} {r.note ? `(${r.note})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Repay Loan Modal */}
      <LoanRepayModal
        isOpen={!!selectedLoanForRepay}
        onClose={() => setSelectedLoanForRepay(null)}
        loan={selectedLoanForRepay}
      />

      {/* Dedicated Add Loan Modal */}
      <AddLoanModal
        isOpen={addLoanModalOpen}
        onClose={() => setAddLoanModalOpen(false)}
        initialType={addLoanType}
      />
    </div>
  );
};

export default LoanManagerPage;
