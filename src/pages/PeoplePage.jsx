import React, { useState } from 'react';
import { useCashFlow } from '../context/CashFlowContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin,
  Handshake,
  Receipt
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
          <h2 className="text-2xl font-bold font-heading text-white">Contacts & People</h2>
          <p className="text-xs sm:text-sm text-slate-400">Reusable contact directory linked with loans, repayments, and shared transactions.</p>
        </div>

        <button
          onClick={() => setAddContactOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Contact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No contacts found</h4>
            <p className="text-xs text-slate-400 mb-4">Add people to easily track loans, split expenses, and transaction history.</p>
            <button
              onClick={() => setAddContactOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              + Add Contact
            </button>
          </div>
        ) : (
          filtered.map(contact => (
            <div
              key={contact.id}
              className="p-5 rounded-3xl bg-[#111827] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">{contact.name}</h4>
                    {contact.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{contact.phone}</span>
                      </p>
                    )}
                    {contact.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{contact.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Due status cards */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">HE OWES YOU</p>
                    <p className="font-mono text-sm font-bold text-amber-400 mt-0.5">
                      ৳{contact.heOwesYou.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-l border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">YOU OWE HIM</p>
                    <p className="font-mono text-sm font-bold text-indigo-400 mt-0.5">
                      ৳{contact.youOweHim.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                <span>{contact.txCount} Transactions • {contact.loanCount} Loans</span>
                <span className="text-emerald-400 font-medium">Details &rarr;</span>
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
