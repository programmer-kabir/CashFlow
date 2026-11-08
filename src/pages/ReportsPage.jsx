import React, { useState, useMemo } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Calendar, 
  Download,
  Receipt,
  PieChart,
  BarChart2
} from 'lucide-react';

const ReportsPage = () => {
  const { transactions, initialBalance } = useCashFlow();
  const [reportTab, setReportTab] = useState('monthly'); // 'monthly' | 'yearly' | 'daily' | 'category' | 'ledger'
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7)); // 'YYYY-MM'
  const selectedYear = selectedMonth.substring(0, 4);

  // Filter transactions for the chosen month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tMonth = (t.date || t.createdAt || '').substring(0, 7);
      return tMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Monthly Statement Calculation
  const statement = useMemo(() => {
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

  // Yearly Breakdown Calculation
  const yearlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = (i + 1).toString().padStart(2, '0');
      return `${selectedYear}-${m}`;
    });

    return months.map(mStr => {
      let cashIn = 0;
      let cashOut = 0;
      transactions.forEach(t => {
        const tMonth = (t.date || t.createdAt || '').substring(0, 7);
        if (tMonth === mStr) {
          const amt = Number(t.amount) || 0;
          if (t.type === 'cash_in') cashIn += amt;
          if (t.type === 'cash_out') cashOut += amt;
        }
      });
      return {
        month: mStr,
        cashIn,
        cashOut,
        net: cashIn - cashOut
      };
    });
  }, [transactions, selectedYear]);

  // Daily Breakdown Calculation for selected month
  const dailyData = useMemo(() => {
    const dayMap = {};
    monthlyTransactions.forEach(t => {
      const day = (t.date || t.createdAt || '').split('T')[0];
      if (!day) return;
      if (!dayMap[day]) {
        dayMap[day] = { day, cashIn: 0, cashOut: 0, count: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'cash_in') dayMap[day].cashIn += amt;
      if (t.type === 'cash_out') dayMap[day].cashOut += amt;
      dayMap[day].count++;
    });

    return Object.values(dayMap).sort((a, b) => b.day.localeCompare(a.day));
  }, [monthlyTransactions]);

  // Category Breakdown for selected month
  const categoryData = useMemo(() => {
    const expenseCats = {};
    const incomeCats = {};
    let totalExp = 0;
    let totalInc = 0;

    monthlyTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cat = t.category || (t.type === 'cash_in' ? 'Other Income' : 'Other Expense');
      if (t.type === 'cash_out') {
        expenseCats[cat] = (expenseCats[cat] || 0) + amt;
        totalExp += amt;
      } else {
        incomeCats[cat] = (incomeCats[cat] || 0) + amt;
        totalInc += amt;
      }
    });

    const expList = Object.entries(expenseCats).map(([name, amount]) => ({
      name,
      amount,
      pct: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    const incList = Object.entries(incomeCats).map(([name, amount]) => ({
      name,
      amount,
      pct: totalInc > 0 ? Math.round((amount / totalInc) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return { expList, incList, totalExp, totalInc };
  }, [monthlyTransactions]);

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
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Financial Reports & Statements</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Monthly, Yearly, and Daily financial reports with strict separation of Real Income/Expense and Loans.</p>
        </div>

        <button
          onClick={exportStatementCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Statement</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] overflow-x-auto shadow-2xs">
        {[
          { id: 'monthly', label: 'Monthly Statement' },
          { id: 'yearly', label: 'Yearly Summary' },
          { id: 'daily', label: 'Daily Breakdown' },
          { id: 'category', label: 'Category Analysis' },
          { id: 'ledger', label: 'Monthly Ledger' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setReportTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              reportTab === t.id 
                ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Month Picker Row */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Selected Period:</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Viewing financial metrics for {selectedMonth}</p>
          </div>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Opening Cash</p>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">৳{statement.openingCash.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1424] border border-emerald-200 dark:border-emerald-900/30 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Real Income</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">+৳{statement.realIncome.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1424] border border-rose-200 dark:border-rose-900/30 shadow-2xs">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Real Expenses</p>
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">-৳{statement.realExpenses.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1424] border border-emerald-200 dark:border-emerald-900/30 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Closing Cash</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">৳{statement.closingCash.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab View 1: Monthly Accounting Statement */}
      {reportTab === 'monthly' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.07]">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Monthly Accounting Statement ({selectedMonth})
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Statement Ready
            </span>
          </div>

          <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-white/[0.05]">
            <div className="flex items-center justify-between py-2 text-slate-700 dark:text-slate-300 font-medium">
              <span>1. Month Opening Cash Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">৳{statement.openingCash.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <span>2. + Real Income (Salary, Business, Gifts):</span>
              <span className="font-mono font-bold">+৳{statement.realIncome.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-rose-600 dark:text-rose-400 font-medium">
              <span>3. - Real Expenses (Living, Food, Bills, Cigarettes, Party):</span>
              <span className="font-mono font-bold">-৳{statement.realExpenses.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-amber-600 dark:text-amber-400 font-medium">
              <span>4. + Loan Received (Borrowed Cash Inflow):</span>
              <span className="font-mono font-bold">+৳{statement.loanInflow.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-amber-600 dark:text-amber-300 font-medium">
              <span>5. + Loan Returned by Borrowers:</span>
              <span className="font-mono font-bold">+৳{statement.loanReturnedToMe.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-indigo-600 dark:text-indigo-400 font-medium">
              <span>6. - Loans Given to Others:</span>
              <span className="font-mono font-bold">-৳{statement.loanGivenOut.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-indigo-600 dark:text-indigo-300 font-medium">
              <span>7. - Loan Repayments Paid Back:</span>
              <span className="font-mono font-bold">-৳{statement.loanRepaidByMe.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-4 pb-2 text-base font-extrabold border-t-2 border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-white">Month Closing Cash in Hand:</span>
              <span className="font-mono text-xl text-emerald-600 dark:text-emerald-400">৳{statement.closingCash.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab View 2: Yearly Summary */}
      {reportTab === 'yearly' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.07]">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Yearly Overview ({selectedYear})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">12 Months Summary</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.07]">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Cash In (+ Inflow)</th>
                  <th className="py-3 px-4">Cash Out (- Outflow)</th>
                  <th className="py-3 px-4">Net Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {yearlyData.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{row.month}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">৳{row.cashIn.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-semibold">৳{row.cashOut.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-mono font-bold ${row.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {row.net >= 0 ? `+৳${row.net.toLocaleString()}` : `-৳${Math.abs(row.net).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab View 3: Daily Breakdown */}
      {reportTab === 'daily' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.07]">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Daily Breakdown ({selectedMonth})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{dailyData.length} Active Days</span>
          </div>

          {dailyData.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">No transactions recorded for this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.07]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Entries</th>
                    <th className="py-3 px-4">Daily In</th>
                    <th className="py-3 px-4">Daily Out</th>
                    <th className="py-3 px-4">Daily Balance Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {dailyData.map(d => {
                    const diff = d.cashIn - d.cashOut;
                    return (
                      <tr key={d.day} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{d.day}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{d.count} entries</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">৳{d.cashIn.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-semibold">৳{d.cashOut.toLocaleString()}</td>
                        <td className={`py-3 px-4 font-mono font-bold ${diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {diff >= 0 ? `+৳${diff.toLocaleString()}` : `-৳${Math.abs(diff).toLocaleString()}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab View 4: Category Analysis */}
      {reportTab === 'category' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expenses */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Expense Categories (Total: ৳{categoryData.totalExp.toLocaleString()})</span>
            </h3>

            {categoryData.expList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No expense records this month.</p>
            ) : (
              <div className="space-y-3">
                {categoryData.expList.map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">৳{item.amount.toLocaleString()} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Income Sources (Total: ৳{categoryData.totalInc.toLocaleString()})</span>
            </h3>

            {categoryData.incList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No income records this month.</p>
            ) : (
              <div className="space-y-3">
                {categoryData.incList.map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">৳{item.amount.toLocaleString()} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab View 5: Ledger */}
      {reportTab === 'ledger' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.07]">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Monthly Cash Flow Ledger ({selectedMonth})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{monthlyTransactions.length} Total Records</span>
          </div>

          {monthlyTransactions.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">No transactions recorded for this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.07]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Party / Note</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {monthlyTransactions.map(t => {
                    const isIn = t.type === 'cash_in';
                    const dStr = (t.date || t.createdAt || '').split('T')[0];
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{dStr}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isIn ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          }`}>
                            {isIn ? 'Cash In' : 'Cash Out'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white text-xs">{t.category || '-'}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {t.personName && <strong className="text-slate-800 dark:text-slate-200 mr-1">[{t.personName}]</strong>}
                          {t.note || '-'}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isIn ? `+৳${Number(t.amount || 0).toLocaleString()}` : `-৳${Number(t.amount || 0).toLocaleString()}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;