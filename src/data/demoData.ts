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
  ComparisonRow
} from '../types/medical';

export const DEMO_PATIENT: Patient = {
  id: 'patient-demo-alex-carter',
  name: 'Alex Carter',
  age: 34,
  sex: 'Male',
  dob: '1992-05-14',
  phone: '+1 (555) 439-0182',
  email: 'alex.carter.demo@example.com',
  bloodType: 'A+',
  emergencyContact: 'Sarah Carter (Spouse) - +1 (555) 439-0199',
  notes: 'Patient enrolled in annual preventive tracking. Reports mild afternoon fatigue over the past 3 weeks.',
  createdAt: '2026-08-25T09:00:00Z',
  updatedAt: '2026-09-04T15:30:00Z',
  isDemo: true,
};

export const DEMO_REPORTS: MedicalReport[] = [
  {
    id: 'rep-cbc-2026',
    patientId: DEMO_PATIENT.id,
    title: 'Complete Blood Count (CBC) with Differential',
    fileName: 'CBC_Report_Sep2026.pdf',
    fileType: 'application/pdf',
    fileSize: '412 KB',
    uploadDate: '2026-09-04T10:14:00Z',
    reportDate: '2026-09-04',
    facility: 'Metropolitan Clinical Laboratories',
    doctor: 'Dr. Evelyn Reed, MD',
    category: 'Hematology',
    rawTextPreview: `METROPOLITAN CLINICAL LABORATORIES
PATIENT: Alex Carter | AGE: 34 | SEX: M | DOB: 14-MAY-1992
SPECIMEN ID: HEM-88921 | COLLECTION DATE: 04-SEP-2026 08:30 AM
ORDERING PHYSICIAN: Dr. Evelyn Reed, MD

COMPLETE BLOOD COUNT (CBC)
------------------------------------------------------------
TEST NAME               RESULT    UNIT        REF RANGE    FLAG
White Blood Cells (WBC) 6.4       x10^3/uL    4.0 - 11.0   NORMAL
Red Blood Cells (RBC)   4.8       x10^6/uL    4.3 - 5.9    NORMAL
Hemoglobin              13.2      g/dL        12.0 - 16.0  NORMAL
Hematocrit              39.8      %           37.0 - 48.0  NORMAL
MCV                     83.0      fL          80.0 - 100.0 NORMAL
Platelets               240       x10^3/uL    150 - 450    NORMAL
Ferritin                14        ng/mL       20 - 250     LOW
C-Reactive Protein      Negative  --          NOT PROVIDED --

CLINICAL NOTES:
Mild microcytic trend noted. Recommend correlation with iron studies. Patient reports intermittent daytime tiredness.`,
    status: 'ready',
    extractedItemsCount: 8,
    verifiedItemsCount: 6,
  },
  {
    id: 'rep-cmp-2026',
    patientId: DEMO_PATIENT.id,
    title: 'Comprehensive Metabolic Panel (CMP)',
    fileName: 'CMP_Panel_Sep2026.pdf',
    fileType: 'application/pdf',
    fileSize: '388 KB',
    uploadDate: '2026-09-04T10:15:30Z',
    reportDate: '2026-09-04',
    facility: 'Metropolitan Clinical Laboratories',
    doctor: 'Dr. Evelyn Reed, MD',
    category: 'Metabolic',
    rawTextPreview: `METROPOLITAN CLINICAL LABORATORIES
PATIENT: Alex Carter | AGE: 34 | SEX: M | DOB: 14-MAY-1992
COMPREHENSIVE METABOLIC PANEL (CMP)
DATE: 04-SEP-2026

Fasting Glucose         118       mg/dL       70 - 99      HIGH
Blood Urea Nitrogen     15        mg/dL       7 - 20       NORMAL
Creatinine              0.95      mg/dL       0.70 - 1.30  NORMAL
eGFR                    98        mL/min      > 60         NORMAL
Sodium                  140       mEq/L       136 - 145    NORMAL
Potassium               4.2       mEq/L       3.5 - 5.1    NORMAL
ALT (SGPT)              28        U/L         10 - 49      NORMAL
AST (SGOT)              24        U/L         9 - 40       NORMAL`,
    status: 'ready',
    extractedItemsCount: 8,
    verifiedItemsCount: 7,
  },
  {
    id: 'rep-lipid-2026',
    patientId: DEMO_PATIENT.id,
    title: 'Lipid & Micronutrient Assessment',
    fileName: 'Lipid_Panel_Sep2026.pdf',
    fileType: 'application/pdf',
    fileSize: '320 KB',
    uploadDate: '2026-09-04T10:16:45Z',
    reportDate: '2026-09-04',
    facility: 'Metropolitan Clinical Laboratories',
    doctor: 'Dr. Evelyn Reed, MD',
    category: 'Lipid',
    rawTextPreview: `METROPOLITAN CLINICAL LABORATORIES
PATIENT: Alex Carter | SPECIMEN: LIP-4019
LIPID & MICRONUTRIENT PROFILE - 04-SEP-2026

Total Cholesterol       210       mg/dL       < 200        HIGH
HDL Cholesterol         48        mg/dL       > 40         NORMAL
LDL Cholesterol (Calc)  142       mg/dL       < 100        HIGH
Triglycerides           135       mg/dL       < 150        NORMAL
Vitamin D (25-OH)       18        ng/mL       30 - 100     LOW`,
    status: 'ready',
    extractedItemsCount: 5,
    verifiedItemsCount: 4,
  },
  {
    id: 'rep-prev-aug2026',
    patientId: DEMO_PATIENT.id,
    title: 'Previous General Health Panel (Baseline)',
    fileName: 'General_Health_Aug2026.pdf',
    fileType: 'application/pdf',
    fileSize: '290 KB',
    uploadDate: '2026-08-10T14:20:00Z',
    reportDate: '2026-08-10',
    facility: 'Valley Health Primary Care',
    doctor: 'Dr. Marcus Vance, MD',
    category: 'General Health',
    rawTextPreview: `VALLEY HEALTH PRIMARY CARE
PATIENT: Alex Carter | DATE: 10-AUG-2026
BASELINE HEALTH CHECK

Hemoglobin              12.8      g/dL        12.0 - 16.0  NORMAL
Fasting Glucose         124       mg/dL       70 - 99      HIGH
Total Cholesterol       210       mg/dL       < 200        HIGH
Vitamin D               15        ng/mL       30 - 100     LOW`,
    status: 'verified',
    extractedItemsCount: 4,
    verifiedItemsCount: 4,
  }
];

export const DEMO_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-1',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cbc-2026',
    testName: 'Hemoglobin',
    category: 'Hematology',
    resultValue: '13.2',
    numericValue: 13.2,
    unit: 'g/dL',
    referenceRange: '12.0 - 16.0',
    status: 'NORMAL',
    statusExplanation: 'Result (13.2) is within source range (12.0�16.0)',
    date: '2026-09-04',
    observation: 'Slight improvement from 12.8 g/dL recorded on 10-Aug-2026',
    provenance: {
      sourceName: 'CBC_Report_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 94,
      snippet: 'Hemoglobin              13.2      g/dL        12.0 - 16.0  NORMAL',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:14:02Z',
      verifiedBy: 'Dr. Evelyn Reed (Verified)',
      verifiedAt: '2026-09-04T11:00:00Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-2',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cbc-2026',
    testName: 'Platelets',
    category: 'Hematology',
    resultValue: '240',
    numericValue: 240,
    unit: 'x10^3/uL',
    referenceRange: '150 - 450',
    status: 'NORMAL',
    statusExplanation: 'Result (240) is within source range (150�450)',
    date: '2026-09-04',
    provenance: {
      sourceName: 'CBC_Report_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 89,
      snippet: 'Platelets               240       x10^3/uL    150 - 450    NORMAL',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:14:02Z',
    },
    verificationStatus: 'needs_review',
  },
  {
    id: 'lab-3',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cbc-2026',
    testName: 'Ferritin',
    category: 'Hematology',
    resultValue: '14',
    numericValue: 14,
    unit: 'ng/mL',
    referenceRange: '20 - 250',
    status: 'LOW',
    statusExplanation: 'Result (14) is below the source lower limit (20)',
    date: '2026-09-04',
    observation: 'Low serum storage pool documented in laboratory notes',
    provenance: {
      sourceName: 'CBC_Report_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 96,
      snippet: 'Ferritin                14        ng/mL       20 - 250     LOW',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:14:03Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-4',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-lipid-2026',
    testName: 'Vitamin D (25-OH)',
    category: 'Micronutrient',
    resultValue: '18',
    numericValue: 18,
    unit: 'ng/mL',
    referenceRange: '30 - 100',
    status: 'LOW',
    statusExplanation: 'Result (18) is below the source lower limit (30)',
    date: '2026-09-04',
    provenance: {
      sourceName: 'Lipid_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 95,
      snippet: 'Vitamin D (25-OH)       18        ng/mL       30 - 100     LOW',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:16:48Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-5',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cmp-2026',
    testName: 'Fasting Glucose',
    category: 'Metabolic',
    resultValue: '118',
    numericValue: 118,
    unit: 'mg/dL',
    referenceRange: '70 - 99',
    status: 'HIGH',
    statusExplanation: 'Result (118) is above the source upper limit (99)',
    date: '2026-09-04',
    observation: 'Previous test was 124 mg/dL on 10-Aug-2026',
    provenance: {
      sourceName: 'CMP_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 97,
      snippet: 'Fasting Glucose         118       mg/dL       70 - 99      HIGH',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:15:32Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-6',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-lipid-2026',
    testName: 'LDL Cholesterol',
    category: 'Lipid',
    resultValue: '142',
    numericValue: 142,
    unit: 'mg/dL',
    referenceRange: '< 100',
    status: 'HIGH',
    statusExplanation: 'Result (142) exceeds source threshold (100)',
    date: '2026-09-04',
    provenance: {
      sourceName: 'Lipid_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 92,
      snippet: 'LDL Cholesterol (Calc)  142       mg/dL       < 100        HIGH',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:16:49Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-7',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-lipid-2026',
    testName: 'Total Cholesterol',
    category: 'Lipid',
    resultValue: '210',
    numericValue: 210,
    unit: 'mg/dL',
    referenceRange: '< 200',
    status: 'HIGH',
    statusExplanation: 'Result (210) exceeds source threshold (200)',
    date: '2026-09-04',
    provenance: {
      sourceName: 'Lipid_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 93,
      snippet: 'Total Cholesterol       210       mg/dL       < 200        HIGH',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:16:49Z',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'lab-8',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cbc-2026',
    testName: 'C-Reactive Protein (Qualitative)',
    category: 'Inflammatory Marker',
    resultValue: 'Negative',
    numericValue: undefined,
    unit: 'Qualitative',
    referenceRange: null, // DELIBERATELY NULL TO DEMONSTRATE "Reference range not provided in source"
    status: 'Cannot determine',
    statusExplanation: 'Reference range not provided in source',
    date: '2026-09-04',
    observation: 'Source document recorded qualitative result without reference cut-off value',
    provenance: {
      sourceName: 'CBC_Report_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 91,
      snippet: 'C-Reactive Protein      Negative  --          NOT PROVIDED --',
      pageNumber: 1,
      extractedAt: '2026-09-04T10:14:04Z',
    },
    verificationStatus: 'needs_review',
  }
];

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    patientId: DEMO_PATIENT.id,
    name: 'Lisinopril',
    dose: '10 mg',
    frequency: 'Once daily in the morning',
    route: 'Oral',
    startDate: '2025-11-10',
    prescribedBy: 'Dr. Evelyn Reed, MD',
    indication: 'Blood pressure maintenance',
    provenance: {
      sourceName: 'Patient Intake Form & Prescription Record',
      sourceType: 'patient_intake',
      provenance: 'Patient Provided',
      confidence: 100,
      snippet: 'Current medications: Lisinopril 10 mg once daily',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'med-2',
    patientId: DEMO_PATIENT.id,
    name: 'Vitamin D3 Ergocalciferol',
    dose: '2,000 IU',
    frequency: 'Once daily with meal',
    route: 'Oral',
    startDate: '2026-08-15',
    prescribedBy: 'Over-the-counter dietary supplement',
    indication: 'Vitamin D supplementation',
    provenance: {
      sourceName: 'Patient Intake Form',
      sourceType: 'patient_intake',
      provenance: 'Patient Provided',
      confidence: 95,
      snippet: 'Supplements: Vitamin D3 2000 IU daily',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'med-3',
    patientId: DEMO_PATIENT.id,
    name: 'Amoxicillin-Clavulanate',
    dose: '875 mg / 125 mg',
    frequency: 'Twice daily with meals',
    route: 'Oral',
    startDate: '2026-09-01',
    prescribedBy: 'Urgent Care Clinic Discharge Summary',
    indication: 'Acute bacterial sinus episode',
    provenance: {
      sourceName: 'Urgent_Care_Discharge_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 92,
      snippet: 'Rx: Amoxicillin-Clavulanate 875/125 mg PO BID #14 for acute sinusitis',
    },
    verificationStatus: 'needs_review', // FLAG: Potential allergy conflict with Penicillin!
  },
  {
    id: 'med-4',
    patientId: DEMO_PATIENT.id,
    name: 'Omega-3 Fish Oil',
    dose: 'Not specified in source',
    frequency: 'Not specified in source',
    route: 'Oral',
    provenance: {
      sourceName: 'Clinical Consultation Notes',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 84,
      snippet: 'Patient also consumes over the counter omega-3 fish oil capsules occasionally',
    },
    verificationStatus: 'unverified',
  }
];

export const DEMO_CONDITIONS: Condition[] = [
  {
    id: 'cond-1',
    patientId: DEMO_PATIENT.id,
    name: 'Essential Hypertension',
    diagnosedDate: '2024-03-12',
    status: 'Active',
    notes: 'Well controlled with Lisinopril 10 mg',
    provenance: {
      sourceName: 'Patient Intake & Primary Care Records',
      sourceType: 'patient_intake',
      provenance: 'Patient Provided',
      confidence: 98,
    },
    verificationStatus: 'verified',
  },
  {
    id: 'cond-2',
    patientId: DEMO_PATIENT.id,
    name: 'Impaired Fasting Glucose (Pre-diabetic Range)',
    diagnosedDate: '2026-08-10',
    status: 'Active',
    notes: 'Documented across consecutive blood tests (124 mg/dL and 118 mg/dL)',
    provenance: {
      sourceName: 'Metabolic Panel Evaluations',
      sourceType: 'ai_inference',
      provenance: 'AI Inferred',
      confidence: 88,
    },
    verificationStatus: 'needs_review',
  }
];

export const DEMO_ALLERGIES: Allergy[] = [
  {
    id: 'allergy-1',
    patientId: DEMO_PATIENT.id,
    allergen: 'Penicillin & Beta-Lactams',
    reaction: 'Cutaneous hives, facial flushing, and mild wheezing',
    severity: 'Severe',
    identifiedDate: '2019-06-15',
    provenance: {
      sourceName: 'Patient Intake Questionnaire',
      sourceType: 'patient_intake',
      provenance: 'Patient Provided',
      confidence: 100,
      snippet: 'Allergies: Penicillin (severe hives & wheezing experienced in 2019)',
    },
    verificationStatus: 'verified',
  }
];

export const DEMO_SYMPTOMS: Symptom[] = [
  {
    id: 'symp-1',
    patientId: DEMO_PATIENT.id,
    symptom: 'Intermittent afternoon fatigue',
    duration: '3 weeks',
    severity: 'Mild',
    notes: 'Usually peaks between 2 PM and 4 PM; coincides with documented low ferritin and low vitamin D',
    provenance: {
      sourceName: 'Patient Intake Form',
      sourceType: 'patient_intake',
      provenance: 'Patient Provided',
      confidence: 100,
    },
    verificationStatus: 'verified',
  },
  {
    id: 'symp-2',
    patientId: DEMO_PATIENT.id,
    symptom: 'Occasional lightheadedness upon standing quickly',
    duration: '2 months (intermittent)',
    severity: 'Mild',
    notes: 'Worth monitoring with resting blood pressure',
    provenance: {
      sourceName: 'Clinical Consultation Summary',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 90,
    },
    verificationStatus: 'needs_review',
  }
];

export const DEMO_OBSERVATIONS: MedicalObservation[] = [
  {
    id: 'obs-1',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cbc-2026',
    title: 'Mild Microcytic Trend on Peripheral Smear',
    description: 'RBC indices reflect a mild microcytic tendency (MCV 83 fL) coupled with sub-target serum ferritin (14 ng/mL). Source report recommends correlation with iron studies.',
    date: '2026-09-04',
    category: 'Laboratory',
    provenance: {
      sourceName: 'CBC_Report_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 96,
      snippet: 'Mild microcytic trend noted. Recommend correlation with iron studies.',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'obs-2',
    patientId: DEMO_PATIENT.id,
    reportId: 'rep-cmp-2026',
    title: 'Stable Renal & Electrolyte Function',
    description: 'Creatinine (0.95 mg/dL), estimated GFR (98 mL/min), Sodium (140 mEq/L), and Potassium (4.2 mEq/L) all remain squarely within source laboratory thresholds.',
    date: '2026-09-04',
    category: 'Clinical',
    provenance: {
      sourceName: 'CMP_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 98,
      snippet: 'Creatinine 0.95 mg/dL (0.70-1.30), eGFR 98 mL/min (>60), K 4.2 mEq/L (3.5-5.1)',
    },
    verificationStatus: 'verified',
  },
  {
    id: 'obs-3',
    patientId: DEMO_PATIENT.id,
    title: 'Elevated Atherogenic Lipoprotein Markers',
    description: 'Calculated LDL Cholesterol (142 mg/dL) and Total Cholesterol (210 mg/dL) exceed the source report cut-offs of < 100 mg/dL and < 200 mg/dL respectively.',
    date: '2026-09-04',
    category: 'Laboratory',
    provenance: {
      sourceName: 'Lipid_Panel_Sep2026.pdf',
      sourceType: 'report',
      provenance: 'Extracted from Report',
      confidence: 94,
    },
    verificationStatus: 'verified',
  }
];

export const DEMO_TIMELINE: TimelineEvent[] = [
  {
    id: 'time-1',
    patientId: DEMO_PATIENT.id,
    date: '04 Sep 2026',
    title: 'Comprehensive Lab Panels Processed',
    description: 'Complete Blood Count, Comprehensive Metabolic Panel, and Lipid Panel reports extracted and structured.',
    category: 'report',
    sourceName: 'Metropolitan Clinical Laboratories',
    provenance: 'Extracted from Report',
    relatedEntityId: 'rep-cbc-2026',
  },
  {
    id: 'time-2',
    patientId: DEMO_PATIENT.id,
    date: '03 Sep 2026',
    title: 'Discharge Record Uploaded',
    description: 'Urgent care record uploaded containing Amoxicillin-Clavulanate prescription.',
    category: 'medication',
    sourceName: 'Urgent_Care_Discharge_Sep2026.pdf',
    provenance: 'Extracted from Report',
    relatedEntityId: 'med-3',
  },
  {
    id: 'time-3',
    patientId: DEMO_PATIENT.id,
    date: '25 Aug 2026',
    title: 'Patient Intake Information Added',
    description: 'Demographics, medical history, reported penicillin allergy, and Lisinopril medication recorded.',
    category: 'intake',
    sourceName: 'Patient Intake Form',
    provenance: 'Patient Provided',
    relatedEntityId: DEMO_PATIENT.id,
  },
  {
    id: 'time-4',
    patientId: DEMO_PATIENT.id,
    date: '10 Aug 2026',
    title: 'Previous General Health Panel Uploaded',
    description: 'Baseline report from Valley Health Primary Care entered for longitudinal comparison.',
    category: 'report',
    sourceName: 'General_Health_Aug2026.pdf',
    provenance: 'Extracted from Report',
    relatedEntityId: 'rep-prev-aug2026',
  }
];

export const DEMO_CONFLICTS: DataConflict[] = [
  {
    id: 'conflict-1',
    patientId: DEMO_PATIENT.id,
    title: 'Potential Medication & Allergy Conflict',
    description: 'Patient-provided allergy information lists Penicillin & Beta-Lactams (severe reaction), while an uploaded urgent care discharge summary contains Amoxicillin-Clavulanate (a penicillin-class beta-lactam antibiotic).',
    severity: 'Important',
    itemA: {
      label: 'Stated Allergy: Penicillin & Beta-Lactams',
      value: 'Severe reaction (hives, wheezing)',
      source: 'Patient Intake Form',
      provenance: 'Patient Provided',
    },
    itemB: {
      label: 'Extracted Medication: Amoxicillin-Clavulanate',
      value: '875 mg / 125 mg PO BID',
      source: 'Urgent_Care_Discharge_Sep2026.pdf',
      provenance: 'Extracted from Report',
    },
    recommendation: 'Human verification strongly advised: confirm with patient and prescriber whether Amoxicillin was actually dispensed or if an alternative non-beta-lactam agent was substituted.',
    resolved: false,
  },
  {
    id: 'conflict-2',
    patientId: DEMO_PATIENT.id,
    title: 'Demographic Date of Birth Discrepancy',
    description: 'Patient intake form records date of birth as 14-May-1992, whereas an older archived document listed 18-May-1992.',
    severity: 'Needs Review',
    itemA: {
      label: 'Intake DOB',
      value: '14-May-1992',
      source: 'Patient Intake Form',
      provenance: 'Patient Provided',
    },
    itemB: {
      label: 'Archived Record DOB',
      value: '18-May-1992',
      source: 'Historical_Registration_2024.pdf',
      provenance: 'Extracted from Report',
    },
    recommendation: 'Verify official government identification or clinic registration card to ensure record unity.',
    resolved: false,
  }
];

export const DEMO_AI_INSIGHTS: AIInsightSummary = {
  patientFriendlySummary: 
    "Your structured clinical summary brings together your reported health history and four laboratory reports collected between August and September 2026. The records show stable kidney and electrolyte functions, with your red and white blood cell counts staying within normal ranges. Two areas note values outside the reference ranges provided by your laboratory: your fasting glucose and LDL cholesterol are elevated above the source thresholds, while your vitamin D and ferritin (stored iron) levels are lower than source reference limits. Importantly, an allergy to penicillin is noted in your records alongside a recent urgent care antibiotic record for amoxicillin; this should be promptly reviewed with your doctor.",
  keyObservations: [
    "Stable kidney filtration (eGFR 98 mL/min) and electrolyte balance (Sodium 140 mEq/L, Potassium 4.2 mEq/L) within source ranges.",
    "Hemoglobin improved from 12.8 g/dL to 13.2 g/dL between August and September 2026.",
    "Serum ferritin (14 ng/mL) is below the laboratory's lower cut-off (20 ng/mL), accompanied by mild fatigue reported on intake.",
    "Calculated LDL cholesterol (142 mg/dL) exceeds the source target threshold (< 100 mg/dL).",
    "Fasting glucose (118 mg/dL) remains above the source reference limit (70�99 mg/dL), though slightly lower than 124 mg/dL recorded in August."
  ],
  abnormalValues: [
    {
      testName: 'Fasting Glucose',
      value: '118 mg/dL',
      referenceRange: '70 - 99 mg/dL',
      status: 'HIGH',
      source: 'CMP_Panel_Sep2026.pdf',
      note: 'Value is above source report upper limit (99 mg/dL). Previous baseline was 124 mg/dL.'
    },
    {
      testName: 'LDL Cholesterol',
      value: '142 mg/dL',
      referenceRange: '< 100 mg/dL',
      status: 'HIGH',
      source: 'Lipid_Panel_Sep2026.pdf',
      note: 'Value exceeds source report target cut-off of < 100 mg/dL.'
    },
    {
      testName: 'Total Cholesterol',
      value: '210 mg/dL',
      referenceRange: '< 200 mg/dL',
      status: 'HIGH',
      source: 'Lipid_Panel_Sep2026.pdf',
      note: 'Value exceeds source report target cut-off of < 200 mg/dL.'
    },
    {
      testName: 'Vitamin D (25-OH)',
      value: '18 ng/mL',
      referenceRange: '30 - 100 ng/mL',
      status: 'LOW',
      source: 'Lipid_Panel_Sep2026.pdf',
      note: 'Value is below source report lower limit (30 ng/mL).'
    },
    {
      testName: 'Ferritin',
      value: '14 ng/mL',
      referenceRange: '20 - 250 ng/mL',
      status: 'LOW',
      source: 'CBC_Report_Sep2026.pdf',
      note: 'Value is below source report lower limit (20 ng/mL).'
    }
  ],
  missingInformation: [
    "Reference range for C-Reactive Protein was not provided in the source report (reported qualitatively as 'Negative').",
    "Dosage and daily frequency were not specified for Omega-3 Fish Oil in consultation notes.",
    "Follow-up HbA1c (glycated hemoglobin) report is not present in uploaded documents to complement fasting glucose trends.",
    "Resolution date or discharge confirmation for the acute sinus episode."
  ],
  questionsForReview: [
    "Could you verify whether Amoxicillin-Clavulanate was ever taken or if your pharmacy substituted an alternative due to your penicillin allergy?",
    "Would it be helpful to discuss your low ferritin (14 ng/mL) and vitamin D (18 ng/mL) with your primary physician in relation to your daytime fatigue?",
    "Do you have a recent HbA1c lab report that can be uploaded to provide deeper context for your fasting blood glucose?",
    "What specific brand or dose of Omega-3 capsules are you currently taking?"
  ],
  aiModelUsed: 'Demo / Local Deterministic Engine',
  generatedAt: '2026-09-04T10:20:00Z'
};

export const DEMO_COMPARISON: ComparisonRow[] = [
  {
    testName: 'Hemoglobin',
    unit: 'g/dL',
    previousValue: '12.8',
    previousDate: '10 Aug 2026',
    previousRange: '12.0 - 16.0',
    currentValue: '13.2',
    currentDate: '04 Sep 2026',
    currentRange: '12.0 - 16.0',
    currentStatus: 'NORMAL',
    changeDirection: 'Increased',
    source: 'CBC_Report_Sep2026.pdf vs General_Health_Aug2026.pdf'
  },
  {
    testName: 'Fasting Glucose',
    unit: 'mg/dL',
    previousValue: '124',
    previousDate: '10 Aug 2026',
    previousRange: '70 - 99',
    currentValue: '118',
    currentDate: '04 Sep 2026',
    currentRange: '70 - 99',
    currentStatus: 'HIGH',
    changeDirection: 'Decreased',
    source: 'CMP_Panel_Sep2026.pdf vs General_Health_Aug2026.pdf'
  },
  {
    testName: 'Total Cholesterol',
    unit: 'mg/dL',
    previousValue: '210',
    previousDate: '10 Aug 2026',
    previousRange: '< 200',
    currentValue: '210',
    currentDate: '04 Sep 2026',
    currentRange: '< 200',
    currentStatus: 'HIGH',
    changeDirection: 'Unchanged',
    source: 'Lipid_Panel_Sep2026.pdf vs General_Health_Aug2026.pdf'
  },
  {
    testName: 'Vitamin D (25-OH)',
    unit: 'ng/mL',
    previousValue: '15',
    previousDate: '10 Aug 2026',
    previousRange: '30 - 100',
    currentValue: '18',
    currentDate: '04 Sep 2026',
    currentRange: '30 - 100',
    currentStatus: 'LOW',
    changeDirection: 'Increased',
    source: 'Lipid_Panel_Sep2026.pdf vs General_Health_Aug2026.pdf'
  }
];

export const DEMO_CHART_DATA = [
  { date: '10 Aug 2026', Glucose: 124, Hemoglobin: 12.8, Cholesterol: 210, VitaminD: 15 },
  { date: '25 Aug 2026', Glucose: 121, Hemoglobin: 13.0, Cholesterol: 210, VitaminD: 16 },
  { date: '04 Sep 2026', Glucose: 118, Hemoglobin: 13.2, Cholesterol: 210, VitaminD: 18 },
];

export const DEMO_AUDIT_LOG = [
  {
    id: 'aud-demo-1',
    fieldId: 'lab-cbc-1',
    fieldName: 'Hemoglobin',
    originalValue: '13.2 g/dL',
    updatedValue: '13.2 g/dL',
    timestamp: '04 Sep 2026 14:15',
    reviewerName: 'Dr. Evelyn Reed, MD',
    action: 'verify' as const,
    verificationStatus: 'verified' as const
  },
  {
    id: 'aud-demo-2',
    fieldId: 'lab-cmp-1',
    fieldName: 'Fasting Glucose',
    originalValue: '118 mg/dL',
    updatedValue: '118 mg/dL',
    timestamp: '04 Sep 2026 14:18',
    reviewerName: 'Dr. Evelyn Reed, MD',
    action: 'verify' as const,
    verificationStatus: 'verified' as const
  },
  {
    id: 'aud-demo-3',
    fieldId: 'lab-cbc-7',
    fieldName: 'Ferritin',
    originalValue: '14 ng/mL',
    updatedValue: '14 ng/mL',
    timestamp: '04 Sep 2026 14:20',
    reviewerName: 'Dr. Evelyn Reed, MD',
    action: 'verify' as const,
    verificationStatus: 'verified' as const
  }
];

