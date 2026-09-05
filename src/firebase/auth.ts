import { 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { UserProfile, UserRole, DoctorProfile } from '../types/medical';
import { 
  getUserProfileFromFirestore, 
  saveUserProfileToFirestore,
  getDoctorProfileFromFirestore,
  saveDoctorProfileToFirestore 
} from './firestore';

const AUTH_STORAGE_KEY = 'medlens_user_profile';

export function generateDoctorCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MED-${randomStr}`;
}

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
      
      // Check if user profile already exists in Firestore
      let existingProfile = await getUserProfileFromFirestore(user.uid);
      
      if (existingProfile) {
        // If profile exists, preserve role unless user specifically switched
        const resolvedRole = existingProfile.role || role;
        let doctorCode = existingProfile.doctorCode;

        if (resolvedRole === 'doctor' && !doctorCode) {
          const docData = await getDoctorProfileFromFirestore(user.uid);
          doctorCode = docData?.doctorCode || generateDoctorCode();
          const docProfile: DoctorProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Dr. ' + (user.email?.split('@')[0] || 'Clinician'),
            doctorCode,
            specialization: existingProfile.specialization || 'General Clinical Medicine',
            hospitalOrClinic: existingProfile.hospitalOrClinic || 'MedLens Affiliated Clinic',
            connectedPatientIds: docData?.connectedPatientIds || [],
            createdAt: existingProfile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await saveDoctorProfileToFirestore(docProfile);
        }

        const updatedProfile: UserProfile = {
          ...existingProfile,
          email: user.email || existingProfile.email,
          displayName: user.displayName || existingProfile.displayName || (role === 'doctor' ? 'Dr. Clinician' : 'Patient User'),
          photoURL: user.photoURL || existingProfile.photoURL,
          doctorCode
        };

        saveStoredProfile(updatedProfile);
        await saveUserProfileToFirestore(updatedProfile);
        return updatedProfile;
      }

      // New User Profile
      let doctorCode: string | undefined = undefined;
      if (role === 'doctor') {
        doctorCode = generateDoctorCode();
        const docProfile: DoctorProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName ? (user.displayName.startsWith('Dr.') ? user.displayName : `Dr. ${user.displayName}`) : 'Dr. ' + (user.email?.split('@')[0] || 'Clinician'),
          doctorCode,
          specialization: 'Internal Medicine',
          hospitalOrClinic: 'MedLens Clinical Health Center',
          connectedPatientIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDoctorProfileToFirestore(docProfile);
      }

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || 'user@example.com',
        displayName: user.displayName || (role === 'doctor' ? 'Dr. ' + (user.email?.split('@')[0] || 'Clinician') : user.email?.split('@')[0] || 'Patient User'),
        photoURL: user.photoURL || undefined,
        role,
        doctorCode,
        isVerifiedReviewer: role === 'doctor',
        createdAt: new Date().toISOString()
      };

      saveStoredProfile(newProfile);
      await saveUserProfileToFirestore(newProfile);
      return newProfile;
    } catch (err: any) {
      console.warn('Firebase popup sign-in encountered an issue, falling back to simulated auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was closed before completing. Please try again.');
      }
      if (err.code === 'auth/cancelled-popup-request') {
        throw new Error('Multiple popups opened. Please try again.');
      }
      // If error is configuration-related (e.g. domain not authorized in Firebase console), explain
      if (err.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized in Firebase Auth. Add it under Firebase Console -> Authentication -> Settings -> Authorized Domains.');
      }
    }
  }

  // Simulated fallback login for offline hackathon testing (NEVER Alex Carter)
  await new Promise(resolve => setTimeout(resolve, 400));
  const simUid = 'usr-' + Math.random().toString(36).substring(2, 10);
  const docCode = role === 'doctor' ? generateDoctorCode() : undefined;
  
  const fallbackProfile: UserProfile = {
    uid: simUid,
    email: role === 'doctor' ? 'clinician@medlens.health' : 'patient@medlens.health',
    displayName: role === 'doctor' ? 'Dr. Jordan Hayes, MD' : 'Taylor Morgan',
    photoURL: undefined,
    role,
    doctorCode: docCode,
    specialization: role === 'doctor' ? 'Internal Medicine & Diagnostic Review' : undefined,
    isVerifiedReviewer: role === 'doctor',
    createdAt: new Date().toISOString()
  };

  if (role === 'doctor' && docCode) {
    const docProfile: DoctorProfile = {
      uid: simUid,
      email: fallbackProfile.email,
      displayName: fallbackProfile.displayName,
      doctorCode: docCode,
      specialization: 'Internal Medicine & Diagnostic Review',
      hospitalOrClinic: 'Metropolitan Health Center',
      connectedPatientIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveDoctorProfileToFirestore(docProfile);
  }

  saveStoredProfile(fallbackProfile);
  return fallbackProfile;
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
  try {
    sessionStorage.clear();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('medlens_cache_connections');
    localStorage.removeItem('medlens_cache_doctors');
  } catch (err) {
    console.warn('Failed to clear session storage on logout:', err);
  }
}