import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo user preset
  const demoPreset = {
    name: 'Kabir Hossen',
    email: 'heykabirr@gmail.com',
    phone: '01763685616',
    password: 'password123'
  };

  const setLocalSession = (userObj) => {
    localStorage.setItem('cashflow_user_session', JSON.stringify(userObj));
    setCurrentUser(userObj);
    setUserProfile({
      displayName: userObj.displayName || demoPreset.name,
      email: userObj.email || demoPreset.email,
      phone: userObj.phone || demoPreset.phone,
      initialBalance: 0,
      currency: '৳',
      theme: 'dark'
    });
  };

  const loginWithDemo = async () => {
    try {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, demoPreset.email, demoPreset.password);
        return userCredential.user;
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, demoPreset.email, demoPreset.password);
            await updateProfile(newCred.user, { displayName: demoPreset.name });
            return newCred.user;
          } catch (createErr) {
            try {
              const anonCred = await signInAnonymously(auth);
              await updateProfile(anonCred.user, { displayName: demoPreset.name });
              return anonCred.user;
            } catch (anonErr) {
              console.warn('Firebase Auth restricted, using local session for demo user');
              const localUser = {
                uid: 'kabir_hossen_demo',
                displayName: demoPreset.name,
                email: demoPreset.email,
                phone: demoPreset.phone
              };
              setLocalSession(localUser);
              return localUser;
            }
          }
        } else {
          // Fallback to local session
          const localUser = {
            uid: 'kabir_hossen_demo',
            displayName: demoPreset.name,
            email: demoPreset.email,
            phone: demoPreset.phone
          };
          setLocalSession(localUser);
          return localUser;
        }
      }
    } catch (error) {
      console.warn('Using local fallback session for demo user:', error);
      const localUser = {
        uid: 'kabir_hossen_demo',
        displayName: demoPreset.name,
        email: demoPreset.email,
        phone: demoPreset.phone
      };
      setLocalSession(localUser);
      return localUser;
    }
  };

  const login = async (emailOrPhone, password) => {
    let email = emailOrPhone;
    if (!emailOrPhone.includes('@')) {
      email = `${emailOrPhone.replace(/[^0-9]/g, '')}@cashflow.local`;
    }
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // If Firebase Auth is restricted or offline, create a local session
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/network-request-failed' || err.code === 'auth/user-not-found') {
        const localUser = {
          uid: 'user_' + emailOrPhone.replace(/[^a-zA-Z0-9]/g, '_'),
          displayName: emailOrPhone.split('@')[0],
          email: email,
          phone: emailOrPhone
        };
        setLocalSession(localUser);
        return localUser;
      }
      throw err;
    }
  };

  const signup = async (emailOrPhone, password, displayName = 'User') => {
    let email = emailOrPhone;
    if (!emailOrPhone.includes('@')) {
      email = `${emailOrPhone.replace(/[^0-9]/g, '')}@cashflow.local`;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      return cred.user;
    } catch (err) {
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/network-request-failed') {
        const localUser = {
          uid: 'user_' + emailOrPhone.replace(/[^a-zA-Z0-9]/g, '_'),
          displayName,
          email: email,
          phone: emailOrPhone
        };
        setLocalSession(localUser);
        return localUser;
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('cashflow_user_session');
    setCurrentUser(null);
    setUserProfile(null);
    try {
      await signOut(auth);
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            const initialData = {
              displayName: user.displayName || demoPreset.name,
              email: user.email || demoPreset.email,
              phone: demoPreset.phone,
              initialBalance: 0,
              currency: '৳',
              timezone: 'Asia/Dhaka',
              theme: 'dark',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, initialData);
            setUserProfile(initialData);
          }
        } catch (e) {
          console.warn('Could not fetch user profile from Firestore:', e);
          setUserProfile({
            displayName: user.displayName || demoPreset.name,
            email: user.email || demoPreset.email,
            phone: demoPreset.phone,
            initialBalance: 0,
            currency: '৳',
            theme: 'dark'
          });
        }
      } else {
        // Check local storage session
        const savedSession = localStorage.getItem('cashflow_user_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setCurrentUser(parsed);
            setUserProfile({
              displayName: parsed.displayName || demoPreset.name,
              email: parsed.email || demoPreset.email,
              phone: parsed.phone || demoPreset.phone,
              initialBalance: 0,
              currency: '৳',
              theme: 'dark'
            });
          } catch (e) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    demoPreset,
    loginWithDemo,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
