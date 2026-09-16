import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Lock, 
  Brain, 
  CheckCircle2, 
  Users, 
  ChevronDown, 
  Stethoscope, 
  LineChart, 
  Clock, 
  Layers, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

interface Props {
  onEnterApp?: () => void;
  onLaunchDemo?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "What is MedLens and what problem does it solve?",
    answer: "MedLens is a clinical information intelligence platform that unifies scattered diagnostic reports, laboratory test records, and patient health histories into a single, structured, chronological timeline. It solves the challenge of fragmented records across different clinics, hospitals, and diagnostic labs."
  },
  {
    question: "How does MedLens handle laboratory reference ranges?",
    answer: "Unlike generic consumer chatbots that synthesize or hallucinate standard 'normal ranges', MedLens strictly evaluates biomarker values against the specific reference intervals printed on that individual laboratory report. Because different diagnostic instruments and reagents use distinct calibration standards, MedLens never invents reference ranges. If a laboratory report omits a reference interval, MedLens flags the biomarker status as 'Cannot determine'."
  },
  {
    question: "How does the patient–doctor connection work?",
    answer: "Every registered physician receives a unique clinician code (e.g. MED-XXXXXX). A patient can enter this code in their account to request a secure connection. Once the doctor approves the request, they can view the patient's longitudinal lab trajectories and health timeline with source-level provenance. Patients maintain full ownership and can revoke connection access at any time."
  },
  {
    question: "Does MedLens provide automated medical diagnoses or prescribe medications?",
    answer: "No. MedLens is an assistive clinical information platform, not a diagnostic medical device. It organizes, extracts, and summarizes medical documentation to assist clinical comprehension and doctor-patient consultations. All therapeutic decisions, diagnoses, and medical judgments remain strictly with licensed healthcare practitioners."
  },
  {
    question: "What is data provenance in MedLens?",
    answer: "Every clinical parameter extracted by MedLens—such as a lab measurement or medication entry—retains an explicit source lineage badge. You can trace any data point back to its originating document, page number, and original verbatim text snippet."
  },
  {
    question: "What file formats does MedLens support?",
    answer: "MedLens supports clinical PDF reports, scanned document images (PNG, JPG, WEBP), and direct clinical text pastes. Uploaded documents are parsed into standardized clinical records."
  },
  {
    question: "How is my medical data protected?",
    answer: "MedLens enforces authenticated access with role-based authorization and encrypted network transmission. Strict security rules ensure that patients only access their own medical documents, and doctors only access records for patients with an approved connection."
  },
  {
    question: "Can physicians verify and override extracted clinical values?",
    answer: "Yes. MedLens includes a dedicated Verification Center where authorized physicians review extracted data against the source document. Clinicians can adjust values, verify entries, reject discrepancies, and log timestamped modifications in a permanent audit log."
  }
];

export const LandingPage: React.FC<Props> = () => {
  const { openAuthModal } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Med<span className="text-sky-400">Lens</span></span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Clinical Information Intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('for-patients')} className="hover:text-white transition-colors cursor-pointer">
              For Patients
            </button>
            <button onClick={() => scrollToSection('for-doctors')} className="hover:text-white transition-colors cursor-pointer">
              For Doctors
            </button>
            <button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors cursor-pointer">
              Security & Privacy
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer">
              FAQ
            </button>
          </nav>

          {/* Account CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuthModal()}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('patient')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Clinical Information Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Understand your medical records with clinical clarity.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            MedLens unifies fragmented diagnostic reports, lab trends, and health timelines into a structured, clinician-verifiable medical record — powered by source-aware AI.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => openAuthModal('patient')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-slate-950" />
              <span>Get Started as Patient</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuthModal('doctor')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-extrabold text-sm sm:text-base border border-sky-500/30 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-5 h-5 text-sky-400" />
              <span>Doctor Portal</span>
            </button>
          </div>

          {/* Trust Value Points */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Structured clinical information</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Source-aware lab records</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Human-in-the-loop review</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Secure, authenticated access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Non-diagnostic AI assistance</span>
            </div>
          </div>
        </div>
      </section>

      {/* How MedLens Works (6-Stage Workflow) */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">System Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How MedLens Works
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              A 6-step clinical intelligence workflow turning fragmented medical documents into validated, actionable health records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Collect',
                subtitle: 'Multimodal Ingestion',
                desc: 'Upload laboratory reports, diagnostic summaries, imaging notes, and clinical documentation as PDF files, scan images, or text.',
                icon: Upload,
                color: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
              },
              {
                step: '02',
                title: 'Extract',
                subtitle: 'Clinical Extraction',
                desc: 'Intelligent multimodal parsing accurately extracts numerical biomarkers, active medications, diagnoses, and physician observations.',
                icon: FileText,
                color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
              },
              {
                step: '03',
                title: 'Validate',
                subtitle: 'Source-Bound Calibration',
                desc: 'Every biomarker is evaluated strictly against the reference intervals printed on that report. No synthesized or hallucinated ranges.',
                icon: ShieldCheck,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
              {
                step: '04',
                title: 'Organize',
                subtitle: 'Longitudinal Trajectory',
                desc: 'Synthesizes observations into a unified chronological health timeline with longitudinal trends and cross-report conflict detection.',
                icon: LineChart,
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              },
              {
                step: '05',
                title: 'Review',
                subtitle: 'Clinician Verification Center',
                desc: 'Patients explore clear summaries while connected physicians verify values, resolve therapeutic conflicts, and record immutable audit logs.',
                icon: Stethoscope,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              },
              {
                step: '06',
                title: 'Understand',
                subtitle: 'Grounded AI Assistant',
                desc: 'Interactive generative AI assistant answers patient and clinician questions, grounded strictly in the verified medical record.',
                icon: Brain,
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-slate-400">
                      STAGE {item.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs font-semibold text-sky-400">{item.subtitle}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Patients Section */}
      <section id="for-patients" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>For Patients</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A comprehensive, easy-to-understand view of your clinical health.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Never lose track of important blood tests, past prescriptions, or specialist notes. MedLens organizes your health documents into an intuitive record that helps you prepare for appointments and understand your body.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Clear Health History:</strong> Unified timeline of diagnostic results, prescriptions, and health events.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Lab Trends Over Time:</strong> Track biomarker trajectories with source-calibrated reference intervals.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>AI-Assisted Explanations:</strong> Plain-language breakdowns of complex medical terminology grounded in your reports.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Appointment Preparation:</strong> Formulate informed questions to discuss with your doctor.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Doctor Sharing:</strong> Easily connect with your healthcare provider using their secure clinician code.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openAuthModal('patient')}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Create Patient Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Patient Card Preview */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-sky-400">PATIENT HEALTH RECORD</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Fasting Blood Glucose</span>
                  <span className="font-mono text-emerald-400 font-bold">92 mg/dL</span>
                </div>
                <div className="text-[11px] text-slate-400">Reference: 70 - 99 mg/dL • Verified from Lab Report</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Total Cholesterol</span>
                  <span className="font-mono text-amber-400 font-bold">208 mg/dL</span>
                </div>
                <div className="text-[11px] text-slate-400">Reference: &lt; 200 mg/dL • High limit exceeded</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Thyroid Stimulating Hormone (TSH)</span>
                  <span className="font-mono text-emerald-400 font-bold">1.84 mIU/L</span>
                </div>
                <div className="text-[11px] text-slate-400">Reference: 0.40 - 4.50 mIU/L • Normal range</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 text-xs text-sky-300">
              💡 Grounded AI: "Your glucose and thyroid levels are within laboratory limits. Let's discuss your lipid profile questions."
            </div>
          </div>
        </div>
      </section>

      {/* For Doctors Section */}
      <section id="for-doctors" className="py-20 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Doctor Verification Preview */}
            <div className="order-2 lg:order-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-mono font-bold text-white">CLINICIAN VERIFICATION CENTER</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  DOCTOR AUDIT
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs items-center">
                    <span className="font-bold text-white">Biomarker Verification: Hemoglobin</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">VERIFIED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Source text: <span className="text-slate-300 italic">"Hemoglobin (HGB) ... 13.8 g/dL (Ref: 12.0 - 16.0)"</span>
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">Verified by Dr. Reviewer • Immutable log #aud-7819</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs items-center">
                    <span className="font-bold text-white">Cross-Record Reconciliation</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">RESOLVED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Duplicate therapy reconciled between outpatient consult and hospital discharge.
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">Reconciled • Dr. Reviewer</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                🔒 Every clinician action records a cryptographic audit entry with reviewer identification and timestamp.
              </div>
            </div>

            {/* Doctor Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>For Healthcare Providers</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Accelerate clinical intake with structured, source-verified records.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Reviewing stacks of disorganized paper lab results wastes valuable consultation time. MedLens structures incoming patient documentation, highlights discrepancies, and preserves source provenance for rapid clinical review.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Structured Clinical Timeline:</strong> Instant chronological view of previous diagnoses, lab trends, and medications.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Longitudinal Biomarker Review:</strong> Identify trajectory changes without manually sifting through PDFs.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Source-Level Provenance:</strong> Click any extracted measurement to view the exact report snippet and page number.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Verification & Overrides:</strong> Full clinician control to approve, calibrate, or reject automated extractions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Transparent Audit Trail:</strong> Timestamped records of all clinical evaluations and modifications.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openAuthModal('doctor')}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold text-sm border border-sky-500/30 shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Access Doctor Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & AI Safety Section */}
      <section id="security" className="py-20 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Trust & Governance</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Security, Privacy & AI Safety
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Engineered with transparent medical safety guardrails and honest privacy architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Non-Diagnostic AI Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                MedLens is designed to organize and clarify medical information. It does not provide definitive medical diagnoses, write prescriptions, or replace clinical judgment.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Source-Bound Interpretations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lab results are evaluated exclusively against the explicit reference intervals printed on that specific document. If omitted, MedLens transparently flags status as "Cannot determine".
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Complete Data Provenance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every extracted biomarker, observation, and note is permanently linked to its source document, page number, and original verbatim text for absolute traceability.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Authenticated Access Control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based authorization ensures patients only access their own records, and doctors can only access records for patients with an approved connection handshake.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All clinician reviews, value calibrations, and conflict reconciliations create timestamped audit entries recording the reviewer identity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center text-rose-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Encrypted Transmission</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authenticated access with role-based authorization and encrypted network transmission. Real clinical data is securely stored in Google Cloud Firestore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Clinical & Technical Answers
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to know about MedLens reference ranges, data lineage, and clinical verification.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Start using MedLens today.
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Bring clarity to your diagnostic history or streamline patient record review with verified, reference-range-aware intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openAuthModal('patient')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal('doctor')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all cursor-pointer"
            >
              Sign In as Clinician
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-300 text-sm">MedLens</span>
            </div>
            <p className="text-[11px] text-slate-400">Clinical Information Intelligence Platform. Source-explicit reference range safety.</p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <button onClick={() => openAuthModal('patient')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Patient Portal
            </button>
            <button onClick={() => openAuthModal('doctor')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Doctor Portal
            </button>
            <a 
              href="https://github.com/ShritanDammoju/medlens-ai-clinical-intelligence" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
