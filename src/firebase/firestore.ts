import { 
  doc, 
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './config';
import { 
  UserProfile, 
  MedicalReport, 
  LabResult, 
  Patient, 
  DoctorProfile, 
  DoctorConnection,
  Medication,
  AuditEntry
} from '../types/medical';

// Storage keys for offline / instant client caching
const CACHE_KEYS = {
  CONNECTIONS: 'medlens_cache_connections',
  DOCTORS: 'medlens_cache_doctors',
  PATIENT_PREFIX: 'medlens_cache_pat_'
};

function getLocalCachedConnections(): DoctorConnection[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.CONNECTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedConnections(list: DoctorConnection[]) {
  try {
    localStorage.setItem(CACHE_KEYS.CONNECTIONS, JSON.stringify(list));
  } catch (err) {
    console.warn('Cache connection save error:', err);
  }
}

function getLocalCachedDoctors(): DoctorProfile[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.DOCTORS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedDoctor(docProf: DoctorProfile) {
  try {
    const existing = getLocalCachedDoctors().filter(d => d.uid !== docProf.uid && d.doctorCode !== docProf.doctorCode);
    localStorage.setItem(CACHE_KEYS.DOCTORS, JSON.stringify([...existing, docProf]));
  } catch (err) {
    console.warn('Cache doctor save error:', err);
  }
}

// ============================================================
// User & Doctor Profiles
// ============================================================

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const userRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore getUserProfile failed:', err);
  }
  return null;
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const userRef = doc(firestore, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore user profile save failed:', err);
  }
}

export async function saveDoctorProfileToFirestore(profile: DoctorProfile): Promise<void> {
  saveLocalCachedDoctor(profile);
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(firestore, 'doctors', profile.uid);
    await setDoc(docRef, profile, { merge: true });
    // Also save under users collection for role check
    const userRef = doc(firestore, 'users', profile.uid);
    await setDoc(userRef, {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      role: 'doctor',
      doctorCode: profile.doctorCode,
      specialization: profile.specialization,
      hospitalOrClinic: profile.hospitalOrClinic,
      isVerifiedReviewer: true,
      updatedAt: profile.updatedAt
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore doctor profile save failed:', err);
  }
}

export async function getDoctorProfileFromFirestore(uid: string): Promise<DoctorProfile | null> {
  // Check local cache first
  const cached = getLocalCachedDoctors().find(d => d.uid === uid);
  if (!isFirebaseConfigured) return cached || null;
  try {
    const docRef = doc(firestore, 'doctors', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DoctorProfile;
      saveLocalCachedDoctor(data);
      return data;
    }
  } catch (err) {
    console.warn('Firestore getDoctorProfile failed:', err);
  }
  return cached || null;
}

export async function getDoctorByCode(code: string): Promise<DoctorProfile | null> {
  const cleanCode = code.trim().toUpperCase();
  // Check local cache
  const cached = getLocalCachedDoctors().find(d => d.doctorCode.toUpperCase() === cleanCode);
  if (cached) return cached;

  if (!isFirebaseConfigured) return null;
  try {
    const doctorsRef = collection(firestore, 'doctors');
    const q = query(doctorsRef, where('doctorCode', '==', cleanCode));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as DoctorProfile;
      saveLocalCachedDoctor(data);
      return data;
    }
  } catch (err) {
    console.warn('Firestore getDoctorByCode query failed:', err);
  }
  return null;
}

// ============================================================
// Patient Persistence
// ============================================================

export async function savePatientRecordToFirestore(patient: Patient): Promise<void> {
  try {
    localStorage.setItem(CACHE_KEYS.PATIENT_PREFIX + patient.id, JSON.stringify(patient));
  } catch {}

  if (!isFirebaseConfigured) return;
  try {
    const patRef = doc(firestore, 'patients', patient.id);
    await setDoc(patRef, patient, { merge: true });
  } catch (err) {
    console.warn('Firestore savePatientRecord failed:', err);
  }
}

export async function getPatientByUserId(userId: string): Promise<Patient | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const patientsRef = collection(firestore, 'patients');
    const q = query(patientsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Patient;
    }
  } catch (err) {
    console.warn('Firestore getPatientByUserId failed:', err);
  }
  return null;
}

export async function getPatientById(patientId: string): Promise<Patient | null> {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.PATIENT_PREFIX + patientId);
    if (raw) return JSON.parse(raw);
  } catch {}

  if (!isFirebaseConfigured) return null;
  try {
    const patRef = doc(firestore, 'patients', patientId);
    const snap = await getDoc(patRef);
    if (snap.exists()) {
      return snap.data() as Patient;
    }
  } catch (err) {
    console.warn('Firestore getPatientById failed:', err);
  }
  return null;
}

// ============================================================
// Doctor–Patient Connections
// ============================================================

export async function sendConnectionRequest(
  patient: Patient, 
  doctor: DoctorProfile
): Promise<DoctorConnection> {
  const connectionId = `conn_${patient.id}_${doctor.uid}`;
  const newConnection: DoctorConnection = {
    id: connectionId,
    doctorId: doctor.uid,
    doctorName: doctor.displayName,
    doctorEmail: doctor.email,
    doctorCode: doctor.doctorCode,
    patientId: patient.id,
    patientName: patient.name,
    patientEmail: patient.email,
    patientAge: patient.age,
    patientSex: patient.sex,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  // Update client cache
  const existingList = getLocalCachedConnections().filter(c => c.id !== connectionId);
  saveLocalCachedConnections([...existingList, newConnection]);

  if (isFirebaseConfigured) {
    try {
      const connRef = doc(firestore, 'connections', connectionId);
      await setDoc(connRef, newConnection, { merge: true });
    } catch (err) {
      console.warn('Firestore sendConnectionRequest failed:', err);
    }
  }

  return newConnection;
}

export async function getDoctorPendingRequests(doctorId: string): Promise<DoctorConnection[]> {
  const cached = getLocalCachedConnections().filter(c => c.doctorId === doctorId && c.status === 'pending');
  if (!isFirebaseConfigured) return cached;
  try {
    const connRef = collection(firestore, 'connections');
    const q = query(connRef, where('doctorId', '==', doctorId), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => d.data() as DoctorConnection);
    const map = new Map<string, DoctorConnection>();
    cached.forEach(c => map.set(c.id, c));
    remote.forEach(r => map.set(r.id, r));
    const merged = Array.from(map.values()).filter(c => c.status === 'pending');
    saveLocalCachedConnections(Array.from(map.values()));
    return merged;
  } catch (err) {
    console.warn('Firestore getDoctorPendingRequests failed:', err);
    return cached;
  }
}

export async function getDoctorAcceptedConnections(doctorId: string): Promise<DoctorConnection[]> {
  const cached = getLocalCachedConnections().filter(c => c.doctorId === doctorId && c.status === 'accepted');
  if (!isFirebaseConfigured) return cached;
  try {
    const connRef = collection(firestore, 'connections');
    const q = query(connRef, where('doctorId', '==', doctorId), where('status', '==', 'accepted'));
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => d.data() as DoctorConnection);
    const map = new Map<string, DoctorConnection>();
    cached.forEach(c => map.set(c.id, c));
    remote.forEach(r => map.set(r.id, r));
    const merged = Array.from(map.values()).filter(c => c.status === 'accepted');
    return merged;
  } catch (err) {
    console.warn('Firestore getDoctorAcceptedConnections failed:', err);
    return cached;
  }
}

export async function getPatientConnections(patientId: string): Promise<DoctorConnection[]> {
  const cached = getLocalCachedConnections().filter(c => c.patientId === patientId);
  if (!isFirebaseConfigured) return cached;
  try {
    const connRef = collection(firestore, 'connections');
    const q = query(connRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => d.data() as DoctorConnection);
    const map = new Map<string, DoctorConnection>();
    cached.forEach(c => map.set(c.id, c));
    remote.forEach(r => map.set(r.id, r));
    const merged = Array.from(map.values());
    saveLocalCachedConnections(merged);
    return merged;
  } catch (err) {
    console.warn('Firestore getPatientConnections failed:', err);
    return cached;
  }
}

export async function respondToConnectionRequest(
  connectionId: string, 
  status: 'accepted' | 'rejected'
): Promise<void> {
  const respondedAt = new Date().toISOString();
  
  // Cache update
  const list = getLocalCachedConnections().map(c => {
    if (c.id === connectionId) {
      return { ...c, status, respondedAt };
    }
    return c;
  });
  saveLocalCachedConnections(list);

  if (isFirebaseConfigured) {
    try {
      const connRef = doc(firestore, 'connections', connectionId);
      await updateDoc(connRef, { status, respondedAt });
    } catch (err) {
      console.warn('Firestore respondToConnectionRequest failed:', err);
    }
  }
}

export async function revokeDoctorConnection(connectionId: string): Promise<void> {
  const list = getLocalCachedConnections().filter(c => c.id !== connectionId);
  saveLocalCachedConnections(list);

  if (isFirebaseConfigured) {
    try {
      const connRef = doc(firestore, 'connections', connectionId);
      await deleteDoc(connRef);
    } catch (err) {
      console.warn('Firestore revokeDoctorConnection failed:', err);
    }
  }
}

// ============================================================
// Reports, Labs & Medications Persistence
// ============================================================

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

export async function saveReportAndLabsToFirestore(report: MedicalReport, labs: LabResult[]): Promise<void> {
  await Promise.all([
    saveReportToFirestore(report),
    saveLabsToFirestore(labs)
  ]);
}

export async function loadPatientReportsFromFirestore(patientId: string): Promise<MedicalReport[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const repRef = collection(firestore, 'reports');
    const q = query(repRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as MedicalReport);
  } catch (err) {
    console.warn('Firestore load reports failed:', err);
    return [];
  }
}

export async function loadPatientLabsFromFirestore(patientId: string): Promise<LabResult[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const labRef = collection(firestore, 'labs');
    const q = query(labRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as LabResult);
  } catch (err) {
    console.warn('Firestore load labs failed:', err);
    return [];
  }
}

export async function saveAuditEntryToFirestore(entry: AuditEntry): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const audRef = doc(firestore, 'auditLog', entry.id);
    await setDoc(audRef, entry, { merge: true });
  } catch (err) {
    console.warn('Firestore audit save failed:', err);
  }
}