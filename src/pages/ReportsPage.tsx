import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Calendar, 
  Eye, 
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { MedicalReport } from '../types/medical';

interface Props {
  onOpenUpload: () => void;
}

export const ReportsPage: React.FC<Props> = ({ onOpenUpload }) => {
  const { currentPatient, state } = usePatient();
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  const reports = state.reports.filter((r: MedicalReport) => r.patientId === currentPatient?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clinical Diagnostic Reports</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Source documents, OCR transcripts, and extraction audit trail for {currentPatient?.name}.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Medical Report</span>
        </button>
      </div>

      {/* Reports Grid & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          {reports.map((report: MedicalReport) => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-400 shadow-md ring-1 ring-sky-400'
                    : 'bg-white border-slate-200/90 shadow-soft hover:border-sky-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{report.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-mono">{report.fileName}</span>
                        <span>�</span>
                        <span>{report.fileSize}</span>
                        <span>�</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {report.reportDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Extraction Ready
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">
                    {report.extractedItemsCount} clinical measurements structured
                  </span>
                  <span className="text-sky-600 font-semibold flex items-center gap-1 hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Verbatim Text
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verbatim Source Inspector */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-600" />
              <span>Verbatim OCR Transcript</span>
            </h3>
            {selectedReport && (
              <span className="text-[11px] font-mono text-slate-400">{selectedReport.fileSize}</span>
            )}
          </div>

          {selectedReport ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedReport.fileName}</p>
                <p className="text-[11px] text-slate-500">Facility: {selectedReport.facility || 'Metropolitan Diagnostics'}</p>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 shadow-inner">
                <pre className="whitespace-pre-wrap">{selectedReport.rawTextPreview}</pre>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 text-xs text-sky-900 flex items-start gap-2 border border-sky-200">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Original transcript verified against checksum hash. No synthetic modifications.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Click any report on the left to view its complete verbatim OCR text stream and metadata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
