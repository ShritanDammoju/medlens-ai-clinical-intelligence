import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { Sparkles, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onViewInsights?: () => void;
}

export const AISummaryCard: React.FC<Props> = ({ onViewInsights }) => {
  const { currentPatient, state, refreshAIInsights, isAnalyzingAI, aiMode } = usePatient();
  const insights = currentPatient ? state.aiInsights[currentPatient.id] : null;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 border border-sky-100 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">AI Clinical Information Summary</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                {aiMode === 'Gemini' ? 'Gemini 3.8 Flash' : 'Local Deterministic AI'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Non-diagnostic synthesis of uploaded records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAIInsights()}
            disabled={isAnalyzingAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAI ? 'Analyzing...' : 'Regenerate'}</span>
          </button>

          {onViewInsights && (
            <button
              onClick={onViewInsights}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Full Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-white/80 p-4 rounded-xl border border-sky-100/60 shadow-xs">
          {insights?.patientFriendlySummary || 'Analyzing available patient clinical records and laboratory metrics...'}
        </p>

        {/* Highlights row */}
        {insights?.abnormalValues && insights.abnormalValues.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Values Outside Source Reference Ranges ({insights.abnormalValues.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {insights.abnormalValues.map((ab, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    ab.status === 'LOW' 
                      ? 'bg-blue-50/80 text-blue-900 border-blue-200' 
                      : 'bg-rose-50/80 text-rose-900 border-rose-200'
                  }`}
                >
                  <span className="font-bold">{ab.testName}:</span>
                  <span className="font-mono">{ab.value}</span>
                  <span className="text-[10px] opacity-80">[{ab.status}]</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            Strictly bounded by source ranges. Never diagnoses diseases or prescribes therapies.
          </span>
          {insights?.generatedAt && (
            <span className="text-slate-400 font-mono">
              Updated: {new Date(insights.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
