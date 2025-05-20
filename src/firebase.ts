// Firebase config and initialization
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCfgvBHss14O0YtZ0G3e_dCRo-WYmkR1I",
  authDomain: "baby-name-swiper.firebaseapp.com",
  projectId: "baby-name-swiper",
  storageBucket: "baby-name-swiper.firebasestorage.app",
  messagingSenderId: "926332937942",
  appId: "1:926332937942:web:f3f481fdce27436cc34b77"
};

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
