import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  CheckCheck, 
  GitCompare, 
  FileText, 
  Lock, 
  Brain, 
  HeartHandshake,
  Database,
  Search,
  CheckCircle2,
  Users,
  ChevronDown,
  Stethoscope,
  BookOpen,
  Scale,
  FileCheck,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

interface Props {
  onEnterApp: () => void;
  onLaunchDemo: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "What is MedLens and what problem does it solve?",
    answer: "MedLens is an AI-powered clinical information intelligence platform that solves the widespread problem of medical information fragmentation. When patients visit different diagnostic laboratories and clinics, their test results, dosage histories, and physician observations end up scattered across paper reports, disparate patient portals, and unstandardized PDFs. MedLens brings these disconnected documents together into a unified, chronological, and reference-range-verified patient profile."
  },
  {
    question: "How does MedLens handle laboratory reference intervals?",
    answer: "Unlike generic consumer chatbots that guess or hallucinate standard 'normal ranges', MedLens strictly binds every biomarker evaluation to the explicit reference intervals printed on that specific laboratory report. Because different laboratories utilize varying analytical instruments, reagents, and demographic calibration curves, MedLens never synthesizes unverified reference ranges. If a laboratory omits a reference interval, MedLens transparently flags the biomarker status as 'Cannot determine'."
  },
  {
    question: "How does the patient-doctor connection system work?",
    answer: "Every registered clinician receives a unique, verified Doctor Code (e.g. MED-782194). Patients simply enter this code within their MedLens portal to dispatch a connection request. Once approved by the physician on their dedicated Doctor Dashboard, the clinician gains authorized access to inspect the patient's structured record, review lab trajectories, and perform clinical verification. Patients maintain full sovereign ownership and can revoke clinician access at any time with one click."
  },
  {
    question: "Does MedLens provide automated medical diagnoses?",
    answer: "No. MedLens is intentionally designed as an assistive, non-diagnostic clinical intelligence system. It synthesizes, organizes, extracts, and highlights observations to support clinical decision-making, but it never replaces the professional medical judgment of a licensed healthcare provider. All diagnostic evaluations and therapy plans require qualified clinician review."
  },
  {
    question: "How does data provenance work in MedLens?",
    answer: "Every single discrete clinical value in MedLens—whether a hemoglobin measurement, an active prescription, or an allergy—is stamped with an immutable data lineage badge: 'Patient Provided', 'Extracted from Report', 'AI Inferred', or 'Verified'. Users and clinicians can click on any parameter to view the original source document, page number, verbatim text snippet, and reviewer timestamp."
  },
  {
    question: "What file formats does MedLens support for report ingestion?",
    answer: "MedLens accepts diagnostic reports in PDF format, scanned lab result images (PNG, JPG, JPEG), and direct raw clinical text or electronic health record (EHR) text pastes. The multimodal ingestion engine tokenizes and parses both structured tabular outputs and unstructured clinical narratives."
  },
  {
    question: "How does MedLens ensure patient privacy and security?",
    answer: "MedLens is designed with privacy-by-default architecture aligned with the HIPAA Security and Privacy Rules (45 CFR Part 160 and Part 164). Data is protected by strict Cloud Firestore security rules, client-side session options, and granular role authorization ensuring that only the patient and explicitly authorized clinicians can access medical data."
  },
  {
    question: "Can clinicians review and override AI-extracted values?",
    answer: "Yes. MedLens incorporates a dedicated Verification Center where physicians can review extracted parameters side-by-side with original report text. Clinicians can adjust values, re-evaluate reference limits, approve or reject parameters, and resolve cross-record conflicts. Every modification creates a permanent audit log entry documenting the reviewer's identity and timestamp."
  }
];

export const LandingPage: React.FC<Props> = ({ onEnterApp, onLaunchDemo }) => {
  const { openAuthModal } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Med<span className="text-sky-400">Lens</span></span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Clinical Information Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onLaunchDemo}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Try Demo Mode
            </button>
            <button
              onClick={() => openAuthModal('doctor')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-sky-400 hover:bg-sky-950/50 border border-sky-800/60 transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </button>
            <button
              onClick={() => openAuthModal('patient')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Sign In / Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Single <h1> for AEO/SEO */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Reference-Range-Aware Healthcare Intelligence</span>
          </div>

          {/* Single Main H1 Tag */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            AI-Powered Clinical Information Intelligence
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Transform fragmented diagnostic reports, clinical summaries, and patient-reported symptoms into a structured, chronologically unified health profile with strict source-explicit reference range awareness and complete human-in-the-loop verification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started with MedLens</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-700 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Clinical Architecture Highlights */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">Non-Hallucinatory</span>
              <div className="text-sm font-bold text-white">Source-Bound Ranges</div>
              <p className="text-[11px] text-slate-400">Strictly bounds evaluations to the lab's printed limits.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">Full Lineage</span>
              <div className="text-sm font-bold text-white">Clinical Provenance</div>
              <p className="text-[11px] text-slate-400">Every biomarker links to original verbatim source text.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Physician Link</span>
              <div className="text-sm font-bold text-white">Doctor Code System</div>
              <p className="text-[11px] text-slate-400">Share MED-XXXXXX code for secure clinician review.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Audit Trail</span>
              <div className="text-sm font-bold text-white">Human Verification</div>
              <p className="text-[11px] text-slate-400">Clinician verification center with timestamped changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Medical Narrative Section (300+ words) */}
      <section className="py-16 border-y border-slate-800 bg-slate-950/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Clinical Problem & Innovation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Solving the Crisis of Fragmented Medical Information
          </h2>

          <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              In contemporary healthcare delivery, medical records are inherently decentralized. A single patient frequently undergoes routine blood work at an independent diagnostic laboratory, receives specialist consultations at an outpatient center, undergoes imaging at a regional hospital, and manages self-reported symptom journals at home. These vital health documents are stored in disconnected patient portals or delivered as static paper printouts. When patients consult with a new physician, crucial laboratory trajectories, prior adverse drug reactions, and historical baseline values are routinely inaccessible or lost.
            </p>
            <p>
              This information scatter introduces substantial diagnostic friction, leads to redundant laboratory testing, and exacerbates medication reconciliation errors. Furthermore, while consumer artificial intelligence tools attempt to summarize medical documents, generic large language models frequently hallucinate arbitrary 'normal ranges' that disregard critical demographic, reagent, and analytical instrument differences established by the originating testing laboratory.
            </p>
            <p>
              MedLens establishes an entirely new paradigm: <strong>reference-range-aware clinical information intelligence</strong>. By pairing a 10-stage deterministic parsing engine with human-in-the-loop clinician oversight, MedLens extracts numerical test results, normalizes diverse clinical nomenclatures, validates parameters strictly against the originating document's printed reference intervals, and establishes bidirectional access between patients and their physicians using sovereign Doctor Codes. Every extracted insight retains verbatim provenance back to the source file, empowering patients and doctors with verified transparency.
            </p>
          </div>
        </div>
      </section>

      {/* 6-Stage Clinical Processing Pipeline */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">System Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How MedLens Works: 6-Stage Clinical Intelligence Pipeline
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            From raw multimodal ingestion to human clinician verification, every step prioritizes patient safety and reference fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Multimodal Document Ingestion',
              desc: 'Accepts diverse medical inputs including clinical PDFs, laboratory scans (PNG, JPG), raw EHR text, and structured patient intake forms.',
              badge: 'Ingestion'
            },
            {
              step: '02',
              title: 'Terminology Normalization',
              desc: 'Standardizes disparate clinical aliases (e.g., Hb, HGB, Haemoglobin to Hemoglobin) while permanently recording the source verbatim token.',
              badge: 'Normalization'
            },
            {
              step: '03',
              title: 'Source-Bound Range Extraction',
              desc: 'Strictly bounds normal/abnormal evaluations to the reference interval printed on that specific laboratory report, eliminating AI range hallucinations.',
              badge: 'Safety Rule'
            },
            {
              step: '04',
              title: 'Cross-Record Conflict Scanning',
              desc: 'Scans medication therapies, allergies, and diagnostic timelines across historical reports to identify dosage discrepancies or contraindications.',
              badge: 'Reconciliation'
            },
            {
              step: '05',
              title: 'Context-Aware Clarification',
              desc: 'Synthesizes tailored clarification questions for the patient and doctor to discuss during consultations based on detected data gaps.',
              badge: 'Intelligence'
            },
            {
              step: '06',
              title: 'Human-in-the-Loop Clinician Review',
              desc: 'Provides a dedicated Verification Center where physicians review side-by-side evidence, override parameters, and log immutable audit entries.',
              badge: 'Verification'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 hover:border-sky-500/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-400/20">
                  STAGE {item.step}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Patient–Doctor Connection Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950/60 to-slate-900 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Bidirectional Access</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Seamless Patient–Clinician Connectivity
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              MedLens bridges the gap between patient home monitoring and physician consultation. Doctors generate a unique connection code (e.g. <span className="font-mono text-sky-400">MED-782194</span>) that patients submit in their portal. Once accepted, clinicians can review comprehensive laboratory trends, inspect conflicting therapies, and verify values.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Revocation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero-Leakage Privacy</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-800/70 p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4 max-w-md w-full">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm text-white">Doctor Code Connection</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Sample Doctor Code</span>
              <span className="font-mono text-2xl font-black text-sky-400 tracking-widest block">
                MED-784192
              </span>
              <span className="text-[10px] text-slate-400 block">Entered by patient to grant clinical oversight</span>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 text-xs text-sky-200">
              Patients retain sovereign control and can disconnect with one click at any time.
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section (8+ Questions matching JSON-LD schema) */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Clinical & Technical Questions Answered
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to know about MedLens reference ranges, data lineage, privacy, and clinical verification.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl bg-slate-800/50 border border-slate-700/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-700/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Regulatory Standards & Academic Benchmarks */}
      <section className="py-16 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">Clinical & Regulatory Framework</span>
            <h3 className="text-lg font-bold text-white">Adherence to Healthcare Standards & Benchmarks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white text-xs block">HIPAA Privacy & Security</span>
              <p className="text-[11px] text-slate-400">Aligned with 45 CFR Part 160 & Part 164 standards for zero-leakage protected health information management.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white text-xs block">HL7 FHIR Release 4</span>
              <p className="text-[11px] text-slate-400">Structured biomarker records and observation timelines model FHIR Observation and DiagnosticReport specifications.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white text-xs block">FDA AI/ML Action Plan</span>
              <p className="text-[11px] text-slate-400">Incorporates transparency, human-in-the-loop clinician oversight, and rigorous data provenance tracking.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white text-xs block">NIH Reference Standards</span>
              <p className="text-[11px] text-slate-400">Reflects NCBI laboratory reference interval methodologies recognizing instrument and demographic variability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">MedLens</span> — AI-Powered Clinical Information Intelligence.
            <p className="text-[11px] text-slate-400 mt-0.5">Built for healthcare hackathons. Designed for clinical integrity.</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={onLaunchDemo} className="hover:text-slate-300 transition-colors cursor-pointer">
              Demo Dataset
            </button>
            <button onClick={() => openAuthModal('doctor')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Doctor Access
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
