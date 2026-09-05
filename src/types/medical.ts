export type ProvenanceLabel = 
  | 'Patient Provided'
  | 'Extracted from Report'
  | 'AI Generated'
  | 'AI Inferred'
  | 'Needs Verification'
  | 'Verified';

export type VerificationStatus = 
  | 'verified'
  | 'needs_review'
  | 'unverified'
  | 'rejected';

export type LabStatus = 
  | 'LOW' 
  | 'NORMAL' 
  | 'HIGH' 
  | 'Cannot determine';

export type ConflictSeverity = 
  | 'Informational' 
  | 'Needs Review' 
  | 'Important';

export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  isVerifiedReviewer?: boolean;
  createdAt: string;
}

export interface SourceProvenance {
  sourceName: string;
  sourceType: 'report' | 'patient_intake' | 'ai_inference';
  provenance: ProvenanceLabel;
  confidence?: number; // 0 to 100
  snippet?: string; // Original verbatim context from source
  pageNumber?: number;
  extractedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AuditEntry {
  id: string;
  fieldId: string;
  fieldName: string;
  originalValue: string;
  updatedValue: string;
  timestamp: string;
  reviewerName: string;
  action: 'edit' | 'verify' | 'reject' | 'acknowledge_conflict';
  verificationStatus: VerificationStatus;
}

export interface ClarificationQuestion {
  id: string;
  patientId: string;
  question: string;
  context: string;
  category: 'symptom' | 'medication' | 'lab' | 'demographics';
  answer?: string;
}

export interface ValidationIssue {
  id: string;
  field: string;
  issueType: 'missing_value' | 'invalid_number' | 'invalid_date' | 'missing_unit' | 'malformed_range' | 'duplicate_parameter' | 'incomplete_info';
  description: string;
  severity: 'warning' | 'error';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  dob: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  reportDate: string;
  facility?: string;
  doctor?: string;
  category: 'Hematology' | 'Metabolic' | 'Lipid' | 'General Health' | 'Prescription' | 'Other' | 'Diagnostic Report' | 'Endocrine' | 'Urinalysis' | 'Cardiology' | string;
  rawTextPreview: string;
  status: 'processing' | 'ready' | 'verified' | 'error';
  extractedItemsCount: number;
  verifiedItemsCount: number;
  storagePath?: string;
  uploadedBy?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  reportId?: string;
  testName: string; // Normalized name (e.g. Hemoglobin)
  originalTestName?: string; // Verbatim term from source (e.g. Hb, HGB)
  category?: string;
  resultValue: string;
  numericValue?: number;
  unit: string;
  referenceRange: string | null; // NULL if missing in source
  status: LabStatus;
  statusExplanation?: string;
  date: string;
  observation?: string;
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
  validationIssues?: ValidationIssue[];
}

export interface Medication {
  id: string;
  patientId: string;
  reportId?: string;
  name: string;
  dose: string;
  frequency: string;
  route?: string;
  startDate?: string;
  prescribedBy?: string;
  indication?: string;
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
}

export interface Condition {
  id: string;
  patientId: string;
  name: string;
  diagnosedDate?: string;
  status: 'Active' | 'Resolved' | 'Suspected' | 'Historical';
  notes?: string;
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Unknown';
  identifiedDate?: string;
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
}

export interface Symptom {
  id: string;
  patientId: string;
  symptom: string;
  duration?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
}

export interface MedicalObservation {
  id: string;
  patientId: string;
  reportId?: string;
  title: string;
  description: string;
  date: string;
  category: 'Clinical' | 'Imaging' | 'Laboratory' | 'General';
  provenance: SourceProvenance;
  verificationStatus: VerificationStatus;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  title: string;
  description: string;
  category: 'report' | 'medication' | 'lab' | 'intake' | 'observation';
  sourceName: string;
  provenance: ProvenanceLabel;
  relatedEntityId?: string;
}

export interface DataConflict {
  id: string;
  patientId: string;
  title: string;
  description: string;
  severity: ConflictSeverity;
  itemA: {
    label: string;
    value: string;
    source: string;
    provenance: ProvenanceLabel;
  };
  itemB: {
    label: string;
    value: string;
    source: string;
    provenance: ProvenanceLabel;
  };
  recommendation: string;
  resolved: boolean;
}

export interface AIInsightSummary {
  patientFriendlySummary: string;
  keyObservations: string[];
  abnormalValues: Array<{
    testName: string;
    value: string;
    referenceRange: string;
    status: LabStatus;
    source: string;
    note: string;
  }>;
  missingInformation: string[];
  questionsForReview: string[];
  aiModelUsed: 'Gemini' | 'Demo / Local Deterministic Engine';
  generatedAt: string;
}

export interface ComparisonRow {
  testName: string;
  originalTestName?: string;
  unit: string;
  previousValue: string;
  previousDate: string;
  previousRange: string | null;
  currentValue: string;
  currentDate: string;
  currentRange: string | null;
  currentStatus: LabStatus;
  changeDirection: 'Increased' | 'Decreased' | 'Unchanged';
  delta?: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: Array<{
    sourceName: string;
    refRange?: string;
    status?: string;
    testName?: string;
    value?: string;
  }>;
  suggestedActions?: string[];
}
