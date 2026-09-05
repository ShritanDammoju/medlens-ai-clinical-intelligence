import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { FileText, ArrowRight, Upload, Calendar, Building2, CheckCircle2 } from 'lucide-react';

interface Props {
  onUploadClick: () => void;
  onViewAll?: () => void;
  onSelectReport?: (reportId: string) => void;
}

export const RecentReportsCard: React.FC<Props> = ({
  onUploadClick,
  onViewAll,
  onSelectReport
}) => {
  const { state, currentPatient } = usePatient();
  const reports = state.reports.filter(r => r.patientId === currentPatient?.id);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Medical Reports</h3>
            <p className="text-xs text-slate-500">Processed clinical documents with verifiable lineage</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
        {reports.slice(0, 3).map((rep) => (
          <div
            key={rep.id}
            onClick={() => onSelectReport && onSelectReport(rep.id)}
            className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {rep.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {rep.reportDate}
                  </span>
                  <span>�</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {rep.facility || 'Clinical Lab'}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                {rep.fileSize}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">
                {rep.extractedItemsCount} items extracted
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Lineage Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
