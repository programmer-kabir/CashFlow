import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCaNQ9SnivS8xFbNTJ3cGGFOdPWVw5WTo4",
  authDomain: "p-cashflow.firebaseapp.com",
  projectId: "p-cashflow",
  storageBucket: "p-cashflow.firebasestorage.app",
  messagingSenderId: "73929178484",
  appId: "1:73929178484:web:4de89d85783cfeb9850021",
  measurementId: "G-QQE9QE2KR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence if in browser environment
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence enabled in another tab.');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Current browser does not support offline persistence.');
      }
    });
  } catch (e) {
    console.warn('Offline persistence error:', e);
  }
}

export default app;
