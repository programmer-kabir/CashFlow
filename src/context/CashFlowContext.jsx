import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const CashFlowContext = createContext();

export const useCashFlow = () => useContext(CashFlowContext);

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Groceries', icon: 'Utensils', color: '#f97316' },
  { id: 'transport', name: 'Transport & Fuel', icon: 'Car', color: '#3b82f6' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#eab308' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cigarette', name: 'Cigarette & Tea', icon: 'Coffee', color: '#64748b' },
  { id: 'drink', name: 'Drink & Snacks', icon: 'CupSoda', color: '#06b6d4' },
  { id: 'entertainment', name: 'Entertainment & OTT', icon: 'Film', color: '#8b5cf6' },
  { id: 'party', name: 'Party & Dine Out', icon: 'PartyPopper', color: '#f43f5e' },
  { id: 'other', name: 'Other Expense', icon: 'MoreHorizontal', color: '#94a3b8' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { id: 'business', name: 'Business Profit', icon: 'TrendingUp', color: '#059669' },
  { id: 'freelance', name: 'Freelance & Projects', icon: 'Laptop', color: '#14b8a6' },
  { id: 'gift', name: 'Gift & Reward', icon: 'Gift', color: '#8b5cf6' },
  { id: 'other_income', name: 'Other Income', icon: 'PlusCircle', color: '#6366f1' },
];

export const CashFlowProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const uid = currentUser?.uid;

  // State collections
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopEntries, setShopEntries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState({
    expense: DEFAULT_EXPENSE_CATEGORIES,
    income: DEFAULT_INCOME_CATEGORIES
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(userProfile?.theme || 'dark');
  const [initialBalance, setInitialBalance] = useState(userProfile?.initialBalance || 0);

  // Helper to persist local cache
  const saveLocalCache = (key, data) => {
    if (!uid) return;
    try {
      localStorage.setItem(`cashflow_${key}_${uid}`, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Helper to read local cache
  const loadLocalCache = (key, defaultVal) => {
    if (!uid) return defaultVal;
    try {
      const saved = localStorage.getItem(`cashflow_${key}_${uid}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  // Sync theme to document body
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveLocalCache('theme', nextTheme);
    if (uid && !uid.includes('demo')) {
      try {
        await updateDoc(doc(db, 'users', uid), { theme: nextTheme });
      } catch (e) {
        console.warn('Theme firestore sync:', e);
      }
    }
  };

  // Subscribe to Firestore collections or fallback to LocalCache
  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setLoans([]);
      setShops([]);
      setShopEntries([]);
      setContacts([]);
      return;
    }

    // 1. First initialize from local cache
    const cachedTx = loadLocalCache('transactions', []);
    const cachedLoans = loadLocalCache('loans', []);
    const cachedShops = loadLocalCache('shops', []);
    const cachedEntries = loadLocalCache('shop_entries', []);
    const cachedContacts = loadLocalCache('contacts', []);
    const cachedInitBal = loadLocalCache('initialBalance', 0);

    setTransactions(cachedTx);
    setLoans(cachedLoans);
    setShops(cachedShops);
    setShopEntries(cachedEntries);
    setContacts(cachedContacts);
    setInitialBalance(cachedInitBal);

    // Auto-seed demo data if freshly logged in demo user
    if (cachedTx.length === 0 && uid.includes('demo') && !localStorage.getItem('cashflow_seeded_' + uid)) {
      localStorage.setItem('cashflow_seeded_' + uid, 'true');
      setTimeout(() => {
        loadSampleDemoData();
      }, 100);
    }

    // 2. Try setting up real-time Firestore listeners
    let unsubTx = () => {};
    let unsubLoans = () => {};
    let unsubShops = () => {};
    let unsubShopEntries = () => {};
    let unsubContacts = () => {};
    let unsubUser = () => {};

    try {
      const txColRef = collection(db, 'users', uid, 'transactions');
      unsubTx = onSnapshot(txColRef, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
          setTransactions(data);
          saveLocalCache('transactions', data);
        }
      }, (err) => console.warn('Tx listener fallback to local:', err));

      const loanColRef = collection(db, 'users', uid, 'loans');
      unsubLoans = onSnapshot(loanColRef, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setLoans(data);
          saveLocalCache('loans', data);
        }
      }, (err) => console.warn('Loan listener fallback:', err));

      const shopColRef = collection(db, 'users', uid, 'shops');
      unsubShops = onSnapshot(shopColRef, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setShops(data);
          saveLocalCache('shops', data);
        }
      }, (err) => console.warn('Shop listener fallback:', err));

      const shopEntryRef = collection(db, 'users', uid, 'shop_entries');
      unsubShopEntries = onSnapshot(shopEntryRef, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setShopEntries(data);
          saveLocalCache('shop_entries', data);
        }
      }, (err) => console.warn('Shop entries fallback:', err));

      const contactColRef = collection(db, 'users', uid, 'contacts');
      unsubContacts = onSnapshot(contactColRef, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setContacts(data);
          saveLocalCache('contacts', data);
        }
      }, (err) => console.warn('Contact listener fallback:', err));

      const userDocRef = doc(db, 'users', uid);
      unsubUser = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const uData = snap.data();
          if (uData.initialBalance !== undefined) {
            setInitialBalance(uData.initialBalance);
            saveLocalCache('initialBalance', uData.initialBalance);
          }
          if (uData.theme) setTheme(uData.theme);
        }
      }, (err) => console.warn('User listener fallback:', err));
    } catch (e) {
      console.warn('Firestore connection setup:', e);
    }

    return () => {
      unsubTx();
      unsubLoans();
      unsubShops();
      unsubShopEntries();
      unsubContacts();
      unsubUser();
    };
  }, [uid]);

  // Financial calculations
  const stats = useMemo(() => {
    let totalCashIn = 0;
    let totalCashOut = 0;
    let realIncome = 0;
    let realExpenses = 0;
    let loansReceived = 0;
    let loansReturnedByBorrowers = 0;
    let loansGiven = 0;
    let loanRepaymentsPaid = 0;
    let todayIn = 0;
    let todayOut = 0;
    let monthIn = 0;
    let monthOut = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      const txDateStr = (tx.date || '').split('T')[0];
      const txMonthStr = txDateStr.substring(0, 7);

      if (tx.type === 'cash_in') {
        totalCashIn += amt;
        if (txDateStr === todayStr) todayIn += amt;
        if (txMonthStr === currentMonthStr) monthIn += amt;

        if (tx.subType === 'real_income') {
          realIncome += amt;
        } else if (tx.subType === 'loan_borrowed') {
          loansReceived += amt;
        } else if (tx.subType === 'loan_repaid_to_me') {
          loansReturnedByBorrowers += amt;
        } else {
          realIncome += amt;
        }
      } else if (tx.type === 'cash_out') {
        totalCashOut += amt;
        if (txDateStr === todayStr) todayOut += amt;
        if (txMonthStr === currentMonthStr) monthOut += amt;

        if (tx.subType === 'real_expense') {
          realExpenses += amt;
        } else if (tx.subType === 'loan_given') {
          loansGiven += amt;
        } else if (tx.subType === 'loan_repaid_by_me') {
          loanRepaymentsPaid += amt;
        } else if (tx.subType === 'shop_due_paid') {
          realExpenses += amt;
        } else {
          realExpenses += amt;
        }
      }
    });

    // Loans calculations
    let toReceiveLent = 0;
    let toPayBorrowed = 0;
    let activeLoansCount = 0;
    let overdueLoansCount = 0;
    const now = new Date();

    loans.forEach(loan => {
      const remaining = Number(loan.remainingAmount ?? loan.totalAmount) || 0;
      if (remaining > 0) {
        activeLoansCount++;
        if (loan.dueDate && new Date(loan.dueDate) < now) {
          overdueLoansCount++;
        }
        if (loan.type === 'lent') {
          toReceiveLent += remaining;
        } else if (loan.type === 'borrowed') {
          toPayBorrowed += remaining;
        }
      }
    });

    // Shop Dues
    let totalOutstandingShopDue = 0;
    let totalShopCreditBought = 0;
    let totalPaidToShops = 0;

    shops.forEach(shop => {
      totalOutstandingShopDue += Number(shop.currentDue) || 0;
      totalShopCreditBought += Number(shop.totalBought) || 0;
      totalPaidToShops += Number(shop.totalPaid) || 0;
    });

    const netCashInHand = (Number(initialBalance) || 0) + totalCashIn - totalCashOut;

    return {
      initialBalance: Number(initialBalance) || 0,
      totalCashIn,
      totalCashOut,
      realIncome,
      realExpenses,
      loansReceived,
      loansReturnedByBorrowers,
      loansGiven,
      loanRepaymentsPaid,
      todayIn,
      todayOut,
      monthIn,
      monthOut,
      toReceiveLent,
      toPayBorrowed,
      activeLoansCount,
      overdueLoansCount,
      totalOutstandingShopDue,
      totalShopCreditBought,
      totalPaidToShops,
      registeredShopsCount: shops.length,
      netCashInHand
    };
  }, [transactions, loans, shops, initialBalance]);

  // Action: Add Transaction
  const addTransaction = async (data) => {
    if (!uid) return;
    const newTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      amount: Number(data.amount),
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Optimistic local update
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveLocalCache('transactions', updated);

    // Cloud firestore sync
    try {
      await addDoc(collection(db, 'users', uid, 'transactions'), newTx);
    } catch (e) {
      console.warn('Firestore addTx offline/restricted:', e);
    }

    return newTx.id;
  };

  // Action: Delete Transaction
  const deleteTransaction = async (txId) => {
    if (!uid) return;
    const updated = transactions.filter(t => t.id !== txId);
    setTransactions(updated);
    saveLocalCache('transactions', updated);

    try {
      await deleteDoc(doc(db, 'users', uid, 'transactions', txId));
    } catch (e) {
      console.warn('Firestore deleteTx:', e);
    }
  };

  // Action: Update Initial Balance
  const updateInitialBalance = async (newVal) => {
    const val = Number(newVal) || 0;
    setInitialBalance(val);
    saveLocalCache('initialBalance', val);

    if (uid) {
      try {
        await updateDoc(doc(db, 'users', uid), { initialBalance: val });
      } catch (e) {
        console.warn('Firestore updateInitialBalance:', e);
      }
    }
  };

  // Action: Add Loan (Lent or Borrowed)
  const addLoan = async ({ type, personName, phone, amount, note, dueDate }) => {
    if (!uid) return;
    const numAmount = Number(amount);
    const loanData = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      personName,
      phone: phone || '',
      totalAmount: numAmount,
      remainingAmount: numAmount,
      note: note || '',
      dueDate: dueDate || null,
      status: 'active',
      repayments: [],
      createdAt: new Date().toISOString()
    };

    // Local optimistic update
    const updatedLoans = [loanData, ...loans];
    setLoans(updatedLoans);
    saveLocalCache('loans', updatedLoans);

    // Auto-record the corresponding cash flow transaction!
    if (type === 'lent') {
      await addTransaction({
        type: 'cash_out',
        subType: 'loan_given',
        category: 'Loan Given',
        amount: numAmount,
        personName,
        note: `Loan Given: ${note || ''}`,
        loanId: loanData.id
      });
    } else {
      await addTransaction({
        type: 'cash_in',
        subType: 'loan_borrowed',
        category: 'Loan Borrowed',
        amount: numAmount,
        personName,
        note: `Loan Borrowed: ${note || ''}`,
        loanId: loanData.id
      });
    }

    // Auto-sync contact
    await syncContact(personName, phone);

    // Try Firestore
    try {
      await addDoc(collection(db, 'users', uid, 'loans'), loanData);
    } catch (e) {
      console.warn('Firestore addLoan:', e);
    }

    return loanData.id;
  };

  // Action: Repay Loan (Partial or Full)
  const recordLoanRepayment = async ({ loanId, amount, note, date }) => {
    if (!uid) return;
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const repayAmt = Number(amount);
    const newRemaining = Math.max(0, (Number(loan.remainingAmount) || 0) - repayAmt);
    const newStatus = newRemaining === 0 ? 'paid' : 'active';
    
    const repaymentEntry = {
      amount: repayAmt,
      date: date || new Date().toISOString(),
      note: note || ''
    };

    const updatedRepayments = [...(loan.repayments || []), repaymentEntry];

    const updatedLoans = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          remainingAmount: newRemaining,
          status: newStatus,
          repayments: updatedRepayments
        };
      }
      return l;
    });

    setLoans(updatedLoans);
    saveLocalCache('loans', updatedLoans);

    // Record corresponding transaction
    if (loan.type === 'lent') {
      await addTransaction({
        type: 'cash_in',
        subType: 'loan_repaid_to_me',
        category: 'Loan Repayment Received',
        amount: repayAmt,
        personName: loan.personName,
        note: `Repayment received: ${note || ''}`,
        loanId
      });
    } else {
      await addTransaction({
        type: 'cash_out',
        subType: 'loan_repaid_by_me',
        category: 'Loan Repayment Paid',
        amount: repayAmt,
        personName: loan.personName,
        note: `Repayment paid: ${note || ''}`,
        loanId
      });
    }

    try {
      await updateDoc(doc(db, 'users', uid, 'loans', loanId), {
        remainingAmount: newRemaining,
        status: newStatus,
        repayments: updatedRepayments
      });
    } catch (e) {
      console.warn('Firestore loan repay:', e);
    }
  };

  // Action: Add Shop
  const addShop = async ({ name, category, ownerName, phone, address }) => {
    if (!uid) return;
    const shopData = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      category: category || 'General / Other Shops',
      ownerName: ownerName || '',
      phone: phone || '',
      address: address || '',
      currentDue: 0,
      totalBought: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [shopData, ...shops];
    setShops(updated);
    saveLocalCache('shops', updated);

    try {
      await addDoc(collection(db, 'users', uid, 'shops'), shopData);
    } catch (e) {
      console.warn('Firestore addShop:', e);
    }
    return shopData.id;
  };

  // Action: Shop Credit Purchase
  const recordShopPurchase = async ({ shopId, amount, note, date }) => {
    if (!uid) return;
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;

    const amt = Number(amount);
    const newDue = (Number(shop.currentDue) || 0) + amt;
    const newBought = (Number(shop.totalBought) || 0) + amt;

    const updatedShops = shops.map(s => {
      if (s.id === shopId) {
        return { ...s, currentDue: newDue, totalBought: newBought };
      }
      return s;
    });
    setShops(updatedShops);
    saveLocalCache('shops', updatedShops);

    const entry = {
      id: `entry_${Date.now()}`,
      shopId,
      shopName: shop.name,
      type: 'credit_purchase',
      amount: amt,
      note: note || '',
      date: date || new Date().toISOString()
    };
    const updatedEntries = [entry, ...shopEntries];
    setShopEntries(updatedEntries);
    saveLocalCache('shop_entries', updatedEntries);

    try {
      await updateDoc(doc(db, 'users', uid, 'shops', shopId), {
        currentDue: newDue,
        totalBought: newBought
      });
      await addDoc(collection(db, 'users', uid, 'shop_entries'), entry);
    } catch (e) {
      console.warn('Firestore shop purchase:', e);
    }
  };

  // Action: Shop Due Payment
  const recordShopPayment = async ({ shopId, amount, note, date }) => {
    if (!uid) return;
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;

    const amt = Number(amount);
    const newDue = Math.max(0, (Number(shop.currentDue) || 0) - amt);
    const newPaid = (Number(shop.totalPaid) || 0) + amt;

    const updatedShops = shops.map(s => {
      if (s.id === shopId) {
        return { ...s, currentDue: newDue, totalPaid: newPaid };
      }
      return s;
    });
    setShops(updatedShops);
    saveLocalCache('shops', updatedShops);

    const entry = {
      id: `entry_${Date.now()}`,
      shopId,
      shopName: shop.name,
      type: 'due_payment',
      amount: amt,
      note: note || '',
      date: date || new Date().toISOString()
    };
    const updatedEntries = [entry, ...shopEntries];
    setShopEntries(updatedEntries);
    saveLocalCache('shop_entries', updatedEntries);

    // Record cash out transaction
    await addTransaction({
      type: 'cash_out',
      subType: 'shop_due_paid',
      category: 'Bills & Groceries',
      amount: amt,
      note: `Paid Shop Due (${shop.name}): ${note || ''}`,
      shopId
    });

    try {
      await updateDoc(doc(db, 'users', uid, 'shops', shopId), {
        currentDue: newDue,
        totalPaid: newPaid
      });
      await addDoc(collection(db, 'users', uid, 'shop_entries'), entry);
    } catch (e) {
      console.warn('Firestore shop payment:', e);
    }
  };

  // Action: Delete Shop
  const deleteShop = async (shopId) => {
    if (!uid) return;
    const updated = shops.filter(s => s.id !== shopId);
    setShops(updated);
    saveLocalCache('shops', updated);

    try {
      await deleteDoc(doc(db, 'users', uid, 'shops', shopId));
    } catch (e) {
      console.warn('Firestore deleteShop:', e);
    }
  };

  // Action: Add / Sync Contact
  const syncContact = async (name, phone = '', address = '') => {
    if (!uid || !name) return;
    const existing = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      const newContact = {
        id: `contact_${Date.now()}`,
        name,
        phone: phone || '',
        address: address || '',
        createdAt: new Date().toISOString()
      };
      const updated = [newContact, ...contacts];
      setContacts(updated);
      saveLocalCache('contacts', updated);

      try {
        await addDoc(collection(db, 'users', uid, 'contacts'), newContact);
      } catch (e) {
        console.warn('Firestore syncContact:', e);
      }
    }
  };

  // Action: Add Category
  const addCategory = (type, category) => {
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], { ...category, id: `cat_${Date.now()}` }]
    }));
  };

  // Action: Load Sample Demo Data (বাস্তবসম্মত বাংলাদেশি ডেমো ডাটা)
  const loadSampleDemoData = async () => {
    if (!uid) return;

    // 1. Set Initial Balance to 5000
    updateInitialBalance(5000);

    // 2. Sample Contacts
    const sampleContacts = [
      { id: 'c_1', name: 'Abu Bakkar', phone: '01711223344', address: 'Sylhet', createdAt: new Date().toISOString() },
      { id: 'c_2', name: 'Saijid', phone: '01822334455', address: 'Chararpar', createdAt: new Date().toISOString() }
    ];
    setContacts(sampleContacts);
    saveLocalCache('contacts', sampleContacts);

    // 3. Sample Shop: Neyamot Store
    const sampleShops = [
      {
        id: 's_1',
        name: 'Neyamot Store',
        category: 'Tea Stall & Snacks',
        ownerName: 'Neymot Kaka',
        phone: '01763685616',
        address: 'Khandigoan, Chararpar',
        currentDue: 2755,
        totalBought: 2755,
        totalPaid: 0,
        createdAt: new Date().toISOString()
      }
    ];
    setShops(sampleShops);
    saveLocalCache('shops', sampleShops);

    // 4. Sample Loans
    const sampleLoans = [
      {
        id: 'l_1',
        type: 'borrowed',
        personName: 'Abu Bakkar',
        phone: '01711223344',
        totalAmount: 1300,
        remainingAmount: 1300,
        note: 'Osud Er lagi',
        status: 'active',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        repayments: [],
        createdAt: new Date().toISOString()
      }
    ];
    setLoans(sampleLoans);
    saveLocalCache('loans', sampleLoans);

    // 5. Sample Transactions
    const sampleTx = [
      {
        id: 'tx_1',
        type: 'cash_in',
        subType: 'loan_borrowed',
        category: 'Loan Borrowed',
        amount: 1300,
        personName: 'Abu Bakkar',
        note: 'Loan: Osud Er lagi',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_2',
        type: 'cash_in',
        subType: 'loan_borrowed',
        category: 'Loan Borrowed',
        amount: 2000,
        personName: 'Saijid',
        note: 'Loan: Bike Parts',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_3',
        type: 'cash_out',
        subType: 'real_expense',
        category: 'Food & Groceries',
        amount: 450,
        note: 'Dinner at Pansi',
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_4',
        type: 'cash_in',
        subType: 'real_income',
        category: 'Freelance & Projects',
        amount: 8500,
        note: 'Web Design Payment',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    setTransactions(sampleTx);
    saveLocalCache('transactions', sampleTx);

    // Attempt Firebase batch write if connected
    try {
      const batch = writeBatch(db);
      for (const tx of sampleTx) {
        batch.set(doc(collection(db, 'users', uid, 'transactions')), tx);
      }
      await batch.commit();
    } catch (e) {
      console.warn('Batch write to firestore:', e);
    }
  };

  // Action: Clear All Data
  const clearAllData = async () => {
    if (!uid) return;
    setTransactions([]);
    setLoans([]);
    setShops([]);
    setShopEntries([]);
    setContacts([]);
    updateInitialBalance(0);

    saveLocalCache('transactions', []);
    saveLocalCache('loans', []);
    saveLocalCache('shops', []);
    saveLocalCache('shop_entries', []);
    saveLocalCache('contacts', []);
    saveLocalCache('initialBalance', 0);
  };

  // Action: Export Full JSON Backup
  const exportBackupJSON = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        initialBalance,
        theme
      },
      transactions,
      loans,
      shops,
      shopEntries,
      contacts
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CashFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Action: Import JSON Backup
  const importBackupJSON = async (jsonString) => {
    if (!uid) return;
    try {
      const data = JSON.parse(jsonString);
      if (data.user?.initialBalance !== undefined) {
        await updateInitialBalance(data.user.initialBalance);
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        saveLocalCache('transactions', data.transactions);
      }
      if (Array.isArray(data.loans)) {
        setLoans(data.loans);
        saveLocalCache('loans', data.loans);
      }
      if (Array.isArray(data.shops)) {
        setShops(data.shops);
        saveLocalCache('shops', data.shops);
      }
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      throw e;
    }
  };

  const value = {
    transactions,
    loans,
    shops,
    shopEntries,
    contacts,
    categories,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    initialBalance,
    updateInitialBalance,
    stats,
    addTransaction,
    deleteTransaction,
    addLoan,
    recordLoanRepayment,
    addShop,
    recordShopPurchase,
    recordShopPayment,
    deleteShop,
    syncContact,
    addCategory,
    loadSampleDemoData,
    clearAllData,
    exportBackupJSON,
    importBackupJSON
  };

  return (
    <CashFlowContext.Provider value={value}>
      {children}
    </CashFlowContext.Provider>
  );
};
