import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Sparkles, 
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsPage: React.FC = () => {
  const { aiMode, loadDemoPatient } = usePatient();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    loadDemoPatient();
    setResetSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings, Privacy & Clinical Guardrails</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configuration, local persistence governance, and responsible AI system architecture.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Browser-Side Privacy Architecture</h2>
            <p className="text-xs text-slate-500">100% Client-Side Local Storage for Demo Security</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p className="font-semibold text-slate-900">
            "For this demo, information is stored locally in the browser. Do not upload real patient information."
          </p>
          <p className="text-xs text-slate-500">
            Medical records, laboratory values, and patient demographics are stored strictly inside your web browser's HTML5 LocalStorage sandbox. No records are transmitted to third-party databases, cloud buckets, or external ad trackers.
          </p>
        </div>
      </div>

      {/* AI Mode & Model Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Active AI Intelligence Engine</h2>
            <p className="text-xs text-slate-500">Free-tier compatible dual-mode AI abstraction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border ${
            aiMode === 'Gemini' 
              ? 'bg-sky-50/60 border-sky-300 ring-2 ring-sky-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Gemini 3.8 Flash Generative AI</span>
              {aiMode === 'Gemini' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Powered securely server-side via <code className="text-sky-700 font-mono">GEMINI_API_KEY</code> in Vercel Project Settings (never exposed to browser clients).
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            aiMode === 'Demo' 
              ? 'bg-sky-50/60 border-sky-300 ring-2 ring-sky-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Local Deterministic Engine</span>
              {aiMode === 'Demo' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Active (Offline Safe)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero-cost deterministic analyzer producing structured observations strictly from source reference intervals.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Disclaimers */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Medical Disclaimers & Safety Mandate</h2>
            <p className="text-xs text-slate-500">Non-negotiable ethical clinical safety principles</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            "MedLens helps organize and explain medical information. It is not a medical diagnosis or treatment system. Information may be incomplete or inaccurate. Always verify important information with the original source and consult a qualified healthcare professional for medical decisions."
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500">
            <li>Never provides autonomous medical diagnoses (e.g. "You have diabetes").</li>
            <li>Never prescribes medications or alters recorded dosages.</li>
            <li>Never synthesizes missing reference ranges from external assumptions.</li>
            <li>Always exposes verbatim source provenance for human verification.</li>
          </ul>
        </div>
      </div>

      {/* Data Management & Demo Reset */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reset Demo State</h2>
            <p className="text-xs text-slate-500">Restore the initial fictional Alex Carter hackathon dataset (does not affect authenticated user accounts)</p>
          </div>

          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <FileCheck2 className="w-4 h-4" />
            <span>Successfully reloaded pristine fictional dataset!</span>
          </div>
        )}
      </div>
    </div>
  );
};
