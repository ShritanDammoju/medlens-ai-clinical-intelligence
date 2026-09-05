import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { FlaskConical, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { VerificationBadge } from '../common/VerificationBadge';

interface Props {
  onViewAll?: () => void;
}

export const LatestLabsCard: React.FC<Props> = ({ onViewAll }) => {
  const { state, currentPatient } = usePatient();
  const labs = state.labs.filter(l => l.patientId === currentPatient?.id);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Latest Laboratory Results</h3>
            <p className="text-xs text-slate-500">Categorized strictly against source report ranges</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>All Labs ({labs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/70 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="pb-2.5 font-medium">Test Name</th>
              <th className="pb-2.5 font-medium">Value</th>
              <th className="pb-2.5 font-medium">Source Ref Range</th>
              <th className="pb-2.5 font-medium text-center">Status</th>
              <th className="pb-2.5 font-medium text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {labs.slice(0, 5).map((lab) => (
              <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 pr-2">
                  <div className="font-semibold text-slate-900">{lab.testName}</div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <ProvenanceBadge 
                      provenance={lab.provenance.provenance} 
                      fullProvenance={lab.provenance} 
                    />
                  </div>
                </td>
                <td className="py-3 px-2 font-mono font-bold text-slate-900">
                  {lab.resultValue} <span className="font-sans font-normal text-slate-600 text-[11px]">{lab.unit}</span>
                </td>
                <td className="py-3 px-2">
                  {lab.referenceRange ? (
                    <span className="font-mono text-slate-600 text-xs">
                      {lab.referenceRange} {lab.unit}
                    </span>
                  ) : (
                    <span className="italic text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      Reference range not provided in source
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  <StatusBadge status={lab.status} explanation={lab.statusExplanation} />
                </td>
                <td className="py-3 pl-2 text-right">
                  <VerificationBadge status={lab.verificationStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
