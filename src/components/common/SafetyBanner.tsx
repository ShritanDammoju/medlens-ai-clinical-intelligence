import React from 'react';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const SafetyBanner: React.FC = () => {
  const { currentPatient, aiMode } = usePatient();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs border-b border-blue-900/50 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          </span>
          <p className="text-slate-300 leading-tight">
            <strong className="text-white font-medium">Responsible Clinical AI:</strong> MedLens helps organize and explain medical information. It is not a medical diagnosis or treatment system. Always consult a qualified healthcare professional.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>AI Engine:</span>
            <span className="font-semibold text-emerald-400">
              {aiMode === 'Gemini' ? 'Gemini 3.8 Flash' : 'Clinical Intelligence Engine'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
