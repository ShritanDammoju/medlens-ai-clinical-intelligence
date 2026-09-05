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
  AuditEntry,
  UserProfile
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

export function createEmptyAppState(): AppState {
  return {
    patients: [],
    activePatientId: '',
    reports: [],
    labs: [],
    meds: [],
    conditions: [],
    allergies: [],
    symptoms: [],
    observations: [],
    timeline: [],
    conflicts: [],
    aiInsights: {},
    auditLog: []
  };
}

export function initializeWithDemoData(): AppState {
  return {
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
}

export function loadUserAppState(userId: string): AppState {
  try {
    const raw = localStorage.getItem(`medlens_user_state_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load user state from localStorage:', e);
  }
  return createEmptyAppState();
}

export function saveUserAppState(userId: string, state: AppState): void {
  try {
    localStorage.setItem(`medlens_user_state_${userId}`, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save user state to localStorage:', err);
  }
}

// Fallback legacy loaders for backward compatibility
export function loadAppState(): AppState {
  return createEmptyAppState();
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem('medlens_app_state', JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
}

export function clearAllData(): void {
  localStorage.clear();
}
