import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin
} from 'lucide-react';
import AddContactModal from '../components/modals/AddContactModal';

const PeoplePage = () => {
  const { contacts, loans, transactions } = useCashFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [addContactOpen, setAddContactOpen] = useState(false);

  const contactList = contacts.map(c => {
    // Calculate what he owes you and what you owe him
    let heOwesYou = 0;
    let youOweHim = 0;

    loans.forEach(l => {
      if (l.personName?.toLowerCase() === c.name?.toLowerCase()) {
        const rem = Number(l.remainingAmount ?? l.totalAmount) || 0;
        if (l.type === 'lent') heOwesYou += rem;
        if (l.type === 'borrowed') youOweHim += rem;
      }
    });

    const txCount = transactions.filter(t => t.personName?.toLowerCase() === c.name?.toLowerCase()).length;
    const loanCount = loans.filter(l => l.personName?.toLowerCase() === c.name?.toLowerCase()).length;

    return {
      ...c,
      heOwesYou,
      youOweHim,
      txCount,
      loanCount
    };
  });

  const filtered = contactList.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) ||
           (c.phone || '').toLowerCase().includes(term) ||
           (c.address || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Contacts & People</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">সব পরিচিত ব্যক্তি, লোন ও লেনদেনের কেন্দ্রীয় ডিরেক্টরি</p>
        </div>

        <button
          onClick={() => setAddContactOpen(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Contact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl bg-white dark:bg-white/[0.02] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">No contacts found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Add people to easily track loans, split expenses, and transaction history.</p>
            <button
              onClick={() => setAddContactOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              + Add Contact
            </button>
          </div>
        ) : (
          filtered.map(contact => (
            <div
              key={contact.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-4 shadow-sm dark:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-emerald-500/20">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{contact.name}</h4>
                    {contact.phone && (
                      <p className="text-xs text-slate-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{contact.phone}</span>
                      </p>
                    )}
                    {contact.address && (
                      <p className="text-xs text-slate-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{contact.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Due status cards */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider">HE OWES YOU</p>
                    <p className="font-mono text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      ৳{contact.heOwesYou.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-l border-slate-200/80 dark:border-white/[0.06]">
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider">YOU OWE HIM</p>
                    <p className="font-mono text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ৳{contact.youOweHim.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <span>{contact.txCount} Transactions • {contact.loanCount} Loans</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Details &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={addContactOpen}
        onClose={() => setAddContactOpen(false)}
      />
    </div>
  );
};

export default PeoplePage;
