import { 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { UserProfile, UserRole } from '../types/medical';

const AUTH_STORAGE_KEY = 'medlens_user_profile';

export function getCurrentStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to save profile to localStorage:', err);
  }
}

export async function signInWithGoogleAuth(role: UserRole): Promise<UserProfile> {
  if (isFirebaseConfigured) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: User = result.user;
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || 'user@example.com',
        displayName: user.displayName || (role === 'doctor' ? 'Dr. Sarah Connor, MD' : 'Alex Carter'),
        photoURL: user.photoURL || undefined,
        role,
        isVerifiedReviewer: role === 'doctor',
        createdAt: new Date().toISOString()
      };

      saveStoredProfile(profile);
      return profile;
    } catch (err: any) {
      console.warn('Firebase popup sign-in encountered an issue, falling back to simulated auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again or select demo mode.');
      }
    }
  }

  await new Promise(resolve => setTimeout(resolve, 450));
  const demoProfile: UserProfile = {
    uid: role === 'doctor' ? 'doc-demo-evelyn-reed' : 'patient-demo-alex-carter',
    email: role === 'doctor' ? 'dr.reed@medlens-clinic.org' : 'alex.carter.demo@example.com',
    displayName: role === 'doctor' ? 'Dr. Evelyn Reed, MD' : 'Alex Carter',
    photoURL: undefined,
    role,
    isVerifiedReviewer: role === 'doctor',
    createdAt: new Date().toISOString()
  };

  saveStoredProfile(demoProfile);
  return demoProfile;
}

export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
  }
  saveStoredProfile(null);
}