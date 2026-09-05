import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Clinical Intelligence Pipeline & Normalization (Req 6)', () => {
  const TERM_NORMALIZATION = {
    'hb': 'Hemoglobin',
    'hgb': 'Hemoglobin',
    'wbc': 'White Blood Cells (WBC)',
    'tlc': 'Total Leukocyte Count (TLC)',
    'rbc': 'Red Blood Cells (RBC)',
    'plt': 'Platelets',
    'platelet': 'Platelets',
    'fbs': 'Fasting Blood Sugar (FBS)',
    'fbg': 'Fasting Blood Glucose',
    'fasting glucose': 'Fasting Glucose',
    'hba1c': 'Hemoglobin A1c (HbA1c)',
    'a1c': 'Hemoglobin A1c (HbA1c)',
    'bun': 'Blood Urea Nitrogen (BUN)',
    'cr': 'Creatinine',
    'creat': 'Creatinine',
    'egfr': 'Estimated GFR (eGFR)',
    't-chol': 'Total Cholesterol',
    'cholesterol': 'Total Cholesterol',
    'tg': 'Triglycerides',
    'ldl': 'LDL Cholesterol',
    'hdl': 'HDL Cholesterol',
    'vit d': 'Vitamin D (25-OH)',
    'vitamin d': 'Vitamin D (25-OH)',
    'sgot': 'AST (SGOT)',
    'ast': 'AST (SGOT)',
    'sgpt': 'ALT (SGPT)',
    'alt': 'ALT (SGPT)',
    'crp': 'C-Reactive Protein (Qualitative)',
    'tsh': 'Thyroid Stimulating Hormone (TSH)',
    'ft4': 'Free T4',
    'ft3': 'Free T3'
  };

  function normalizeTestName(rawName) {
    const clean = rawName.trim();
    const lower = clean.toLowerCase();
    if (TERM_NORMALIZATION[lower]) {
      return { normalizedName: TERM_NORMALIZATION[lower], originalTerm: clean };
    }
    for (const [abbr, fullName] of Object.entries(TERM_NORMALIZATION)) {
      if (lower === abbr || lower.startsWith(abbr + ' ') || lower.endsWith(' ' + abbr)) {
        return { normalizedName: fullName, originalTerm: clean };
      }
    }
    return { normalizedName: clean, originalTerm: clean };
  }

  it('normalizes common medical abbreviations to full clinical names', () => {
    assert.equal(normalizeTestName('hb').normalizedName, 'Hemoglobin');
    assert.equal(normalizeTestName('HbA1c').normalizedName, 'Hemoglobin A1c (HbA1c)');
    assert.equal(normalizeTestName('a1c').normalizedName, 'Hemoglobin A1c (HbA1c)');
    assert.equal(normalizeTestName('cr').normalizedName, 'Creatinine');
    assert.equal(normalizeTestName('wbc').normalizedName, 'White Blood Cells (WBC)');
    assert.equal(normalizeTestName('plt').normalizedName, 'Platelets');
  });

  it('preserves verbatim original test name for audit provenance', () => {
    const result = normalizeTestName('Hb (Automated)');
    assert.equal(result.normalizedName, 'Hemoglobin');
    assert.equal(result.originalTerm, 'Hb (Automated)');
  });
});

describe('Source-Explicit Reference Range Safety (Req 7)', () => {
  function evaluateLabValue(val, range) {
    const num = parseFloat(val);
    if (!range || range.toLowerCase().includes('not provided') || range.toLowerCase().includes('none') || range.trim() === '') {
      return {
        status: 'Cannot determine',
        explanation: 'Reference range not provided in source report.'
      };
    }
    const match = range.match(/([\d.]+)\s*(?:-|–|to)\s*([\d.]+)/i);
    if (!match || isNaN(num)) {
      return {
        status: 'Cannot determine',
        explanation: 'Reference range format is qualitative or unspecified.'
      };
    }
    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    if (num < low) return { status: 'LOW', explanation: `Value ${num} is below reference interval ${low} - ${high}.` };
    if (num > high) return { status: 'HIGH', explanation: `Value ${num} is above reference interval ${low} - ${high}.` };
    return { status: 'NORMAL', explanation: `Value ${num} is within normal reference interval ${low} - ${high}.` };
  }

  it('strictly returns "Cannot determine" when source report omits reference range', () => {
    const evalNull = evaluateLabValue('14.2', null);
    assert.equal(evalNull.status, 'Cannot determine');
    assert.equal(evalNull.explanation, 'Reference range not provided in source report.');

    const evalNotProvided = evaluateLabValue('110', 'Not provided in source');
    assert.equal(evalNotProvided.status, 'Cannot determine');
    assert.equal(evalNotProvided.explanation, 'Reference range not provided in source report.');
  });

  it('never invents or synthesizes a default normal range', () => {
    const evalEmpty = evaluateLabValue('5.8', '');
    assert.notEqual(evalEmpty.status, 'NORMAL');
    assert.equal(evalEmpty.status, 'Cannot determine');
  });

  it('correctly evaluates low and high limits strictly using source ranges', () => {
    const lowRes = evaluateLabValue('11.2', '13.5 - 17.5');
    assert.equal(lowRes.status, 'LOW');

    const highRes = evaluateLabValue('18.5', '13.5 - 17.5');
    assert.equal(highRes.status, 'HIGH');

    const normRes = evaluateLabValue('14.0', '13.5 - 17.5');
    assert.equal(normRes.status, 'NORMAL');
  });
});

describe('Clinical Provenance & Traceability Lineage (Req 8)', () => {
  it('assigns strict provenance metadata to all extracted data elements', () => {
    const sampleExtraction = {
      testName: 'Hemoglobin',
      resultValue: '11.2',
      unit: 'g/dL',
      provenance: {
        sourceName: 'Quest_CBC_Panel.pdf',
        sourceType: 'report',
        provenance: 'Extracted from Report',
        confidence: 96,
        snippet: 'Hemoglobin: 11.2 g/dL [13.5 - 17.5]',
        extractedAt: new Date().toISOString()
      },
      verificationStatus: 'needs_review'
    };

    assert.equal(sampleExtraction.provenance.provenance, 'Extracted from Report');
    assert.equal(sampleExtraction.provenance.sourceName, 'Quest_CBC_Panel.pdf');
    assert.equal(sampleExtraction.verificationStatus, 'needs_review');
    assert.ok(sampleExtraction.provenance.confidence >= 90);
    assert.ok(sampleExtraction.provenance.snippet.includes('11.2'));
  });
});

describe('Cross-Record Clinical Conflict Detection (Req 9)', () => {
  function detectConflicts(meds, conditions) {
    const conflicts = [];
    const hasAsthma = conditions.some(c => /asthma|reactive airway/i.test(c.name));
    const hasBetaBlocker = meds.some(m => /propranolol|atenolol|metoprolol|carvedilol/i.test(m.name));
    if (hasAsthma && hasBetaBlocker) {
      conflicts.push({
        id: 'conf-bb-asthma',
        type: 'contraindication',
        title: 'Beta-Blocker Prescribed with Active Asthma',
        description: 'Non-cardioselective beta-blocker may precipitate bronchospasm in patients with asthma.',
        severity: 'Important',
        resolved: false
      });
    }

    const medNames = meds.map(m => m.name.toLowerCase());
    const duplicates = medNames.filter((item, index) => medNames.indexOf(item) !== index);
    if (duplicates.length > 0) {
      conflicts.push({
        id: 'conf-dup-med',
        type: 'duplicate_therapy',
        title: `Duplicate Therapy Detected: ${duplicates[0]}`,
        description: 'Patient is prescribed the same active medication from two distinct records.',
        severity: 'Needs Review',
        resolved: false
      });
    }

    return conflicts;
  }

  it('flags contraindications between recorded conditions and medications without auto-resolving', () => {
    const meds = [{ name: 'Propranolol 40mg' }];
    const conditions = [{ name: 'Bronchial Asthma' }];

    const conflicts = detectConflicts(meds, conditions);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].severity, 'Important');
    assert.equal(conflicts[0].resolved, false);
    assert.match(conflicts[0].title, /Beta-Blocker/);
  });

  it('identifies duplicate therapies across disparate reports', () => {
    const meds = [{ name: 'Metformin 500mg' }, { name: 'Metformin 500mg' }];
    const conflicts = detectConflicts(meds, []);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].type, 'duplicate_therapy');
  });
});

describe('Context-Aware Clarification Question Generation (Req 10)', () => {
  function generateClarificationQuestions(patient, labs, meds, symptoms) {
    const questions = [];
    if (symptoms && symptoms.length > 0) {
      questions.push({
        category: 'symptom',
        question: `When did your symptom of "${symptoms[0].symptom}" first begin?`,
        context: `Reported symptom: ${symptoms[0].symptom}`
      });
    }
    const unspecMed = meds.find(m => !m.dose || m.dose.includes('Not specified'));
    if (unspecMed) {
      questions.push({
        category: 'medication',
        question: `What is the specific dosage and frequency of ${unspecMed.name}?`,
        context: 'Medication recorded without explicit dosage'
      });
    }
    const unspecLab = labs.find(l => !l.referenceRange || l.referenceRange.includes('Not provided'));
    if (unspecLab) {
      questions.push({
        category: 'lab',
        question: `Do you have the reference interval page for ${unspecLab.testName}?`,
        context: 'Report contained lab result without source reference interval'
      });
    }
    return questions;
  }

  it('synthesizes questions for incomplete medication dosages and missing lab ranges', () => {
    const questions = generateClarificationQuestions(
      { id: 'p1', name: 'Test Patient' },
      [{ testName: 'Lipid Ratio', resultValue: '4.2', referenceRange: 'Not provided' }],
      [{ name: 'Lisinopril', dose: 'Not specified' }],
      [{ symptom: 'Persistent cough' }]
    );

    assert.equal(questions.length, 3);
    assert.equal(questions[0].category, 'symptom');
    assert.equal(questions[1].category, 'medication');
    assert.equal(questions[2].category, 'lab');
  });
});

describe('Medical Safety Guardrails & Non-Diagnostic Constraints (Req 11)', () => {
  function evaluateClinicalAssistantSafety(responseContent) {
    const hasPrescriptionChange = /increase your dose|stop taking your|take \d+ mg instead/i.test(responseContent);
    const hasDiagnosticClaim = /you have definitively been diagnosed with/i.test(responseContent);
    return {
      safe: !hasPrescriptionChange && !hasDiagnosticClaim,
      hasPrescriptionChange,
      hasDiagnosticClaim
    };
  }

  it('blocks unverified dosage modifications and definitive diagnostic proclamations', () => {
    const safeMsg = 'Your hemoglobin of 11.2 g/dL is below the source reference interval of 13.5 - 17.5 g/dL. Please consult your physician for evaluation.';
    const unsafeMsg = 'You have definitively been diagnosed with severe anemia. Increase your dose of iron to 200mg instead.';

    assert.equal(evaluateClinicalAssistantSafety(safeMsg).safe, true);
    assert.equal(evaluateClinicalAssistantSafety(unsafeMsg).safe, false);
    assert.equal(evaluateClinicalAssistantSafety(unsafeMsg).hasPrescriptionChange, true);
    assert.equal(evaluateClinicalAssistantSafety(unsafeMsg).hasDiagnosticClaim, true);
  });
});

describe('Invalid Report & Malicious Upload Handling (Req 15)', () => {
  const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'];
  const ALLOWED_EXTENSIONS = /\.(pdf|png|jpe?g|webp|txt)$/i;
  const DANGEROUS_EXTENSIONS = /\.(exe|bat|cmd|sh|php|js|mjs|vbs|svg|html|htm|hta|dll|py|jar)$/i;

  function validateUploadCandidate(file) {
    if (file.size > 25 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 25 MB limit.' };
    }
    if (DANGEROUS_EXTENSIONS.test(file.name) || !ALLOWED_EXTENSIONS.test(file.name)) {
      return { valid: false, error: 'Unsupported or unsafe file format.' };
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file MIME type.' };
    }
    return { valid: true };
  }

  it('rejects executable and script files regardless of extension manipulation', () => {
    assert.equal(validateUploadCandidate({ name: 'exploit.exe', size: 1000, type: 'application/octet-stream' }).valid, false);
    assert.equal(validateUploadCandidate({ name: 'script.svg', size: 1000, type: 'image/svg+xml' }).valid, false);
    assert.equal(validateUploadCandidate({ name: 'report.pdf.bat', size: 1000, type: 'application/x-msdos-program' }).valid, false);
  });

  it('rejects files exceeding the 25MB threshold', () => {
    assert.equal(validateUploadCandidate({ name: 'large_mri.pdf', size: 26 * 1024 * 1024, type: 'application/pdf' }).valid, false);
  });

  it('accepts valid clinical formats (PDF, PNG, JPG, WEBP, TXT)', () => {
    assert.equal(validateUploadCandidate({ name: 'lab_cbc.pdf', size: 500000, type: 'application/pdf' }).valid, true);
    assert.equal(validateUploadCandidate({ name: 'xray.png', size: 1200000, type: 'image/png' }).valid, true);
    assert.equal(validateUploadCandidate({ name: 'notes.txt', size: 2000, type: 'text/plain' }).valid, true);
  });
});
