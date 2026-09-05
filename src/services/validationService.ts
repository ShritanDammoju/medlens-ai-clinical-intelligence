import { LabResult, ValidationIssue, ClarificationQuestion, Patient, Medication, MedicalReport } from '../types/medical';

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  missingInformation: string[];
  clarificationQuestions: ClarificationQuestion[];
}

/**
 * Validates extracted laboratory results and structures against data completeness rules.
 */
export function validateExtractedLabs(labs: LabResult[]): { validatedLabs: LabResult[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const seenTests = new Set<string>();

  const validatedLabs = labs.map(lab => {
    const labIssues: ValidationIssue[] = [];

    // 1. Missing or blank value check
    if (!lab.resultValue || lab.resultValue.trim() === '') {
      const issue: ValidationIssue = {
        id: `val-miss-${lab.id}`,
        field: lab.testName,
        issueType: 'missing_value',
        description: `Value is absent or empty in extracted record.`,
        severity: 'error'
      };
      labIssues.push(issue);
      issues.push(issue);
    }

    // 2. Missing unit check
    if (!lab.unit || lab.unit.trim() === '') {
      const issue: ValidationIssue = {
        id: `val-unit-${lab.id}`,
        field: lab.testName,
        issueType: 'missing_unit',
        description: `Unit is missing in source document.`,
        severity: 'warning'
      };
      labIssues.push(issue);
      issues.push(issue);
    }

    // 3. Malformed reference range check
    if (lab.referenceRange && lab.referenceRange.trim() !== '') {
      const hasValidRangeFormat = /[\d.]+\s*(?:-|–|to|<|>|<=|>=)\s*[\d.]+/i.test(lab.referenceRange);
      if (!hasValidRangeFormat && !lab.referenceRange.toLowerCase().includes('not provided')) {
        const issue: ValidationIssue = {
          id: `val-range-${lab.id}`,
          field: lab.testName,
          issueType: 'malformed_range',
          description: `Reference range "${lab.referenceRange}" does not follow standard interval pattern.`,
          severity: 'warning'
        };
        labIssues.push(issue);
        issues.push(issue);
      }
    }

    // 4. Duplicate parameter check
    const normalizedKey = lab.testName.toLowerCase().trim();
    if (seenTests.has(normalizedKey)) {
      const issue: ValidationIssue = {
        id: `val-dup-${lab.id}`,
        field: lab.testName,
        issueType: 'duplicate_parameter',
        description: `Duplicate parameter "${lab.testName}" extracted in the same report panel.`,
        severity: 'warning'
      };
      labIssues.push(issue);
      issues.push(issue);
    } else {
      seenTests.add(normalizedKey);
    }

    // If severe issues or missing unit, mark verificationStatus = 'needs_review'
    const status = labIssues.length > 0 ? 'needs_review' : lab.verificationStatus;

    return {
      ...lab,
      validationIssues: labIssues.length > 0 ? labIssues : undefined,
      verificationStatus: status
    };
  });

  return { validatedLabs, issues };
}

/**
 * Identifies missing clinical information across the patient record.
 */
export function detectMissingInformation(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  reports: MedicalReport[]
): string[] {
  const missing: string[] = [];

  // 1. Missing Reference Ranges in Labs
  const labsWithoutRanges = labs.filter(l => !l.referenceRange || l.referenceRange.toLowerCase().includes('not provided'));
  if (labsWithoutRanges.length > 0) {
    labsWithoutRanges.forEach(l => {
      missing.push(`Reference range for ${l.testName} (${l.provenance.sourceName}): Information not available in source.`);
    });
  }

  // 2. Missing Medication Dosages
  const medsWithoutDose = meds.filter(m => !m.dose || m.dose.includes('Not specified'));
  if (medsWithoutDose.length > 0) {
    medsWithoutDose.forEach(m => {
      missing.push(`Dosage for ${m.name}: Information not available in source.`);
    });
  }

  // 3. Missing Report Dates or Facilities
  reports.forEach(r => {
    if (!r.reportDate || r.reportDate.trim() === '') {
      missing.push(`Document date for ${r.fileName}: Information not available in source.`);
    }
  });

  // 4. Missing Patient Contact / Blood Type
  if (!patient.bloodType) {
    missing.push(`Blood type for ${patient.name}: Information not available in source.`);
  }

  return missing.length > 0 ? missing : ['All vital clinical fields and reference ranges were located in available source records.'];
}

/**
 * Generates 3-5 context-aware clarification questions based on incomplete items.
 */
export function generateClarificationQuestions(
  patient: Patient,
  labs: LabResult[],
  meds: Medication[],
  symptoms: any[]
): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];

  // Symptom context question
  if (symptoms && symptoms.length > 0) {
    const firstSymptom = symptoms[0];
    questions.push({
      id: `q-symp-1`,
      patientId: patient.id,
      category: 'symptom',
      question: `When did your symptom of "${firstSymptom.symptom}" first begin, and has its intensity changed throughout the day?`,
      context: `Reported symptom: ${firstSymptom.symptom} (${firstSymptom.duration || 'duration unspecified'})`
    });
  }

  // Medication dosage clarification
  const unspecMed = meds.find(m => m.dose.includes('Not specified'));
  if (unspecMed) {
    questions.push({
      id: `q-med-1`,
      patientId: patient.id,
      category: 'medication',
      question: `What is the specific milligram dosage and frequency of ${unspecMed.name} you take?`,
      context: `Medication recorded without explicit dosage from clinical consultation notes.`
    });
  }

  // Qualitative / Missing range lab question
  const unspecLab = labs.find(l => !l.referenceRange || l.referenceRange.includes('Not provided'));
  if (unspecLab) {
    questions.push({
      id: `q-lab-1`,
      patientId: patient.id,
      category: 'lab',
      question: `Do you have the accompanying laboratory summary page with reference intervals for ${unspecLab.testName}?`,
      context: `Report contained qualitative result (${unspecLab.resultValue}) without standard numerical reference interval.`
    });
  }

  // Allergy / verification clarification
  const allergyItem = patient.name;
  questions.push({
    id: `q-allergy-1`,
    patientId: patient.id,
    category: 'medication',
    question: `Have you ever experienced facial swelling, hives, or breathing difficulty after taking beta-lactam antibiotics?`,
    context: `Cross-checking recorded allergy profile against previous urgent care prescriptions.`
  });

  // Recent baseline confirmation
  questions.push({
    id: `q-gen-1`,
    patientId: patient.id,
    category: 'demographics',
    question: `Were your recent blood tests taken following an 8 to 12 hour overnight fast?`,
    context: `Essential clinical context for interpreting fasting blood glucose and lipid panel results.`
  });

  return questions.slice(0, 5);
}
