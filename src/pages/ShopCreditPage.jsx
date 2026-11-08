import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Store, 
  Plus, 
  Search, 
  MapPin, 
  Trash2, 
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AddShopModal from '../components/modals/AddShopModal';
import ShopActionModal from '../components/modals/ShopActionModal';
import AnimatedNumber from '../components/AnimatedNumber';

const ShopCreditPage = () => {
  const { shops, shopEntries, stats, deleteShop } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addShopOpen, setAddShopOpen] = useState(false);

  // Shop action modal state
  const [activeShopAction, setActiveShopAction] = useState(null); // { shop, type: 'purchase' | 'payment' }
  const [expandedLedgerShopId, setExpandedLedgerShopId] = useState(null);

  const categories = [
    'All',
    'Tea Stall & Snacks',
    'Grocery Store',
    'Restaurant / Hotel',
    'Pan & Cigarettes',
    'Pharmacy / Medicine',
    'General / Other Shops'
  ];

  const filteredShops = shops.filter(shop => {
    if (selectedCategory !== 'All' && shop.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = (shop.name || '').toLowerCase().includes(term) ||
                    (shop.ownerName || '').toLowerCase().includes(term) ||
                    (shop.address || '').toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const handleDelete = async (shopId, shopName) => {
    if (window.confirm(`Delete shop "${shopName}"?`)) {
      await deleteShop(shopId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Shop Credit Ledger</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Track daily credit purchases, tea stall bills, grocery balances & repayments.</p>
          </div>
        </div>

        <button
          onClick={() => setAddShopOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Shop</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">TOTAL OUTSTANDING DUE</p>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.totalOutstandingShopDue} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{shops.filter(s => Number(s.currentDue) > 0).length} shops with active due</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TOTAL CREDIT BOUGHT</p>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.totalShopCreditBought} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">All recorded credit purchases</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">TOTAL PAID TO SHOPS</p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.totalPaidToShops} prefix="৳" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Settled payments</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-interactive">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">REGISTERED SHOPS</p>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            <AnimatedNumber value={stats.registeredShopsCount} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Active tracked shops</p>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search shop name, owner, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 shadow-xs' 
                  : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.07]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShops.length === 0 ? (
          <div className="col-span-full p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl bg-white dark:bg-white/[0.02] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">No shops registered</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Start tracking your daily tea stall, grocery, or pharmacy dues.</p>
            <button
              onClick={() => setAddShopOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              + Add First Shop
            </button>
          </div>
        ) : (
          filteredShops.map(shop => {
            const currentDue = Number(shop.currentDue) || 0;
            const bought = Number(shop.totalBought) || 0;
            const paid = Number(shop.totalPaid) || 0;
            const isExpanded = expandedLedgerShopId === shop.id;
            const entries = shopEntries.filter(e => e.shopId === shop.id);

            return (
              <div
                key={shop.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-4 shadow-sm dark:shadow-xl hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Store className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{shop.name}</h4>
                        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">{shop.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(shop.id, shop.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 dark:text-slate-400 space-y-1 mb-4 font-medium">
                    {shop.ownerName && (
                      <p>Owner: <strong className="text-slate-700 dark:text-slate-300">{shop.ownerName}</strong></p>
                    )}
                    {shop.address && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{shop.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Due stats box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider">CURRENT DUE</p>
                      <p className={`font-mono text-xl sm:text-2xl font-black tracking-tight ${currentDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ৳{currentDue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-400 dark:text-slate-400 space-y-0.5 font-medium">
                      <p>Bought: <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">৳{bought.toLocaleString()}</span></p>
                      <p>Paid: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">৳{paid.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>

                {/* Shop Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveShopAction({ shop, type: 'purchase' })}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all text-center cursor-pointer hover:-translate-y-0.5"
                    >
                      + Credit Purchase
                    </button>
                    <button
                      onClick={() => setActiveShopAction({ shop, type: 'payment' })}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all text-center cursor-pointer hover:-translate-y-0.5"
                    >
                      Pay Due
                    </button>
                  </div>

                  {/* Toggle Ledger History */}
                  <button
                    onClick={() => setExpandedLedgerShopId(isExpanded ? null : shop.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Shop Ledger / History ({entries.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expanded Ledger View */}
                  {isExpanded && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-2 max-h-48 overflow-y-auto">
                      {entries.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">No entries logged for this shop yet.</p>
                      ) : (
                        entries.map(e => (
                          <div key={e.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-900 last:border-0">
                            <div>
                              <span className={`font-semibold ${e.type === 'purchase' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {e.type === 'purchase' ? 'Bought on credit' : 'Due paid'}
                              </span>
                              <p className="text-[10px] text-slate-500">
                                {new Date(e.date).toLocaleDateString()} {e.note ? `• ${e.note}` : ''}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">৳{Number(e.amount).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Shop Modal */}
      <AddShopModal
        isOpen={addShopOpen}
        onClose={() => setAddShopOpen(false)}
      />

      {/* Shop Action Modal */}
      <ShopActionModal
        isOpen={!!activeShopAction}
        onClose={() => setActiveShopAction(null)}
        shop={activeShopAction?.shop}
        actionType={activeShopAction?.type}
      />
    </div>
  );
};

export default ShopCreditPage;
