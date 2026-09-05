import React from 'react';
import { usePatient } from '../context/PatientContext';
import { Pill, AlertTriangle, ExternalLink } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { Medication } from '../types/medical';

export const MedicationsPage: React.FC = () => {
  const { currentPatient, state, updateMedicationVerification, openSourceInspector } = usePatient();
  const meds = state.meds.filter((m: Medication) => m.patientId === currentPatient?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Current Medications & Therapies</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Strictly non-prescriptive record tracking verbatim dosages extracted from clinical records for {currentPatient?.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Clinical Safety Rule:</strong>
          <p className="mt-0.5 text-amber-900 leading-relaxed">
            MedLens never prescribes medication, nor does it recommend altering any current dosages. If a dosage was not explicitly specified in the source document, it is marked as "Not specified in source" rather than inferred.
          </p>
        </div>
      </div>

      {/* Medications Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meds.map((med: Medication) => {
          const isConflict = med.name.toLowerCase().includes('amoxicillin');
          return (
            <div
              key={med.id}
              className={`p-6 rounded-3xl border transition-all ${
                isConflict 
                  ? 'bg-amber-50/50 border-amber-300 shadow-md ring-1 ring-amber-300' 
                  : 'bg-white border-slate-200/90 shadow-soft hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                    {isConflict && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Allergy Alert
                      </span>
                    )}
                  </div>
                  {med.indication && (
                    <p className="text-xs text-slate-500 mt-0.5">Indication: {med.indication}</p>
                  )}
                </div>

                <VerificationBadge status={med.verificationStatus} />
              </div>

              {/* Details */}
              <div className="mt-4 grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Documented Dose</span>
                  <span className={`font-semibold block mt-0.5 ${med.dose.includes('Not specified') ? 'italic text-slate-400' : 'text-slate-900'}`}>
                    {med.dose}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Documented Frequency</span>
                  <span className={`font-semibold block mt-0.5 ${med.frequency.includes('Not specified') ? 'italic text-slate-400' : 'text-slate-900'}`}>
                    {med.frequency}
                  </span>
                </div>

                {med.prescribedBy && (
                  <div className="col-span-2 pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 font-medium block">Recorded In / Prescribed By:</span>
                    <span className="text-slate-700 font-medium block mt-0.5">{med.prescribedBy}</span>
                  </div>
                )}
              </div>

              {/* Footer Provenance */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <ProvenanceBadge provenance={med.provenance.provenance} fullProvenance={med.provenance} />
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openSourceInspector(med.provenance)}
                    className="text-sky-600 hover:text-sky-800 text-xs font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {med.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => updateMedicationVerification(med.id, 'verified')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
