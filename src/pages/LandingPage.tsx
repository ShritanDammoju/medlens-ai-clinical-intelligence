import React from 'react';
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
  Users
} from 'lucide-react';

interface Props {
  onEnterApp: () => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterApp, onLaunchDemo }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Med<span className="text-sky-400">Lens</span></span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI-Powered Clinical Information Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchDemo}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              View Demo Patient
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Try MedLens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Next-Generation Clinical Traceability</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            From scattered reports to a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-blue-400">clearer health story.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Transform fragmented medical information into a structured, understandable, and reviewable patient record with strict reference-range awareness and complete data lineage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Try MedLens</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-700 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Interactive Demo</span>
            </button>
          </div>

          {/* Interactive Flow Indicator */}
          <div className="pt-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { step: '1', title: 'Collect', desc: 'Intake & Reports' },
                { step: '2', title: 'Understand', desc: 'OCR & Ranges' },
                { step: '3', title: 'Organize', desc: 'Structured Record' },
                { step: '4', title: 'Empower', desc: 'Clinical Clarity' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider block">Stage {item.step}</span>
                  <span className="font-bold text-white text-sm block mt-0.5">{item.title}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Philosophy: Supporting Message */}
      <section className="py-12 border-y border-slate-800 bg-slate-950/40 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs uppercase font-bold tracking-widest text-sky-400 mb-2">MedLens Principle</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Better Data. Informed Conversations. Clearer Clinical Context.
          </h2>
        </div>
      </section>

      {/* Why MedLens Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">The Problem</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Why MedLens?</h2>
          <p className="text-slate-400 text-sm mt-2">
            Medical information today is trapped across siloed PDFs, legacy paper charts, and disparate portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Fragmented Records',
              desc: 'Lab values, medications, and clinical notes are scattered across different diagnostic facilities with no unified view.',
              icon: Database
            },
            {
              title: 'Difficult Manual Review',
              desc: 'Clinicians and patients spend hours squinting at dense multi-page lab tables, risking overlooked abnormal values.',
              icon: Search
            },
            {
              title: 'Hidden Longitudinal Trends',
              desc: 'Subtle shifts in biomarkers across sequential visits are masked by differing report formats and layouts.',
              icon: GitCompare
            },
            {
              title: 'Missing Context & Gaps',
              desc: 'Unrecorded allergies or missing source reference limits lead to unsafe assumptions or diagnostic confusion.',
              icon: ShieldCheck
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-slate-800/60 border border-slate-800 hover:border-sky-500/40 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Step-by-Step Workflow</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How MedLens Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Add Patient Information', desc: 'Record symptoms, existing conditions, known allergies, and current therapies with Patient-Provided origin tags.' },
              { num: '02', title: 'Upload Medical Reports', desc: 'Drop PDFs or clinical images into our client-side extraction engine with real-time multi-stage progress.' },
              { num: '03', title: 'Extract Medical Information', desc: 'Identify tests, results, units, dates, observations, and explicit reference ranges with high confidence.' },
              { num: '04', title: 'Human Verification Center', desc: 'Review, edit, or reject AI-assisted extractions. Human verification ensures clinical precision.' },
              { num: '05', title: 'Patient-Friendly AI Synthesis', desc: 'Receive understandable explanations bounded strictly by source ranges�with zero hallucinated diagnoses.' },
              { num: '06', title: 'Timeline & Longitudinal Comparison', desc: 'Inspect chronological patient milestones and compare sequential panels to track trajectories over time.' },
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-mono font-bold text-sky-400">{step.num}</span>
                <h3 className="font-bold text-white text-base mt-2 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible AI & Safety Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-sky-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Responsible AI & Clinical Integrity</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            MedLens strictly adheres to healthcare safety guardrails: it NEVER diagnoses a condition, NEVER prescribes therapies, and NEVER invents reference ranges when missing.
          </p>
          <div className="pt-4">
            <button
              onClick={onLaunchDemo}
              className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Explore Live Demo with Fictional Patient
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>MedLens � AI-Powered Clinical Information Intelligence � Free-Tier Hackathon Architecture</p>
        <p className="mt-1 text-slate-600">All demo data is strictly fictional and intended for educational demonstration purposes.</p>
      </footer>
    </div>
  );
};
