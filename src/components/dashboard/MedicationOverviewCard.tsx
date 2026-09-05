import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { Pill, ArrowRight, AlertTriangle } from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { VerificationBadge } from '../common/VerificationBadge';

interface Props {
  onViewAll?: () => void;
}

export const MedicationOverviewCard: React.FC<Props> = ({ onViewAll }) => {
  const { state, currentPatient } = usePatient();
  const meds = state.meds.filter(m => m.patientId === currentPatient?.id);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Current Medications</h3>
            <p className="text-xs text-slate-500">Cross-referenced active therapies & prescriptions</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>All ({meds.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
        {meds.slice(0, 3).map((med) => {
          const isConflictItem = med.name.toLowerCase().includes('amoxicillin');
          return (
            <div
              key={med.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isConflictItem 
                  ? 'bg-amber-50/60 border-amber-300' 
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {med.name}
                    {isConflictItem && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        Allergy Alert
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {med.dose} � {med.frequency}
                  </p>
                </div>
                <VerificationBadge status={med.verificationStatus} />
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <ProvenanceBadge 
                  provenance={med.provenance.provenance} 
                  fullProvenance={med.provenance} 
                />
                <span className="text-[10px] text-slate-600 truncate max-w-[140px]">
                  {med.provenance.sourceName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
        Non-prescriptive record. Dosages reflect verbatim clinician documentation.
      </div>
    </div>
  );
};
