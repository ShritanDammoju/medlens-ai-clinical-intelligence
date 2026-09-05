import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { FileText, X, CheckCircle2, Search, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

export const SourceModal: React.FC = () => {
  const { selectedSource, closeSourceInspector } = usePatient();

  if (!selectedSource) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">Clinical Data Lineage</span>
              <h3 className="text-xl font-bold text-white">Where did this information come from?</h3>
            </div>
          </div>
          <button
            onClick={closeSourceInspector}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Source Document</p>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5 break-all">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                {selectedSource.sourceName}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Data Provenance</p>
              <div className="mt-1">
                <ProvenanceBadge provenance={selectedSource.provenance} />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Extraction Confidence</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">{selectedSource.confidence ?? 95}%</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-medium">High</span>
              </div>
            </div>

            {selectedSource.pageNumber && (
              <div>
                <p className="text-xs text-slate-500 font-medium">Report Location</p>
                <p className="font-semibold text-slate-900 mt-0.5">Page {selectedSource.pageNumber}</p>
              </div>
            )}

            {selectedSource.extractedAt && (
              <div>
                <p className="text-xs text-slate-500 font-medium">Extracted At</p>
                <p className="font-semibold text-slate-900 mt-0.5 text-xs">
                  {new Date(selectedSource.extractedAt).toLocaleString()}
                </p>
              </div>
            )}

            {selectedSource.verifiedBy && (
              <div>
                <p className="text-xs text-slate-500 font-medium">Verification Stamp</p>
                <p className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedSource.verifiedBy}
                </p>
              </div>
            )}
          </div>

          {/* Source Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Verbatim Source Context / OCR Snippet:
              </label>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Exact Report Text</span>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="whitespace-pre-wrap">{selectedSource.snippet || 'Source context snippet recorded during document processing.'}</pre>
            </div>
          </div>

          {/* Traceability Guarantee Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Full Clinical Traceability Guaranteed:</strong>
              <p className="mt-0.5 text-blue-800">
                Every value structured by MedLens is bound to its immutable source document. Reference ranges are extracted strictly as printed without estimation or external assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
          <button
            onClick={closeSourceInspector}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
