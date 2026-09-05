import React from 'react';
import { VerificationStatus } from '../../types/medical';
import { Check, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

interface Props {
  status: VerificationStatus;
  verifiedBy?: string;
  className?: string;
}

export const VerificationBadge: React.FC<Props> = ({ status, verifiedBy, className = '' }) => {
  switch (status) {
    case 'verified':
      return (
        <span
          title={verifiedBy ? `Verified by ${verifiedBy}` : 'Human Verified'}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300 ${className}`}
        >
          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
          Verified
        </span>
      );

    case 'needs_review':
      return (
        <span
          title="Extracted by AI / parser � needs human verification"
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-900 border border-amber-300 ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-700 stroke-[2.5]" />
          Needs Review
        </span>
      );

    case 'rejected':
      return (
        <span
          title="Rejected during clinician verification"
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 ${className}`}
        >
          <XCircle className="w-3 h-3 text-rose-600 stroke-[2.5]" />
          Rejected
        </span>
      );

    case 'unverified':
    default:
      return (
        <span
          title="Unverified extraction item"
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 ${className}`}
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          Unverified
        </span>
      );
  }
};
