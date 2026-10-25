import React, { useState } from 'react';
import { useCashFlow } from '../../context/CashFlowContext';
import { X, Store, MapPin, Phone, User } from 'lucide-react';

const AddShopModal = ({ isOpen, onClose }) => {
  const { addShop } = useCashFlow();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tea Stall & Snacks');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Tea Stall & Snacks',
    'Grocery Store',
    'Restaurant / Hotel',
    'Pan & Cigarettes',
    'Pharmacy / Medicine',
    'General / Other Shops'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await addShop({
        name,
        category,
        ownerName,
        phone,
        address
      });
      setName('');
      setOwnerName('');
      setPhone('');
      setAddress('');
      onClose();
    } catch (e) {
      alert('Error creating shop: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Add New Shop</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SHOP NAME <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Neyamot Store, Bhai Bhai Grocery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SHOP OWNER / CONTACT PERSON</label>
            <input
              type="text"
              placeholder="e.g. Neymot Kaka"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PHONE NUMBER</label>
              <input
                type="text"
                placeholder="017xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">LOCATION / ADDRESS</label>
              <input
                type="text"
                placeholder="Khandigoan, Chararpar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md"
            >
              {loading ? 'Creating...' : 'Add Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShopModal;
