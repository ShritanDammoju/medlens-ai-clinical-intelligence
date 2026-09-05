import React from 'react';
import { MedicalReport, LabResult } from '../../types/medical';
import { FileCode, FileText, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';

interface Props {
  report: MedicalReport;
  extractedLabs: LabResult[];
  onClose?: () => void;
}

export const SideBySideSourceViewer: React.FC<Props> = ({ report, extractedLabs, onClose }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Side-by-Side Traceability Inspector</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">PROVENANCE LOCKED</span>
            </div>
            <p className="text-[11px] text-slate-400">Verbatim document transcript on left matched to structured output on right</p>
          </div>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left: Verbatim OCR Transcript */}
        <div className="p-5 bg-slate-950 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" />
              Source Document: {report.fileName}
            </span>
            <span className="font-mono text-slate-500 text-[11px]">{report.fileSize}</span>
          </div>

          <div className="mt-3 flex-1 font-mono text-xs text-emerald-400 bg-slate-900/90 p-4 rounded-2xl overflow-y-auto max-h-[420px] border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
            {report.rawTextPreview}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Verbatim extraction: no values altered or synthesized.</span>
          </div>
        </div>

        {/* Right: Structured Clinical Parameters */}
        <div className="p-5 bg-white flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Structured Fields ({extractedLabs.length})
            </span>
            <span className="text-slate-400 text-[11px]">{report.category}</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto max-h-[420px] space-y-2.5 pr-1">
            {extractedLabs.map((lab) => (
              <div key={lab.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs hover:bg-sky-50/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{lab.testName}</span>
                    {lab.originalTestName && (
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                        (source: {lab.originalTestName})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {lab.resultValue} <span className="font-sans font-normal text-slate-500 text-[11px]">{lab.unit}</span>
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500">
                    Ref: {lab.referenceRange ? `${lab.referenceRange} ${lab.unit}` : 'Not provided in source'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={lab.status} />
                    <VerificationBadge status={lab.verificationStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
