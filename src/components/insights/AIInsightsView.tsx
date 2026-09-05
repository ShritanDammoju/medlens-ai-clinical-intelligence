import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { 
  Sparkles, 
  AlertTriangle, 
  FileWarning, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquareQuote, 
  ShieldCheck, 
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const AIInsightsView: React.FC = () => {
  const { currentPatient, state, refreshAIInsights, isAnalyzingAI, aiMode, resolveConflict, openSourceInspector } = usePatient();
  const insights = currentPatient ? state.aiInsights[currentPatient.id] : null;
  const conflicts = state.conflicts.filter(c => c.patientId === currentPatient?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white">AI Clinical Information Intelligence</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {aiMode === 'Gemini' ? 'Online Gemini 3.8 Flash Engine' : 'Deterministic Local AI Engine'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Clear, patient-friendly synthesis of verified source data. Designed to prepare you for informed conversations with your physician without asserting diagnoses or prescriptions.
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshAIInsights()}
            disabled={isAnalyzingAI}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAI ? 'Synthesizing...' : 'Regenerate Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Cross-Document Conflict Detection Section (Prompt Section 15) */}
      {conflicts.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Potential Cross-Record Conflicts Detected</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {conflicts.filter(c => !c.resolved).length} Unresolved
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  MedLens identifies conflicting information across multiple uploaded reports and patient intakes without guessing truth.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-5 rounded-2xl border transition-all ${
                  conflict.resolved
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : conflict.severity === 'Important'
                    ? 'bg-rose-50/40 border-rose-300'
                    : 'bg-amber-50/40 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      conflict.severity === 'Important' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      Severity: {conflict.severity}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{conflict.title}</h3>
                  </div>

                  {conflict.resolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reconciled by Clinician
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSourceInspector({
                          sourceName: conflict.itemA.source,
                          sourceType: 'report',
                          provenance: 'Extracted from Report',
                          snippet: `${conflict.itemA.label}: ${conflict.itemA.value}`
                        })}
                        className="px-3 py-1 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => resolveConflict(conflict.id)}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {conflict.description}
                </p>

                {/* Non-deterministic conflict disclaimer */}
                <div className="mt-2.5 p-2 rounded-xl bg-amber-100/60 border border-amber-300/80 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span><strong>MedLens Decision Notice:</strong> MedLens does not determine which source is clinically correct. Please review both sources with your healthcare provider.</span>
                </div>

                {/* Comparison items A vs B */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">Source Record A:</span>
                    <span className="font-bold text-slate-900 block">{conflict.itemA.label}</span>
                    <span className="font-mono text-slate-600 block">{conflict.itemA.value}</span>
                    <span className="text-[11px] text-sky-600 block">From: {conflict.itemA.source}</span>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-200 pt-2 sm:pt-0">
                    <span className="text-slate-400 font-medium block">Source Record B:</span>
                    <span className="font-bold text-slate-900 block">{conflict.itemB.label}</span>
                    <span className="font-mono text-slate-600 block">{conflict.itemB.value}</span>
                    <span className="text-[11px] text-sky-600 block">From: {conflict.itemB.source}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Recommended Human Action:</strong> {conflict.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient-Friendly Summary (Prompt Section 14) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Patient-Friendly Health Story</h2>
            <p className="text-xs text-slate-500">Synthesized explanation of documented metrics</p>
          </div>
        </div>

        <div className="mt-6 p-6 rounded-2xl bg-sky-50/40 border border-sky-100 text-slate-800 leading-relaxed text-sm sm:text-base">
          {insights?.patientFriendlySummary}
        </div>
      </div>

      {/* Grid: Abnormal Values & Key Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abnormal Values (Strictly Source-Bounded) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Values Outside Source Ranges</h2>
              <p className="text-xs text-slate-500">Only flagged when explicitly exceeding source report boundaries</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {insights?.abnormalValues.map((ab, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{ab.testName}</h3>
                    <p className="font-mono text-slate-700 font-semibold mt-0.5">
                      Result: {ab.value} (Ref: {ab.referenceRange})
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    ab.status === 'LOW' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ab.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-600 leading-relaxed">{ab.note}</p>
                <p className="mt-1.5 text-[10px] text-slate-600">Source: {ab.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Observations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Key Source Observations</h2>
              <p className="text-xs text-slate-500">Clinically stable markers and documented trends</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {insights?.keyObservations.map((obs, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/30 border border-emerald-100 text-xs text-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{obs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Missing Information & Questions for Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Missing Information & Gaps</h2>
              <p className="text-xs text-slate-500">Unspecified parameters that require additional documentation</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {insights?.missingInformation.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for Review with Healthcare Professional */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Questions for Review</h2>
              <p className="text-xs text-slate-500">Thoughtful prompts to discuss at your next clinic visit</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {insights?.questionsForReview.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-200/70 text-indigo-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  Q
                </span>
                <p className="leading-relaxed font-medium">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 text-xs flex items-start gap-3 border border-slate-800">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Responsible Non-Diagnostic AI Guarantee</p>
          <p className="leading-relaxed text-slate-400">
            MedLens is an information organization and understanding tool. It does not provide medical diagnosis or treatment. All interpretations reflect reference intervals extracted verbatim from authorized laboratory reports. Always consult a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};
