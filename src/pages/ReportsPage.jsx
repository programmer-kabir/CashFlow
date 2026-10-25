import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  BarChart3, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Download, 
  FileSpreadsheet 
} from 'lucide-react';

const ReportsPage = () => {
  const { transactions, stats, initialBalance } = useCashFlow();
  const [reportTab, setReportTab] = useState('monthly'); // 'monthly' | 'yearly' | 'daily' | 'category' | 'ledger'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // 'YYYY-MM'

  // Filter transactions for the chosen month
  const monthlyTransactions = transactions.filter(t => {
    const tMonth = (t.date || t.createdAt || '').substring(0, 7);
    return tMonth === selectedMonth;
  });

  const statement = React.useMemo(() => {
    let realIncome = 0;
    let realExpenses = 0;
    let loanInflow = 0;
    let loanReturnedToMe = 0;
    let loanGivenOut = 0;
    let loanRepaidByMe = 0;

    monthlyTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'cash_in') {
        if (t.subType === 'loan_borrowed') {
          loanInflow += amt;
        } else if (t.subType === 'loan_repaid_to_me') {
          loanReturnedToMe += amt;
        } else {
          realIncome += amt;
        }
      } else if (t.type === 'cash_out') {
        if (t.subType === 'loan_given') {
          loanGivenOut += amt;
        } else if (t.subType === 'loan_repaid_by_me') {
          loanRepaidByMe += amt;
        } else {
          realExpenses += amt;
        }
      }
    });

    const openingCash = Number(initialBalance) || 0;
    const closingCash = openingCash + realIncome + loanInflow + loanReturnedToMe - realExpenses - loanGivenOut - loanRepaidByMe;

    return {
      openingCash,
      realIncome,
      realExpenses,
      loanInflow,
      loanReturnedToMe,
      loanGivenOut,
      loanRepaidByMe,
      closingCash
    };
  }, [monthlyTransactions, initialBalance]);

  const exportStatementCSV = () => {
    const rows = [
      ['Accounting Item', 'Amount (BDT)'],
      ['1. Month Opening Cash Balance', statement.openingCash],
      ['2. + Real Income (Salary, Business, Gifts)', statement.realIncome],
      ['3. - Real Expenses (Living, Food, Bills, Cigarettes, Party)', statement.realExpenses],
      ['4. + Loan Received (Borrowed Cash Inflow)', statement.loanInflow],
      ['5. + Loan Returned by Borrowers', statement.loanReturnedToMe],
      ['6. - Loans Given to Others', statement.loanGivenOut],
      ['7. - Loan Repayments Paid Back', statement.loanRepaidByMe],
      ['Month Closing Cash in Hand', statement.closingCash]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Statement_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Financial Reports & Statements</h2>
          <p className="text-xs sm:text-sm text-slate-400">Monthly, Yearly, and Daily financial reports with strict separation of Real Income/Expense and Loans.</p>
        </div>

        <button
          onClick={exportStatementCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Statement</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#111827] border border-slate-800 overflow-x-auto">
        {[
          { id: 'monthly', label: 'Monthly Statement' },
          { id: 'yearly', label: 'Yearly Statement' },
          { id: 'daily', label: 'Daily Report' },
          { id: 'category', label: 'Category Breakdown' },
          { id: 'ledger', label: 'Cash Flow Ledger' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setReportTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              reportTab === t.id 
                ? 'bg-slate-800 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Month Picker Row */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Select Month:</h4>
            <p className="text-xs text-slate-400">View complete cash flow & savings for chosen month</p>
          </div>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-medium focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Opening Cash</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">৳{statement.openingCash.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-900/30">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Real Income</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">+৳{statement.realIncome.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-rose-900/30">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Real Expenses</p>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">-৳{statement.realExpenses.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-900/30">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Closing Cash</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">৳{statement.closingCash.toLocaleString()}</p>
        </div>
      </div>

      {/* Accounting Statement Table */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-heading font-bold text-base sm:text-lg text-white">
            Monthly Accounting Statement ({selectedMonth})
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Statement Ready
          </span>
        </div>

        <div className="space-y-3 text-sm divide-y divide-slate-800/60">
          <div className="flex items-center justify-between py-2 text-slate-300 font-medium">
            <span>1. Month Opening Cash Balance:</span>
            <span className="font-mono font-bold text-white">৳{statement.openingCash.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-emerald-400 font-medium">
            <span>2. + Real Income (Salary, Business, Gifts):</span>
            <span className="font-mono font-bold">+৳{statement.realIncome.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-rose-400 font-medium">
            <span>3. - Real Expenses (Living, Food, Bills, Cigarettes, Party):</span>
            <span className="font-mono font-bold">-৳{statement.realExpenses.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-amber-400 font-medium">
            <span>4. + Loan Received (Borrowed Cash Inflow):</span>
            <span className="font-mono font-bold">+৳{statement.loanInflow.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-amber-300 font-medium">
            <span>5. + Loan Returned by Borrowers:</span>
            <span className="font-mono font-bold">+৳{statement.loanReturnedToMe.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-indigo-400 font-medium">
            <span>6. - Loans Given to Others:</span>
            <span className="font-mono font-bold">-৳{statement.loanGivenOut.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-indigo-300 font-medium">
            <span>7. - Loan Repayments Paid Back:</span>
            <span className="font-mono font-bold">-৳{statement.loanRepaidByMe.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between pt-4 pb-2 text-base font-extrabold border-t-2 border-slate-700">
            <span className="text-white">Month Closing Cash in Hand:</span>
            <span className="font-mono text-xl text-emerald-400">৳{statement.closingCash.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
