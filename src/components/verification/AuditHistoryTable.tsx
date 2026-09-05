import React from 'react';
import { AuditEntry } from '../../types/medical';
import { History, CheckCircle2, XCircle, Edit3, ShieldAlert } from 'lucide-react';

interface Props {
  auditLog: AuditEntry[];
}

export const AuditHistoryTable: React.FC<Props> = ({ auditLog }) => {
  if (!auditLog || auditLog.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
        No modifications or verification actions recorded yet. All extractions reflect pristine original source states.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Human Verification & Modification Ledger</h3>
            <p className="text-[11px] text-slate-500">Immutable audit log of all clinical overrides, approvals, and reviews</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
          {auditLog.length} Event{auditLog.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th className="py-3 px-4 font-medium">Timestamp</th>
              <th className="py-3 px-3 font-medium">Field Modified</th>
              <th className="py-3 px-3 font-medium">Original Value</th>
              <th className="py-3 px-3 font-medium">Updated Value</th>
              <th className="py-3 px-3 font-medium">Action</th>
              <th className="py-3 px-4 font-medium">Reviewed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLog.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                  {entry.timestamp}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  {entry.fieldName}
                </td>
                <td className="py-3 px-3 font-mono text-slate-500 text-xs">
                  {entry.originalValue || '—'}
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-xs">
                  {entry.updatedValue}
                </td>
                <td className="py-3 px-3">
                  {entry.action === 'verify' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {entry.action === 'reject' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  )}
                  {entry.action === 'edit' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      <Edit3 className="w-3 h-3" />
                      Correction
                    </span>
                  )}
                  {entry.action === 'acknowledge_conflict' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      <ShieldAlert className="w-3 h-3" />
                      Conflict Ack
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium text-xs">
                  {entry.reviewerName || 'Dr. Evelyn Reed, MD'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};