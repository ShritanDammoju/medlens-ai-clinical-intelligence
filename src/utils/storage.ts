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
  AuditEntry
} from '../types/medical';
import {
  DEMO_PATIENT,
  DEMO_REPORTS,
  DEMO_LAB_RESULTS,
  DEMO_MEDICATIONS,
  DEMO_CONDITIONS,
  DEMO_ALLERGIES,
  DEMO_SYMPTOMS,
  DEMO_OBSERVATIONS,
  DEMO_TIMELINE,
  DEMO_CONFLICTS,
  DEMO_AI_INSIGHTS,
  DEMO_AUDIT_LOG
} from '../data/demoData';

const KEYS = {
  PATIENTS: 'medlens_patients',
  ACTIVE_PATIENT_ID: 'medlens_active_patient_id',
  REPORTS: 'medlens_reports',
  LABS: 'medlens_labs',
  MEDS: 'medlens_meds',
  CONDITIONS: 'medlens_conditions',
  ALLERGIES: 'medlens_allergies',
  SYMPTOMS: 'medlens_symptoms',
  OBSERVATIONS: 'medlens_observations',
  TIMELINE: 'medlens_timeline',
  CONFLICTS: 'medlens_conflicts',
  AI_INSIGHTS: 'medlens_ai_insights',
  AUDIT_LOG: 'medlens_audit_log',
  INITIALIZED: 'medlens_initialized'
};

export interface AppState {
  patients: Patient[];
  activePatientId: string;
  reports: MedicalReport[];
  labs: LabResult[];
  meds: Medication[];
  conditions: Condition[];
  allergies: Allergy[];
  symptoms: Symptom[];
  observations: MedicalObservation[];
  timeline: TimelineEvent[];
  conflicts: DataConflict[];
  aiInsights: Record<string, AIInsightSummary>;
  auditLog: AuditEntry[];
}

export function loadAppState(): AppState {
  try {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      return initializeWithDemoData();
    }

    const patients: Patient[] = JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]');
    const activePatientId: string = localStorage.getItem(KEYS.ACTIVE_PATIENT_ID) || (patients[0]?.id || DEMO_PATIENT.id);
    const reports: MedicalReport[] = JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]');
    const labs: LabResult[] = JSON.parse(localStorage.getItem(KEYS.LABS) || '[]');
    const meds: Medication[] = JSON.parse(localStorage.getItem(KEYS.MEDS) || '[]');
    const conditions: Condition[] = JSON.parse(localStorage.getItem(KEYS.CONDITIONS) || '[]');
    const allergies: Allergy[] = JSON.parse(localStorage.getItem(KEYS.ALLERGIES) || '[]');
    const symptoms: Symptom[] = JSON.parse(localStorage.getItem(KEYS.SYMPTOMS) || '[]');
    const observations: MedicalObservation[] = JSON.parse(localStorage.getItem(KEYS.OBSERVATIONS) || '[]');
    const timeline: TimelineEvent[] = JSON.parse(localStorage.getItem(KEYS.TIMELINE) || '[]');
    const conflicts: DataConflict[] = JSON.parse(localStorage.getItem(KEYS.CONFLICTS) || '[]');
    const aiInsights: Record<string, AIInsightSummary> = JSON.parse(localStorage.getItem(KEYS.AI_INSIGHTS) || '{}');
    const auditLog: AuditEntry[] = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOG) || '[]');

    if (patients.length === 0) {
      return initializeWithDemoData();
    }

    return {
      patients,
      activePatientId,
      reports,
      labs,
      meds,
      conditions,
      allergies,
      symptoms,
      observations,
      timeline,
      conflicts,
      aiInsights,
      auditLog: auditLog.length > 0 ? auditLog : DEMO_AUDIT_LOG
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return initializeWithDemoData();
  }
}

export function initializeWithDemoData(): AppState {
  const state: AppState = {
    patients: [DEMO_PATIENT],
    activePatientId: DEMO_PATIENT.id,
    reports: DEMO_REPORTS,
    labs: DEMO_LAB_RESULTS,
    meds: DEMO_MEDICATIONS,
    conditions: DEMO_CONDITIONS,
    allergies: DEMO_ALLERGIES,
    symptoms: DEMO_SYMPTOMS,
    observations: DEMO_OBSERVATIONS,
    timeline: DEMO_TIMELINE,
    conflicts: DEMO_CONFLICTS,
    aiInsights: {
      [DEMO_PATIENT.id]: DEMO_AI_INSIGHTS
    },
    auditLog: DEMO_AUDIT_LOG
  };

  saveAppState(state);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  return state;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(state.patients));
    localStorage.setItem(KEYS.ACTIVE_PATIENT_ID, state.activePatientId);
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(state.reports));
    localStorage.setItem(KEYS.LABS, JSON.stringify(state.labs));
    localStorage.setItem(KEYS.MEDS, JSON.stringify(state.meds));
    localStorage.setItem(KEYS.CONDITIONS, JSON.stringify(state.conditions));
    localStorage.setItem(KEYS.ALLERGIES, JSON.stringify(state.allergies));
    localStorage.setItem(KEYS.SYMPTOMS, JSON.stringify(state.symptoms));
    localStorage.setItem(KEYS.OBSERVATIONS, JSON.stringify(state.observations));
    localStorage.setItem(KEYS.TIMELINE, JSON.stringify(state.timeline));
    localStorage.setItem(KEYS.CONFLICTS, JSON.stringify(state.conflicts));
    localStorage.setItem(KEYS.AI_INSIGHTS, JSON.stringify(state.aiInsights));
    localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(state.auditLog || []));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearAllData(): void {
  localStorage.clear();
}
