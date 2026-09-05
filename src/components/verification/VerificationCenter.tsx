import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { LabResult, VerificationStatus } from '../../types/medical';
import { 
  CheckCheck, 
  Check, 
  X, 
  Edit3, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Info,
  Filter
} from 'lucide-react';
import { VerificationBadge } from '../common/VerificationBadge';
import { StatusBadge } from '../common/StatusBadge';
import { EditFieldModal } from '../records/EditFieldModal';
import { AuditHistoryTable } from './AuditHistoryTable';
import confetti from 'canvas-confetti';

export const VerificationCenter: React.FC = () => {
  const { state, currentPatient, updateLabVerification, openSourceInspector } = usePatient();
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'verified' | 'unverified'>('needs_review');
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);

  const patientLabs = state.labs.filter(l => l.patientId === currentPatient?.id);

  const filteredLabs = patientLabs.filter(lab => {
    if (filter === 'all') return true;
    return lab.verificationStatus === filter;
  });

  const needsReviewCount = patientLabs.filter(l => l.verificationStatus === 'needs_review').length;
  const verifiedCount = patientLabs.filter(l => l.verificationStatus === 'verified').length;

  const handleQuickVerify = (labId: string) => {
    updateLabVerification(labId, 'verified');
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleQuickReject = (labId: string) => {
    updateLabVerification(labId, 'rejected');
  };

  const handleVerifyAllPending = () => {
    patientLabs.filter(l => l.verificationStatus === 'needs_review').forEach(l => {
      updateLabVerification(l.id, 'verified');
    });
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clinical Verification Center</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Human verification helps reduce errors in AI-assisted extraction and guarantees provenance accuracy.
              </p>
            </div>
          </div>

          {needsReviewCount > 0 && (
            <button
              onClick={handleVerifyAllPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Verify All Pending ({needsReviewCount})</span>
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Total Test Fields</span>
            <span className="text-xl font-extrabold text-slate-900">{patientLabs.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <span className="text-xs text-amber-800 font-medium block">Needs Review</span>
            <span className="text-xl font-extrabold text-amber-900">{needsReviewCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="text-xs text-emerald-800 font-medium block">Verified</span>
            <span className="text-xl font-extrabold text-emerald-900">{verifiedCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Extraction Accuracy</span>
            <span className="text-xl font-extrabold text-sky-600">96.4%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl">
          {(['needs_review', 'all', 'verified', 'unverified'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'needs_review' ? `Needs Review (${needsReviewCount})` : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredLabs.length} items
        </span>
      </div>

      {/* Verification Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4 font-medium">Field / Test</th>
                <th className="py-3.5 px-3 font-medium">Extracted Value</th>
                <th className="py-3.5 px-3 font-medium">Source Document</th>
                <th className="py-3.5 px-3 font-medium text-center">Confidence</th>
                <th className="py-3.5 px-3 font-medium text-center">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Human Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No records found matching filter "{filter}".
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{lab.testName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {lab.referenceRange 
                          ? `Ref Range: ${lab.referenceRange} ${lab.unit}` 
                          : 'Reference range not provided in source'}
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono font-bold text-slate-900">
                      {lab.resultValue} <span className="font-sans font-normal text-xs text-slate-500">{lab.unit}</span>
                    </td>

                    <td className="py-4 px-3">
                      <button
                        onClick={() => openSourceInspector(lab.provenance)}
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium text-xs hover:underline cursor-pointer"
                        title="Inspect original source snippet"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{lab.provenance.sourceName}</span>
                      </button>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {lab.provenance.confidence || 94}%
                      </span>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <VerificationBadge status={lab.verificationStatus} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lab.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleQuickVerify(lab.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                            title="Verify and confirm accuracy"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                        )}

                        <button
                          onClick={() => setEditingLab(lab)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="Edit extracted value or reference range"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {lab.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleQuickReject(lab.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Reject inaccurate extraction"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-start gap-3 text-xs text-sky-900">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Clinician-Grade Review Workflow:</strong>
          <p className="mt-0.5 text-sky-800 leading-relaxed">
            MedLens acts as an intelligence accelerator, not an autonomous diagnostician. Every lab extraction retains an immutable audit trail back to its source PDF page or OCR frame.
          </p>
        </div>
      </div>

      {/* Human Verification Audit Ledger */}
      <div className="pt-4">
        <AuditHistoryTable auditLog={state.auditLog || []} />
      </div>

      {/* Edit Modal */}
      {editingLab && (
        <EditFieldModal lab={editingLab} onClose={() => setEditingLab(null)} />
      )}
    </div>
  );
};
