import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Tags, 
  Plus, 
  Utensils, 
  Car, 
  Receipt, 
  ShoppingBag, 
  Coffee, 
  Film, 
  MoreHorizontal, 
  Briefcase, 
  TrendingUp, 
  Laptop, 
  Gift, 
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
          <h2 className="text-2xl font-bold font-heading text-white">Category Management</h2>
          <p className="text-xs sm:text-sm text-slate-400">Manage standard and custom categories for income, expenses, and loans.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Custom Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111827] border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Expense Categories ({categories.expense.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
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
            className="p-4 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: `${cat.color || '#3b82f6'}20`, color: cat.color || '#3b82f6' }}
              >
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">{cat.name}</h4>
                <span className="text-xs text-slate-500 capitalize">{activeTab}</span>
              </div>
            </div>

            {cat.isSystem && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                System
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#111827] border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white">Add {activeTab === 'expense' ? 'Expense' : 'Income'} Category</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CATEGORY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym, Pet Care, Tuition"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold"
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
