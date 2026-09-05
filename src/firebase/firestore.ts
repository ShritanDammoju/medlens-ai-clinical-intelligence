import { 
  doc, 
  setDoc
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './config';
import { UserProfile, MedicalReport, LabResult } from '../types/medical';

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const userRef = doc(firestore, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore user profile save skipped/failed:', err);
  }
}

export async function saveReportToFirestore(report: MedicalReport): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const reportRef = doc(firestore, 'reports', report.id);
    await setDoc(reportRef, report, { merge: true });
  } catch (err) {
    console.warn('Firestore report save skipped/failed:', err);
  }
}

export async function saveLabsToFirestore(labs: LabResult[]): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const promises = labs.map(lab => {
      const labRef = doc(firestore, 'labs', lab.id);
      return setDoc(labRef, lab, { merge: true });
    });
    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore labs save skipped/failed:', err);
  }
}