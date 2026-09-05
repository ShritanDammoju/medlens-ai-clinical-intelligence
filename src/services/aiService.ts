import { AIInsightSummary, LabResult, Medication, Patient, MedicalReport, DataConflict } from '../types/medical';

// Check for free-tier Gemini API key via environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export type AIMode = 'Gemini' | 'Demo';

export function getAIMode(): AIMode {
  return GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10 ? 'Gemini' : 'Demo';
}

/**
 * Generates an intelligent, clinically responsible summary for the patient.
 * If Gemini API key is present, calls the Gemini API with strict healthcare safety prompts.
 * Otherwise, falls back to the deterministic client-side Local AI Engine.
 */
export async function generatePatientInsights(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  reports: MedicalReport[],
  conflicts: DataConflict[]
): Promise<AIInsightSummary> {
  const mode = getAIMode();

  if (mode === 'Gemini') {
    try {
      const geminiResult = await callGeminiAPI(patient, labs, meds, reports, conflicts);
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn('Gemini API request failed or timed out. Gracefully falling back to Local AI Engine:', err);
    }
  }

  // High-Quality Deterministic Local AI fallback
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
    aiModelUsed: 'Demo / Local Deterministic Engine',
    generatedAt: new Date().toISOString()
  };
}

/**
 * Direct call to Gemini 1.5/2.0 API via HTTP endpoint when key is provided
 */
async function callGeminiAPI(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  reports: MedicalReport[],
  conflicts: DataConflict[]
): Promise<AIInsightSummary | null> {
  const prompt = `You are the clinical summarization engine of MedLens.
CRITICAL MEDICAL SAFETY RULES:
1. Explain information in clear, simple language for a patient.
2. Mention observations and abnormal values based ONLY on provided source reference ranges.
3. NEVER diagnose a disease (e.g. NEVER say "you have diabetes" or "you have anemia").
4. NEVER prescribe or recommend medications, dosage changes, or treatments.
5. Mention missing information and uncertainty clearly.
6. Return purely valid JSON matching the schema below.

PATIENT:
Name: ${patient.name}, Age: ${patient.age}, Sex: ${patient.sex}

LAB RESULTS:
${JSON.stringify(labs.map(l => ({ test: l.testName, value: l.resultValue, unit: l.unit, refRange: l.referenceRange, status: l.status, source: l.provenance.sourceName })))}

MEDICATIONS:
${JSON.stringify(meds.map(m => ({ name: m.name, dose: m.dose, freq: m.frequency, source: m.provenance.sourceName })))}

REPORTS:
${JSON.stringify(reports.map(r => ({ title: r.title, date: r.reportDate })))}

POTENTIAL CONFLICTS:
${JSON.stringify(conflicts.map(c => ({ title: c.title, desc: c.description })))}

JSON Output Schema:
{
  "patientFriendlySummary": "string",
  "keyObservations": ["string"],
  "abnormalValues": [{"testName": "string", "value": "string", "referenceRange": "string", "status": "LOW|HIGH|NORMAL", "source": "string", "note": "string"}],
  "missingInformation": ["string"],
  "questionsForReview": ["string"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) return null;

  const parsed = JSON.parse(textContent);
  return {
    ...parsed,
    aiModelUsed: 'Gemini',
    generatedAt: new Date().toISOString()
  };
}
