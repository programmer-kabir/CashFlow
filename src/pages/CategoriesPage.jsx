import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Tags, 
  Plus, 
  X 
} from 'lucide-react';

const CategoriesPage = () => {
  const { categories, addCategory } = useCashFlow();
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
  const [modalOpen, setModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const currentList = activeTab === 'expense' ? categories.expense : categories.income;

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory(activeTab, {
      name: newCatName,
      icon: 'MoreHorizontal',
      color: activeTab === 'expense' ? '#f43f5e' : '#10b981'
    });
    setNewCatName('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Category Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">আয় ও খরচের ক্যাটাগরি তৈরি ও কাস্টমাইজেশন</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Custom Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Expense Categories ({categories.expense.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Income Categories ({categories.income.length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {currentList.map(cat => (
          <div
            key={cat.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] flex items-center justify-between gap-3 transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: `${cat.color || '#3b82f6'}20`, color: cat.color || '#3b82f6' }}
              >
                <Tags className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{cat.name}</h4>
                <span className="text-xs text-slate-400 capitalize">{activeTab}</span>
              </div>
            </div>

            {cat.isSystem && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold uppercase tracking-wider">
                System
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.09] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add {activeTab === 'expense' ? 'Expense' : 'Income'} Category</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">CATEGORY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym, Pet Care, Tuition"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
