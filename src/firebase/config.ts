import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'medlens-e06ad.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'medlens-e06ad',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'medlens-e06ad.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.trim().length > 10 &&
  firebaseConfig.apiKey !== 'AIzaSyDemoDummyApiKeyForLocalHackathonTesting'
);

export const app = !getApps().length
  ? initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'AIzaSyDemoDummyApiKeyForLocalHackathonTesting',
            authDomain: 'medlens-e06ad.firebaseapp.com',
            projectId: 'medlens-e06ad',
            storageBucket: 'medlens-e06ad.firebasestorage.app',
            messagingSenderId: '123456789012',
            appId: '1:123456789012:web:medlensweb'
          }
    )
  : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});