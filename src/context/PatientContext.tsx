import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  MedicalReport,
  LabResult,
  Medication,
  Condition,
  Allergy,
  Symptom,
  MedicalObservation,
  TimelineEvent,
  DataConflict,
  AIInsightSummary,
  SourceProvenance,
  VerificationStatus,
  AuditEntry,
  DoctorConnection
} from '../types/medical';
import { 
  loadUserAppState, 
  saveUserAppState, 
  initializeWithDemoData, 
  createEmptyAppState, 
  AppState 
} from '../utils/storage';
import { useAuth } from '../firebase/AuthContext';
import { getAIMode, generatePatientInsights, AIMode } from '../services/aiService';
import { evaluateLabValue } from '../utils/referenceRanges';
import { 
  getDoctorByCode,
  sendConnectionRequest,
  getDoctorPendingRequests,
  getDoctorAcceptedConnections,
  getPatientConnections,
  respondToConnectionRequest,
  revokeDoctorConnection,
  savePatientRecordToFirestore,
  loadPatientReportsFromFirestore,
  loadPatientLabsFromFirestore,
  saveReportAndLabsToFirestore,
  saveLabsToFirestore,
  saveAuditEntryToFirestore,
  getPatientById
} from '../firebase/firestore';

interface PatientContextType {
  state: AppState;
  currentPatient: Patient | null;
  aiMode: AIMode;
  isAnalyzingAI: boolean;
  searchQuery: string;
  selectedSource: SourceProvenance | null;
  auditLog: AuditEntry[];
  connections: DoctorConnection[];
  pendingDoctorRequests: DoctorConnection[];
  isReviewingExternalPatient: boolean;
  setSearchQuery: (query: string) => void;
  setCurrentPatientId: (id: string) => void;
  loadDemoPatient: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  addReportAndLabs: (report: MedicalReport, newLabs: LabResult[]) => void;
  updateLabVerification: (labId: string, status: VerificationStatus, updatedValue?: string, updatedRange?: string, reviewerName?: string) => void;
  updateMedicationVerification: (medId: string, status: VerificationStatus) => void;
  resolveConflict: (conflictId: string) => void;
  refreshAIInsights: () => Promise<void>;
  openSourceInspector: (provenance: SourceProvenance) => void;
  closeSourceInspector: () => void;
  connectDoctorByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  respondToConnection: (connectionId: string, status: 'accepted' | 'rejected') => Promise<void>;
  revokeConnection: (connectionId: string) => Promise<void>;
  inspectPatientRecord: (patientId: string, patientName?: string) => Promise<void>;
  exitPatientReview: () => void;
  refreshConnections: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isDemoMode, role, enterDemoMode } = useAuth();

  const [state, setState] = useState<AppState>(() => {
    if (isDemoMode) {
      return initializeWithDemoData();
    }
    if (userProfile) {
      const cached = loadUserAppState(userProfile.uid);
      if (cached.patients.length > 0) return cached;
    }
    return createEmptyAppState();
  });

  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<SourceProvenance | null>(null);
  const [connections, setConnections] = useState<DoctorConnection[]>([]);
  const [pendingDoctorRequests, setPendingDoctorRequests] = useState<DoctorConnection[]>([]);
  const [isReviewingExternalPatient, setIsReviewingExternalPatient] = useState<boolean>(false);

  const aiMode = getAIMode();

  // Load user-specific state or demo state whenever auth mode changes
  useEffect(() => {
    if (isDemoMode) {
      setState(initializeWithDemoData());
      setIsReviewingExternalPatient(false);
      return;
    }

    if (userProfile) {
      // Load cached user state
      const userState = loadUserAppState(userProfile.uid);
      if (userState.patients.length > 0) {
        setState(userState);
      } else if (userProfile.role === 'patient') {
        // Initial profile for patient
        const newPat: Patient = {
          id: userProfile.uid,
          userId: userProfile.uid,
          name: userProfile.displayName || 'Patient',
          age: 32,
          sex: 'Female',
          dob: '1994-05-15',
          email: userProfile.email,
          connectedDoctorIds: [],
          createdAt: userProfile.createdAt,
          updatedAt: new Date().toISOString(),
          isDemo: false
        };
        const freshState: AppState = {
          ...createEmptyAppState(),
          patients: [newPat],
          activePatientId: newPat.id
        };
        setState(freshState);
        saveUserAppState(userProfile.uid, freshState);
        savePatientRecordToFirestore(newPat);
      } else {
        // Doctor start state
        setState(createEmptyAppState());
      }

      // Sync from Firestore in background
      (async () => {
        try {
          if (userProfile.role === 'patient') {
            const [remoteReports, remoteLabs] = await Promise.all([
              loadPatientReportsFromFirestore(userProfile.uid),
              loadPatientLabsFromFirestore(userProfile.uid)
            ]);

            if (remoteReports.length > 0 || remoteLabs.length > 0) {
              setState(prev => ({
                ...prev,
                reports: remoteReports.length > 0 ? remoteReports : prev.reports,
                labs: remoteLabs.length > 0 ? remoteLabs : prev.labs
              }));
            }
          }
        } catch (e) {
          console.warn('Firestore sync note:', e);
        }
      })();
    } else {
      setState(createEmptyAppState());
    }
  }, [isDemoMode, userProfile?.uid, userProfile?.role]);

  // Persist state to scoped storage
  useEffect(() => {
    if (!isDemoMode && userProfile) {
      saveUserAppState(userProfile.uid, state);
    }
  }, [state, isDemoMode, userProfile?.uid]);

  // Fetch connections for patient or doctor
  const refreshConnections = useCallback(async () => {
    if (isDemoMode) {
      setConnections([]);
      setPendingDoctorRequests([]);
      return;
    }

    if (!userProfile) return;

    try {
      if (userProfile.role === 'doctor') {
        const [pending, accepted] = await Promise.all([
          getDoctorPendingRequests(userProfile.uid),
          getDoctorAcceptedConnections(userProfile.uid)
        ]);
        setPendingDoctorRequests(pending);
        setConnections(accepted);
      } else {
        const patientConns = await getPatientConnections(userProfile.uid);
        setConnections(patientConns);
      }
    } catch (e) {
      console.warn('Refresh connections notice:', e);
    }
  }, [isDemoMode, userProfile?.uid, userProfile?.role]);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  const currentPatient = state.patients.find(p => p.id === state.activePatientId) || state.patients[0] || null;

  const setCurrentPatientId = (id: string) => {
    setState(prev => ({ ...prev, activePatientId: id }));
  };

  const loadDemoPatient = () => {
    enterDemoMode();
    const freshDemoState = initializeWithDemoData();
    setState(freshDemoState);
    setIsReviewingExternalPatient(false);
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const newId = userProfile && !isDemoMode ? userProfile.uid : 'pat-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      userId: userProfile?.uid,
      createdAt: now,
      updatedAt: now,
      isDemo: Boolean(isDemoMode)
    };

    const newTimelineEvent: TimelineEvent = {
      id: 'time-' + Date.now(),
      patientId: newId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: 'Patient Intake Completed',
      description: `Clinical intake profile established for ${newPatient.name}.`,
      category: 'intake',
      sourceName: 'Patient Intake Form',
      provenance: 'Patient Provided',
      relatedEntityId: newId
    };

    setState(prev => ({
      ...prev,
      patients: [newPatient, ...prev.patients.filter(p => p.id !== newId)],
      activePatientId: newId,
      timeline: [newTimelineEvent, ...prev.timeline]
    }));

    if (!isDemoMode) {
      savePatientRecordToFirestore(newPatient);
    }

    return newPatient;
  };

  const addReportAndLabs = (report: MedicalReport, newLabs: LabResult[]) => {
    const targetPatientId = currentPatient?.id || (userProfile?.uid ?? report.patientId);

    const enrichedReport: MedicalReport = {
      ...report,
      patientId: targetPatientId,
      uploadedBy: userProfile?.uid || report.uploadedBy
    };

    const enrichedLabs = newLabs.map(l => ({
      ...l,
      patientId: targetPatientId
    }));

    const newTimelineEvent: TimelineEvent = {
      id: 'time-' + Date.now(),
      patientId: targetPatientId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: `${enrichedReport.title} Processed`,
      description: `Extracted and verified ${enrichedLabs.length} biomarker items from ${enrichedReport.fileName}.`,
      category: 'report',
      sourceName: enrichedReport.fileName,
      provenance: 'Extracted from Report',
      relatedEntityId: enrichedReport.id
    };

    setState(prev => ({
      ...prev,
      reports: [enrichedReport, ...prev.reports.filter(r => r.id !== enrichedReport.id)],
      labs: [...enrichedLabs, ...prev.labs],
      timeline: [newTimelineEvent, ...prev.timeline]
    }));

    if (!isDemoMode) {
      saveReportAndLabsToFirestore(enrichedReport, enrichedLabs);
    }
  };

  const updateLabVerification = (
    labId: string,
    status: VerificationStatus,
    updatedValue?: string,
    updatedRange?: string,
    reviewerName: string = userProfile?.displayName || 'Dr. Verified Clinician'
  ) => {
    setState(prev => {
      let targetLabName = 'Biomarker';
      let originalVal = '';
      let newVal = '';

      const updatedLabs = prev.labs.map(lab => {
        if (lab.id !== labId) return lab;

        targetLabName = lab.testName;
        originalVal = `${lab.resultValue} ${lab.unit}`;
        const val = updatedValue !== undefined ? updatedValue : lab.resultValue;
        newVal = `${val} ${lab.unit}`;
        const range = updatedRange !== undefined ? updatedRange : lab.referenceRange;
        const evalRes = evaluateLabValue(val, range);

        return {
          ...lab,
          resultValue: val,
          referenceRange: range,
          status: evalRes.status,
          statusExplanation: evalRes.explanation,
          verificationStatus: status,
          provenance: {
            ...lab.provenance,
            verifiedBy: status === 'verified' ? reviewerName : undefined,
            verifiedAt: status === 'verified' ? new Date().toISOString() : undefined
          }
        };
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const newAuditEntry: AuditEntry = {
        id: `aud-${Date.now()}`,
        fieldId: labId,
        fieldName: targetLabName,
        originalValue: originalVal,
        updatedValue: newVal || originalVal,
        timestamp: `${dateStr} ${timeStr}`,
        reviewerName,
        action: status === 'verified' ? 'verify' : status === 'rejected' ? 'reject' : 'edit',
        verificationStatus: status
      };

      if (!isDemoMode) {
        saveLabsToFirestore(updatedLabs);
        saveAuditEntryToFirestore(newAuditEntry);
      }

      return {
        ...prev,
        labs: updatedLabs,
        auditLog: [newAuditEntry, ...prev.auditLog]
      };
    });
  };

  const updateMedicationVerification = (medId: string, status: VerificationStatus) => {
    setState(prev => ({
      ...prev,
      meds: prev.meds.map(m => m.id === medId ? { ...m, verificationStatus: status } : m)
    }));
  };

  const resolveConflict = (conflictId: string) => {
    setState(prev => {
      const conflict = prev.conflicts.find(c => c.id === conflictId);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const newAuditEntry: AuditEntry = {
        id: `aud-conf-${Date.now()}`,
        fieldId: conflictId,
        fieldName: conflict ? conflict.title : 'Conflict Item',
        originalValue: 'Unresolved',
        updatedValue: 'Reconciled & Verified by Clinician',
        timestamp: `${dateStr} ${timeStr}`,
        reviewerName: userProfile?.displayName || 'Dr. Reviewer',
        action: 'acknowledge_conflict',
        verificationStatus: 'verified'
      };

      if (!isDemoMode) {
        saveAuditEntryToFirestore(newAuditEntry);
      }

      return {
        ...prev,
        conflicts: prev.conflicts.map(c => c.id === conflictId ? { ...c, resolved: true } : c),
        auditLog: [newAuditEntry, ...prev.auditLog]
      };
    });
  };

  const refreshAIInsights = async () => {
    if (!currentPatient) return;
    setIsAnalyzingAI(true);
    try {
      const patientLabs = state.labs.filter(l => l.patientId === currentPatient.id);
      const patientMeds = state.meds.filter(m => m.patientId === currentPatient.id);
      const patientReports = state.reports.filter(r => r.patientId === currentPatient.id);
      const patientConflicts = state.conflicts.filter(c => c.patientId === currentPatient.id && !c.resolved);

      const insights = await generatePatientInsights(
        currentPatient,
        patientLabs,
        patientMeds,
        patientReports,
        patientConflicts
      );

      setState(prev => ({
        ...prev,
        aiInsights: {
          ...prev.aiInsights,
          [currentPatient.id]: insights
        }
      }));
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Connect patient to doctor via code
  const connectDoctorByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!currentPatient) {
      return { success: false, message: 'Please complete your patient profile before connecting.' };
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode.startsWith('MED-') || cleanCode.length < 8) {
      return { success: false, message: 'Invalid format. Doctor codes start with MED- followed by 6 characters.' };
    }

    try {
      const doctor = await getDoctorByCode(cleanCode);
      if (!doctor) {
        return { success: false, message: `No clinician found with code ${cleanCode}. Please check the code with your doctor.` };
      }

      // Check if already requested or connected
      const existing = connections.find(c => c.doctorId === doctor.uid);
      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, message: `You are already connected with ${doctor.displayName}.` };
        }
        return { success: false, message: `Connection request already pending for ${doctor.displayName}.` };
      }

      const req = await sendConnectionRequest(currentPatient, doctor);
      setConnections(prev => [...prev.filter(c => c.id !== req.id), req]);
      return { success: true, message: `Connection request sent to ${doctor.displayName} (${doctor.specialization || 'Clinician'}). Awaiting approval.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send connection request.' };
    }
  };

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToConnectionRequest(connectionId, status);
      await refreshConnections();
    } catch (e) {
      console.warn('Respond connection error:', e);
    }
  };

  const revokeConnection = async (connectionId: string) => {
    try {
      await revokeDoctorConnection(connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      setPendingDoctorRequests(prev => prev.filter(c => c.id !== connectionId));
    } catch (e) {
      console.warn('Revoke connection error:', e);
    }
  };

  // Inspect connected patient's record (Doctor view)
  const inspectPatientRecord = async (patientId: string, patientName?: string) => {
    try {
      const [remotePatient, remoteReports, remoteLabs] = await Promise.all([
        getPatientById(patientId),
        loadPatientReportsFromFirestore(patientId),
        loadPatientLabsFromFirestore(patientId)
      ]);

      const activePat: Patient = remotePatient || {
        id: patientId,
        name: patientName || 'Connected Patient',
        age: 35,
        sex: 'Other',
        dob: '1989-01-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        patients: [activePat, ...prev.patients.filter(p => p.id !== activePat.id)],
        activePatientId: activePat.id,
        reports: remoteReports,
        labs: remoteLabs
      }));

      setIsReviewingExternalPatient(true);
    } catch (err) {
      console.warn('Failed to load patient record:', err);
    }
  };

  const exitPatientReview = () => {
    setIsReviewingExternalPatient(false);
  };

  const openSourceInspector = (provenance: SourceProvenance) => {
    setSelectedSource(provenance);
  };

  const closeSourceInspector = () => {
    setSelectedSource(null);
  };

  return (
    <PatientContext.Provider
      value={{
        state,
        currentPatient,
        aiMode,
        isAnalyzingAI,
        searchQuery,
        selectedSource,
        auditLog: state.auditLog || [],
        connections,
        pendingDoctorRequests,
        isReviewingExternalPatient,
        setSearchQuery,
        setCurrentPatientId,
        loadDemoPatient,
        addPatient,
        addReportAndLabs,
        updateLabVerification,
        updateMedicationVerification,
        resolveConflict,
        refreshAIInsights,
        openSourceInspector,
        closeSourceInspector,
        connectDoctorByCode,
        respondToConnection,
        revokeConnection,
        inspectPatientRecord,
        exitPatientReview,
        refreshConnections
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
