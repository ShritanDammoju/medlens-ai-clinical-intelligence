import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  FlaskConical, 
  Search, 
  HelpCircle, 
  Edit3
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { EditFieldModal } from '../components/records/EditFieldModal';
import { LabResult, LabStatus } from '../types/medical';

export const LabResultsPage: React.FC = () => {
  const { currentPatient, state } = usePatient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | LabStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);

  const patientLabs = state.labs.filter((l: LabResult) => l.patientId === currentPatient?.id);

  const filteredLabs = patientLabs.filter((lab: LabResult) => {
    if (statusFilter !== 'ALL' && lab.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        lab.testName.toLowerCase().includes(q) ||
        (lab.category && lab.category.toLowerCase().includes(q)) ||
        lab.provenance.sourceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laboratory Biomarker Registry</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Evaluated against verbatim source reference ranges. Never estimated when ranges are absent.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            {patientLabs.length} Total Biomarkers
          </span>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['ALL', 'NORMAL', 'LOW', 'HIGH', 'Cannot determine'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All Results' : status === 'Cannot determine' ? 'No Range' : status}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search biomarker name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Lab Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4 font-medium">Test Name</th>
                <th className="py-3.5 px-3 font-medium">Result / Value</th>
                <th className="py-3.5 px-3 font-medium">Source Reference Range</th>
                <th className="py-3.5 px-3 font-medium text-center">Status</th>
                <th className="py-3.5 px-3 font-medium">Source Document</th>
                <th className="py-3.5 px-3 font-medium text-center">Verification</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No laboratory tests matched your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab: LabResult) => (
                  <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{lab.testName}</div>
                      {lab.category && (
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{lab.category}</span>
                      )}
                    </td>

                    <td className="py-4 px-3 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {lab.resultValue} <span className="font-sans font-normal text-xs text-slate-500">{lab.unit}</span>
                    </td>

                    <td className="py-4 px-3">
                      {lab.referenceRange ? (
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {lab.referenceRange} {lab.unit}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 italic text-slate-500 text-[11px] bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          Reference range not provided in source
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-center">
                      <StatusBadge status={lab.status} explanation={lab.statusExplanation} />
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <ProvenanceBadge 
                          provenance={lab.provenance.provenance} 
                          fullProvenance={lab.provenance} 
                        />
                        <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[150px]">
                          {lab.provenance.sourceName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <VerificationBadge status={lab.verificationStatus} verifiedBy={lab.provenance.verifiedBy} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setEditingLab(lab)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Edit extracted value or reference range"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLab && (
        <EditFieldModal lab={editingLab} onClose={() => setEditingLab(null)} />
      )}
    </div>
  );
};
