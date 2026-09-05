import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { Sparkles, ArrowRight, FileCheck2, Info } from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface Props {
  onViewAll?: () => void;
}

export const KeyObservationsCard: React.FC<Props> = ({ onViewAll }) => {
  const { state, currentPatient } = usePatient();
  const observations = state.observations.filter(o => o.patientId === currentPatient?.id);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Key Clinical Observations</h3>
            <p className="text-xs text-slate-500">Documented clinician notes & structured findings</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
        {observations.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No observations recorded yet.
          </div>
        ) : (
          observations.slice(0, 3).map((obs) => (
            <div
              key={obs.id}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  {obs.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{obs.date}</span>
              </div>

              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {obs.description}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <ProvenanceBadge 
                  provenance={obs.provenance.provenance} 
                  fullProvenance={obs.provenance} 
                />
                <span className="text-[10px] text-slate-600">
                  {obs.provenance.sourceName}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Observations are cited verbatim from verified source diagnostic documents.</span>
      </div>
    </div>
  );
};
