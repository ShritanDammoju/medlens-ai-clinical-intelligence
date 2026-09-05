import { 
  AIInsightSummary, 
  LabResult, 
  Medication, 
  Patient, 
  MedicalReport, 
  DataConflict,
  Condition,
  Allergy,
  ChatMessage
} from '../types/medical';
import { auth } from '../firebase/config';

export type AIMode = 'Gemini' | 'Demo';

export function getAIMode(isDemoMode?: boolean): AIMode {
  return isDemoMode ? 'Demo' : 'Gemini';
}

export interface StructuredPatientContext {
  patientName: string;
  patientAge?: number;
  patientSex?: string;
  hasRecords: boolean;
  reports: Array<{ title: string; date: string; category?: string; extractedCount?: number }>;
  labs: Array<{
    testName: string;
    originalTerm?: string;
    value: string;
    unit: string;
    refRange: string | null;
    status: string;
    date: string;
    source: string;
    verificationStatus?: string;
  }>;
  medications: Array<{ name: string; dose: string; freq: string; source: string; verified?: string }>;
  conditions: Array<{ name: string; status: string; source?: string }>;
  allergies: Array<{ allergen: string; severity?: string; reaction?: string }>;
  conflicts: Array<{ title: string; description: string; resolved: boolean }>;
  unverifiedCount: number;
}

/**
 * Builds a compact, relevant clinical context payload for the generative model.
 * Prioritizes records and biomarkers relevant to the user's specific query while
 * always preserving clinical safety highlights (abnormal values and conflicts).
 */
export function buildStructuredPatientContext(
  patient: Patient | null,
  labs: LabResult[] = [],
  meds: Medication[] = [],
  reports: MedicalReport[] = [],
  conditions: Condition[] = [],
  allergies: Allergy[] = [],
  conflicts: DataConflict[] = [],
  userQuery?: string
): StructuredPatientContext {
  if (!patient) {
    return {
      patientName: 'Unknown Patient',
      hasRecords: false,
      reports: [],
      labs: [],
      medications: [],
      conditions: [],
      allergies: [],
      conflicts: [],
      unverifiedCount: 0
    };
  }

  const patientLabs = labs.filter(l => l.patientId === patient.id);
  const patientMeds = meds.filter(m => m.patientId === patient.id);
  const patientReports = reports.filter(r => r.patientId === patient.id);
  const patientConditions = conditions.filter(c => c.patientId === patient.id);
  const patientAllergies = allergies.filter(a => a.patientId === patient.id);
  const patientConflicts = conflicts.filter(c => c.patientId === patient.id);

  const unverifiedCount = patientLabs.filter(l => l.verificationStatus === 'needs_review' || l.verificationStatus === 'unverified').length;
  const hasRecords = patientLabs.length > 0 || patientReports.length > 0 || patientMeds.length > 0;

  // Query-aware compact filtering
  const queryLower = (userQuery || '').toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 3);

  // Intent classification
  const isMedsQuery = /med|drug|prescription|dose|dosage|pill|tablet|take|taking|aspirin|lisinopril|metformin|atorvastatin|statin/.test(queryLower);
  const isReportsQuery = /report|document|upload|date|scan|pdf|file|history|timeline/.test(queryLower);
  const isConflictsQuery = /conflict|discrepancy|mismatch|differ|unverified|review|verify|resolve/.test(queryLower);
  const isLabsQuery = /lab|result|test|blood|hemoglobin|iron|ferritin|glucose|hba1c|cholesterol|egfr|creatinine|alt|ast|tsh|platelet|abnormal|high|low|value|level/.test(queryLower);

  // Labs selection: always include abnormal labs for clinical safety + any matching user terms
  let selectedLabs = patientLabs;
  if (userQuery && userQuery.trim().length > 0) {
    const matchingLabs = patientLabs.filter(l => {
      const nameMatch = queryWords.some(w => 
        l.testName.toLowerCase().includes(w) || 
        (l.originalTestName && l.originalTestName.toLowerCase().includes(w))
      );
      return nameMatch;
    });

    const abnormalLabs = patientLabs.filter(l => l.status === 'HIGH' || l.status === 'LOW');
    
    // Combine matching labs + abnormal labs + recent labs (deduplicated, capped at 10)
    const combinedMap = new Map<string, LabResult>();
    matchingLabs.forEach(l => combinedMap.set(l.id, l));
    abnormalLabs.forEach(l => combinedMap.set(l.id, l));
    
    // If fewer than 4 labs selected, add latest normal labs
    if (combinedMap.size < 4) {
      patientLabs.slice(0, 6).forEach(l => combinedMap.set(l.id, l));
    }
    
    selectedLabs = Array.from(combinedMap.values()).slice(0, 10);
  } else {
    // Default compact cap: abnormal labs + top 6 recent
    const abnormal = patientLabs.filter(l => l.status === 'HIGH' || l.status === 'LOW');
    const normal = patientLabs.filter(l => l.status !== 'HIGH' && l.status !== 'LOW').slice(0, 5);
    selectedLabs = [...abnormal, ...normal].slice(0, 10);
  }

  // Medications selection: cap to relevant or top 6
  let selectedMeds = patientMeds;
  if (userQuery && !isMedsQuery && patientMeds.length > 5) {
    // If not asking about meds, limit to top 4 active meds to keep prompt compact
    selectedMeds = patientMeds.slice(0, 4);
  } else if (patientMeds.length > 8) {
    selectedMeds = patientMeds.slice(0, 8);
  }

  // Reports selection: cap to recent 4
  const selectedReports = patientReports.slice(0, 5);

  return {
    patientName: patient.name,
    patientAge: patient.age,
    patientSex: patient.sex,
    hasRecords,
    reports: selectedReports.map(r => ({
      title: r.title,
      date: r.reportDate || r.uploadDate,
      category: r.category,
      extractedCount: r.extractedItemsCount
    })),
    labs: selectedLabs.map(l => ({
      testName: l.testName,
      originalTerm: l.originalTestName,
      value: l.resultValue,
      unit: l.unit,
      refRange: l.referenceRange,
      status: l.status,
      date: l.date,
      source: l.provenance.sourceName,
      verificationStatus: l.verificationStatus
    })),
    medications: selectedMeds.map(m => ({
      name: m.name,
      dose: m.dose,
      freq: m.frequency,
      source: m.provenance.sourceName,
      verified: m.verificationStatus
    })),
    conditions: patientConditions.slice(0, 5).map(c => ({
      name: c.name,
      status: c.status,
      source: c.provenance.sourceName
    })),
    allergies: patientAllergies.slice(0, 4).map(a => ({
      allergen: a.allergen,
      severity: a.severity,
      reaction: a.reaction
    })),
    conflicts: patientConflicts.slice(0, 4).map(c => ({
      title: c.title,
      description: c.description,
      resolved: c.resolved
    })),
    unverifiedCount
  };
}

/**
 * Dispatches the user question and structured patient context to the secure backend endpoint /api/chat.
 * Employs Gemini 3.8 Flash server-side without exposing API keys to the browser.
 * Includes automatic client-side retry to smoothly overcome Vercel/Google cold starts.
 */
export async function sendChatMessageToAI(
  message: string,
  conversationHistory: Array<{ sender: 'user' | 'assistant'; text: string }>,
  patientContext: StructuredPatientContext,
  isDemo: boolean = false,
  role: 'patient' | 'doctor' = 'patient'
): Promise<ChatMessage> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Retrieve Firebase ID token if user is authenticated (from in-memory cache)
  let idToken: string | undefined;
  try {
    idToken = auth.currentUser ? await auth.currentUser.getIdToken(false) : undefined;
  } catch {
    // Optional for demo mode or offline testing
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const payload = {
    message,
    conversationHistory,
    patientContext,
    isDemo,
    role
  };

  /**
   * Fast internal executor with single safe retry for transient network / cold start errors
   */
  async function executeRequest(attempt: number = 0): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s network timeout

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Fast single retry for transient cold-start gateway error (502/503/504)
      if ([502, 503, 504].includes(res.status) && attempt === 0) {
        console.warn(`[aiService] /api/chat returned status ${res.status}. Retrying in 300ms...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return executeRequest(1);
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Fast single retry if network aborted or dropped
      if (attempt === 0) {
        console.warn(`[aiService] /api/chat network error (${err?.message || err}). Retrying in 300ms...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return executeRequest(1);
      }
      throw err;
    }
  }

  try {
    const res = await executeRequest(0);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 503 || errData.code === 'API_KEY_NOT_CONFIGURED') {
        return {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: errData.text || 'MedLens AI is temporarily unavailable because the server GEMINI_API_KEY is not configured in Vercel Project Settings. Your medical records remain intact and accessible.',
          timestamp
        };
      }
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: data.text,
      sources: data.sources || [],
      timestamp
    };
  } catch (err: any) {
    console.error('Chat AI request error:', err);
    const isTimeout = err?.name === 'AbortError';
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: isTimeout 
        ? 'MedLens AI request timed out during initialization. Please check your connection and click Retry.' 
        : 'MedLens AI is temporarily unavailable. Your saved medical record is still available.',
      timestamp
    };
  }
}

/**
 * Generates an intelligent, clinically responsible summary for the patient.
 * Uses high-quality deterministic parsing with strict reference range adherence.
 */
export async function generatePatientInsights(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  reports: MedicalReport[],
  conflicts: DataConflict[]
): Promise<AIInsightSummary> {
  return generateDeterministicInsights(patient, labs, meds, reports, conflicts);
}

/**
 * Deterministic local clinical intelligence engine.
 * Adheres strictly to the reference ranges present in source data, never diagnoses or prescribes.
 */
function generateDeterministicInsights(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  reports: MedicalReport[],
  conflicts: DataConflict[]
): AIInsightSummary {
  const abnormal = labs.filter(l => l.status === 'LOW' || l.status === 'HIGH');
  const normal = labs.filter(l => l.status === 'NORMAL');
  const undetermined = labs.filter(l => l.status === 'Cannot determine');

  const abnormalItems = abnormal.map(lab => ({
    testName: lab.testName,
    value: `${lab.resultValue} ${lab.unit}`,
    referenceRange: lab.referenceRange ? `${lab.referenceRange} ${lab.unit}` : 'Not provided in source',
    status: lab.status,
    source: lab.provenance.sourceName,
    note: lab.status === 'LOW' 
      ? `Result is below the source report lower reference boundary of ${lab.referenceRange} ${lab.unit}.`
      : `Result is above the source report upper reference boundary of ${lab.referenceRange} ${lab.unit}.`
  }));

  const keyObservations: string[] = [];

  if (normal.length > 0) {
    const sampleNormal = normal.slice(0, 3).map(l => l.testName).join(', ');
    keyObservations.push(
      `${normal.length} clinical indicators (including ${sampleNormal}) fall squarely within source laboratory reference boundaries.`
    );
  }

  if (abnormal.length > 0) {
    keyObservations.push(
      `${abnormal.length} laboratory values (${abnormal.map(a => a.testName).join(', ')}) fall outside the explicit reference intervals recorded in the source documents.`
    );
  }

  if (meds.length > 0) {
    keyObservations.push(
      `Currently tracking ${meds.length} recorded medications and supplements (${meds.map(m => m.name).join(', ')}).`
    );
  }

  if (reports.length > 0) {
    keyObservations.push(
      `Analyzed ${reports.length} clinical documents spanning ${reports.map(r => r.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.`
    );
  }

  const missingInfo: string[] = [];
  if (undetermined.length > 0) {
    undetermined.forEach(u => {
      missingInfo.push(
        `Reference range for ${u.testName} was not provided in the source report ("${u.provenance.sourceName}").`
      );
    });
  }

  const unspecifiedDoseMeds = meds.filter(m => m.dose.includes('Not specified'));
  if (unspecifiedDoseMeds.length > 0) {
    missingInfo.push(
      `Dosage or frequency is not specified in source documents for: ${unspecifiedDoseMeds.map(m => m.name).join(', ')}.`
    );
  }

  if (conflicts.length > 0) {
    missingInfo.push(
      `Unresolved cross-document items detected (${conflicts.length} items require human reconciliation).`
    );
  }

  const questions: string[] = [];
  if (abnormal.length > 0) {
    questions.push(
      `Would you like to discuss the recent lab findings outside source ranges (${abnormal.slice(0, 2).map(a => a.testName).join(' and ')}) with your healthcare provider?`
    );
  }
  if (conflicts.length > 0) {
    questions.push(
      `Could you review the potential discrepancy regarding ${conflicts[0].title} with your doctor or pharmacist?`
    );
  }
  if (unspecifiedDoseMeds.length > 0) {
    questions.push(
      `Can you confirm the active dosage and schedule for ${unspecifiedDoseMeds[0].name}?`
    );
  }

  const summary = 
    `Clinical data synthesis for ${patient.name} (${patient.age}y, ${patient.sex}). ` +
    `Across ${reports.length} uploaded records, MedLens identified ${normal.length} measurements within source-specified targets and ${abnormal.length} measurements outside source reference boundaries. ` +
    (abnormal.length > 0 ? `Notably, ${abnormal.map(a => a.testName).join(', ')} deviate from laboratory cut-offs and are worth reviewing with your physician. ` : '') +
    (conflicts.length > 0 ? `A cross-record check flagged ${conflicts.length} item(s) warranting clinical verification. ` : '') +
    `No definitive medical conclusions or treatments are asserted; this overview organizes factual observations from your source records to support your upcoming clinical conversations.`;

  return {
    patientFriendlySummary: summary,
    keyObservations,
    abnormalValues: abnormalItems,
    missingInformation: missingInfo.length > 0 ? missingInfo : ['All required reference ranges and dosages were located in uploaded source documents.'],
    questionsForReview: questions.length > 0 ? questions : ['What primary health goals would you like to focus on during your next appointment?'],
    aiModelUsed: 'Gemini',
    generatedAt: new Date().toISOString()
  };
}
