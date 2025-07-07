// Firebase config and initialization
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use environment variables for Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Log environment info for debugging
console.log('[Firebase] Environment:', import.meta.env.MODE);
console.log('[Firebase] Project ID:', firebaseConfig.projectId);
console.log('[Firebase] API Key exists:', !!firebaseConfig.apiKey);

// Only initialize if not already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Anonymous login
export function signInAnon() {
  return signInAnonymously(auth);
}

// Listen for auth state changes
export function onAuth(cb: (user: any) => void) {
  return onAuthStateChanged(auth, cb);
}
