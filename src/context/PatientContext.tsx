import React, { createContext, useContext, useState, useEffect } from 'react';
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
  AuditEntry
} from '../types/medical';
import { loadAppState, saveAppState, initializeWithDemoData, AppState } from '../utils/storage';
import { getAIMode, generatePatientInsights, AIMode } from '../services/aiService';
import { evaluateLabValue } from '../utils/referenceRanges';

interface PatientContextType {
  state: AppState;
  currentPatient: Patient | null;
  aiMode: AIMode;
  isAnalyzingAI: boolean;
  searchQuery: string;
  selectedSource: SourceProvenance | null;
  auditLog: AuditEntry[];
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
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<SourceProvenance | null>(null);

  const aiMode = getAIMode();

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const currentPatient = state.patients.find(p => p.id === state.activePatientId) || state.patients[0] || null;

  const setCurrentPatientId = (id: string) => {
    setState(prev => ({ ...prev, activePatientId: id }));
  };

  const loadDemoPatient = () => {
    const freshDemoState = initializeWithDemoData();
    setState(freshDemoState);
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const newId = 'pat-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      isDemo: false
    };

    const newTimelineEvent: TimelineEvent = {
      id: 'time-' + Date.now(),
      patientId: newId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: 'Patient Intake Completed',
      description: `New patient record initiated for ${newPatient.name}.`,
      category: 'intake',
      sourceName: 'Patient Intake Form',
      provenance: 'Patient Provided',
      relatedEntityId: newId
    };

    setState(prev => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      activePatientId: newId,
      timeline: [newTimelineEvent, ...prev.timeline]
    }));

    return newPatient;
  };

  const addReportAndLabs = (report: MedicalReport, newLabs: LabResult[]) => {
    const newTimelineEvent: TimelineEvent = {
      id: 'time-' + Date.now(),
      patientId: report.patientId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: `${report.title} Processed`,
      description: `Extracted and normalized ${newLabs.length} laboratory test items from ${report.fileName}.`,
      category: 'report',
      sourceName: report.fileName,
      provenance: 'Extracted from Report',
      relatedEntityId: report.id
    };

    setState(prev => ({
      ...prev,
      reports: [report, ...prev.reports],
      labs: [...newLabs, ...prev.labs],
      timeline: [newTimelineEvent, ...prev.timeline]
    }));
  };

  const updateLabVerification = (
    labId: string,
    status: VerificationStatus,
    updatedValue?: string,
    updatedRange?: string,
    reviewerName: string = 'Dr. Evelyn Reed, MD'
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

      // Append to audit log
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
        reviewerName: 'Dr. Evelyn Reed, MD',
        action: 'acknowledge_conflict',
        verificationStatus: 'verified'
      };

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
        closeSourceInspector
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
