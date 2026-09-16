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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getCurrentStoredProfile());
  const isDemoMode = false;
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
    } finally {
      setAuthLoading(false);
    }
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
        logout
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
