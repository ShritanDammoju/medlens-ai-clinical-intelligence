import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { DEMO_COMPARISON } from '../../data/demoData';
import { 
  GitCompare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Info, 
  FileText, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ReportComparison: React.FC = () => {
  const { currentPatient, state } = usePatient();
  const reports = state.reports.filter(r => r.patientId === currentPatient?.id);

  const [currentReportId, setCurrentReportId] = useState<string>(reports[0]?.id || 'rep-cbc-2026');
  const [previousReportId, setPreviousReportId] = useState<string>(reports[3]?.id || 'rep-prev-aug2026');

  const currentReport = reports.find(r => r.id === currentReportId) || reports[0];
  const previousReport = reports.find(r => r.id === previousReportId) || reports[reports.length - 1];

  const getTrendBadge = (direction: 'Increased' | 'Decreased' | 'Unchanged') => {
    switch (direction) {
      case 'Increased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Increased
          </span>
        );
      case 'Decreased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Decreased
          </span>
        );
      case 'Unchanged':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Minus className="w-3.5 h-3.5" />
            Unchanged
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Longitudinal Report Comparison</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Compare sequential laboratory reports side-by-side to track biomarker trajectories across time.
              </p>
            </div>
          </div>
        </div>

        {/* Report Selector Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Previous Report Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Baseline / Previous Report
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={previousReportId}
                onChange={(e) => setPreviousReportId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.reportDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Report Selector */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wider block mb-1.5">
              Current / Follow-up Report
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <select
                value={currentReportId}
                onChange={(e) => setCurrentReportId(e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.reportDate})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Comparative Biomarker Trajectory</h2>
            <p className="text-xs text-slate-500">
              Changes reflect mathematical delta. MedLens does not classify changes as good or bad without clinician oversight.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {DEMO_COMPARISON.length} Overlapping Tests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4 font-medium">Test Name</th>
                <th className="py-3.5 px-3 font-medium">Previous Result</th>
                <th className="py-3.5 px-3 font-medium">Current Result</th>
                <th className="py-3.5 px-3 font-medium">Mathematical Trend</th>
                <th className="py-3.5 px-3 font-medium text-center">Current Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Source Lineage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_COMPARISON.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {row.testName}
                  </td>

                  <td className="py-4 px-3 font-mono">
                    <span className="font-bold text-slate-700">{row.previousValue}</span>{' '}
                    <span className="text-slate-400 text-xs">{row.unit}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">({row.previousDate})</span>
                  </td>

                  <td className="py-4 px-3 font-mono">
                    <span className="font-bold text-sky-700 text-base">{row.currentValue}</span>{' '}
                    <span className="text-slate-400 text-xs">{row.unit}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">({row.currentDate})</span>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      {getTrendBadge(row.changeDirection)}
                      <span className="text-xs font-mono text-slate-500">
                        {row.previousValue} ? {row.currentValue}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-center">
                    <StatusBadge status={row.currentStatus} />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {row.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Diagnostic Safety Footnote */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p>
          <strong>Clinical Trajectory Notice:</strong> Fluctuations between test dates are influenced by lab timing, hydration, fasting status, and biological variation. Consult your doctor to interpret longitudinal significance.
        </p>
      </div>
    </div>
  );
};
