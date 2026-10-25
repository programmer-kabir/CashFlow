import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Handshake, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Receipt 
} from 'lucide-react';
import LoanRepayModal from '../components/modals/LoanRepayModal';
import AddLoanModal from '../components/modals/AddLoanModal';

const LoanManagerPage = () => {
  const { loans, stats } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'lent' | 'borrowed' | 'active' | 'overdue' | 'paid'
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState(null);
  const [addLoanModalOpen, setAddLoanModalOpen] = useState(false);
  const [addLoanType, setAddLoanType] = useState('lent');

  const now = new Date();

  const filteredLoans = loans.filter(loan => {
    const remaining = Number(loan.remainingAmount ?? loan.totalAmount);
    const isPaid = remaining <= 0;
    const isOverdue = !isPaid && loan.dueDate && new Date(loan.dueDate) < now;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Loan & Debt Manager</h2>
          <p className="text-xs sm:text-sm text-slate-400">Track money you lent to others and money you borrowed with partial repayment history.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAddLoanType('lent');
              setAddLoanModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ কাওকে লোন দেওয়া (- Cash Out)</span>
          </button>
          <button
            onClick={() => {
              setAddLoanType('borrowed');
              setAddLoanModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ লোন নেওয়া (+ Cash In)</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-amber-900/30">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>You Need To Receive (Lent)</span>
            <Handshake className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">৳{stats.toReceiveLent.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">From people who borrowed from you</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-indigo-900/30">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <span>You Need To Pay (Borrowed)</span>
            <Handshake className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">৳{stats.toPayBorrowed.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">To people who gave you loans</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Active Loans</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{stats.activeLoansCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Loans currently ongoing</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-rose-900/30">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Overdue Loans</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.overdueLoansCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Past agreed due date</p>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by person name or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto shrink-0">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === t.id ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
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
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            <Handshake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No loans found</h4>
            <p className="text-xs text-slate-400 mb-4">You have no loans in this category.</p>
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
            const isOverdue = !isPaid && loan.dueDate && new Date(loan.dueDate) < now;

            return (
              <div
                key={loan.id}
                className="p-5 rounded-3xl bg-[#111827] border border-slate-800 hover:border-slate-700/80 transition-all shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isLent ? 'bg-amber-500/15 text-amber-400' : 'bg-indigo-500/15 text-indigo-400'
                    }`}>
                      <Handshake className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">{loan.personName}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isLent 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {isLent ? 'Lent (পাওনা)' : 'Borrowed (দেনা)'}
                        </span>
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 font-semibold">
                            Fully Settled
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/15 text-rose-400 font-semibold animate-pulse">
                            Overdue!
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {loan.note ? `Note: ${loan.note}` : 'No description'}
                        {loan.phone && ` • Phone: ${loan.phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Remaining Balance</p>
                      <p className={`font-mono text-xl font-extrabold ${isLent ? 'text-amber-400' : 'text-indigo-400'}`}>
                        ৳{remaining.toLocaleString()}
                      </p>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => setSelectedLoanForRepay(loan)}
                        className={`px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-md transition-all ${
                          isLent ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        {isLent ? 'টাকা ফেরত নেওয়া (+ Cash In)' : 'ধার শোধ দেওয়া (- Cash Out)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Repaid: ৳{paid.toLocaleString()} ({pctPaid}%)</span>
                    <span>Total: ৳{total.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isLent ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                </div>

                {/* Repayments log if any */}
                {loan.repayments && loan.repayments.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Repayment History ({loan.repayments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loan.repayments.map((r, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
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
