import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/medical';
import { 
  signInWithGoogleAuth, 
  signOutUser, 
  getCurrentStoredProfile 
} from './auth';
import { saveUserProfileToFirestore } from './firestore';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getCurrentStoredProfile());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!getCurrentStoredProfile());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('patient');

  const role: UserRole = userProfile?.role || 'patient';

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
      setShowAuthModal(false);
      await saveUserProfileToFirestore(profile);
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
      setIsDemoMode(true);
    } finally {
      setAuthLoading(false);
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setShowAuthModal(false);
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
        enterDemoMode
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
