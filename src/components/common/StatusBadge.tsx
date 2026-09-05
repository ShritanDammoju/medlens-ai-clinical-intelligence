import React from 'react';
import { LabStatus } from '../../types/medical';
import { CheckCircle2, ArrowDownCircle, ArrowUpCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: LabStatus;
  explanation?: string;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, explanation, className = '' }) => {
  switch (status) {
    case 'NORMAL':
      return (
        <span
          title={explanation || 'Result is within source reference range'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          NORMAL
        </span>
      );

    case 'LOW':
      return (
        <span
          title={explanation || 'Result is below source reference range'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 ${className}`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          LOW
        </span>
      );

    case 'HIGH':
      return (
        <span
          title={explanation || 'Result exceeds source reference range'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          HIGH
        </span>
      );

    case 'Cannot determine':
    default:
      return (
        <span
          title={explanation || 'Reference range not provided in source'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          Cannot determine
        </span>
      );
  }
};
