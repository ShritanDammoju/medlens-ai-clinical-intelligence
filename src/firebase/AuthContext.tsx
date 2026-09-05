import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { UserProfile, UserRole } from '../types/medical';
import { 
  signInWithGoogleAuth, 
  signOutUser, 
  getCurrentStoredProfile,
  saveStoredProfile,
  generateDoctorCode
} from './auth';
import { 
  getUserProfileFromFirestore, 
  saveUserProfileToFirestore,
  getDoctorProfileFromFirestore,
  saveDoctorProfileToFirestore
} from './firestore';

interface AuthContextType {
  userProfile: UserProfile | null;
  role: UserRole;
  isDemoMode: boolean;
  authLoading: boolean;
  authError: string | null;
  showAuthModal: boolean;
  targetRole: UserRole;
  setTargetRole: (role: UserRole) => void;
  openAuthModal: (role?: UserRole) => void;
  closeAuthModal: () => void;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const DEMO_SESSION_KEY = 'medlens_demo_session_active';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getCurrentStoredProfile());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // If already logged in with a real account, never start in demo mode
    if (getCurrentStoredProfile()) return false;
    return sessionStorage.getItem(DEMO_SESSION_KEY) === 'true';
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('patient');

  const role: UserRole = userProfile?.role || targetRole || 'patient';

  // Listen for real Firebase auth state transitions
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const remoteProfile = await getUserProfileFromFirestore(firebaseUser.uid);
          if (remoteProfile) {
            setUserProfile(remoteProfile);
            saveStoredProfile(remoteProfile);
            setIsDemoMode(false);
            sessionStorage.removeItem(DEMO_SESSION_KEY);
          }
        } catch (e) {
          console.warn('Sync profile on auth state change notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (desiredRole: UserRole = 'patient') => {
    setTargetRole(desiredRole);
    setAuthError(null);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError(null);
  };

  const loginWithGoogle = async (selectedRole: UserRole) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const profile = await signInWithGoogleAuth(selectedRole);
      setUserProfile(profile);
      setIsDemoMode(false);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication encountered an error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await signOutUser();
      setUserProfile(null);
      setIsDemoMode(false);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } finally {
      setAuthLoading(false);
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
    setShowAuthModal(false);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        role,
        isDemoMode,
        authLoading,
        authError,
        showAuthModal,
        targetRole,
        setTargetRole,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        logout,
        enterDemoMode,
        exitDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
