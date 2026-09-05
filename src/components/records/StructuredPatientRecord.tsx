import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { LabResult } from '../../types/medical';
import { 
  User, 
  Heart, 
  AlertTriangle, 
  ShieldAlert, 
  Pill, 
  FlaskConical, 
  FileText, 
  Sparkles, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  Droplet, 
  Edit3, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Activity
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { EditFieldModal } from './EditFieldModal';

interface Props {
  onNavigateTab?: (tab: any) => void;
  onUploadClick?: () => void;
}

export const StructuredPatientRecord: React.FC<Props> = ({ onNavigateTab, onUploadClick }) => {
  const { currentPatient, state, searchQuery } = usePatient();
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);

  if (!currentPatient) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">No Patient Record Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete your initial clinical intake or upload a diagnostic document to establish your patient health profile.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Upload Report
            </button>
          )}
        </div>
      </div>
    );
  }

  const patientLabs = state.labs.filter(l => l.patientId === currentPatient.id);
  const patientMeds = state.meds.filter(m => m.patientId === currentPatient.id);
  const patientConditions = state.conditions.filter(c => c.patientId === currentPatient.id);
  const patientAllergies = state.allergies.filter(a => a.patientId === currentPatient.id);
  const patientSymptoms = state.symptoms.filter(s => s.patientId === currentPatient.id);
  const patientObservations = state.observations.filter(o => o.patientId === currentPatient.id);
  const patientReports = state.reports.filter(r => r.patientId === currentPatient.id);
  const patientTimeline = state.timeline.filter(t => t.patientId === currentPatient.id);
  const aiSummary = state.aiInsights[currentPatient.id];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Patient Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 shadow-lg shadow-sky-500/30 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentPatient.name}
                </h1>
                {currentPatient.isDemo && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Demo Patient
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {currentPatient.age} years � {currentPatient.sex}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  DOB: {currentPatient.dob}
                </span>
                {currentPatient.bloodType && (
                  <span className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-400" />
                    Blood Type: {currentPatient.bloodType}
                  </span>
                )}
                {currentPatient.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentPatient.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProvenanceBadge 
              provenance="Patient Provided" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20" 
            />
            {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Add Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Demographics row */}
        {currentPatient.notes && (
          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-300 flex items-start gap-2">
            <span className="text-sky-400 font-semibold shrink-0">Intake Clinical Note:</span>
            <span className="text-slate-300 leading-relaxed">{currentPatient.notes}</span>
          </div>
        )}
      </div>

      {/* Grid: Health Profile (Symptoms, Conditions, Allergies) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Symptoms */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Reported Symptoms</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {patientSymptoms.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {patientSymptoms.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900">{s.symptom}</span>
                  {s.severity && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                      {s.severity}
                    </span>
                  )}
                </div>
                {s.duration && <p className="text-[11px] text-slate-500 mt-0.5">Duration: {s.duration}</p>}
                {s.notes && <p className="text-[11px] text-slate-600 mt-1 italic">{s.notes}</p>}
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <ProvenanceBadge provenance={s.provenance.provenance} fullProvenance={s.provenance} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Conditions */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900">Existing Conditions</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {patientConditions.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {patientConditions.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900">{c.name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {c.status}
                  </span>
                </div>
                {c.diagnosedDate && <p className="text-[11px] text-slate-500 mt-0.5">Identified: {c.diagnosedDate}</p>}
                {c.notes && <p className="text-[11px] text-slate-600 mt-1">{c.notes}</p>}
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <ProvenanceBadge provenance={c.provenance.provenance} fullProvenance={c.provenance} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Allergies</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {patientAllergies.length} Critical
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {patientAllergies.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-amber-950">{a.allergen}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                    {a.severity}
                  </span>
                </div>
                {a.reaction && (
                  <p className="text-[11px] text-amber-900 font-medium mt-1">
                    Reaction: {a.reaction}
                  </p>
                )}
                <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between">
                  <ProvenanceBadge provenance={a.provenance.provenance} fullProvenance={a.provenance} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Laboratory Results (Major Focus) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Structured Laboratory Results</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated strictly against explicit source reference ranges. Never guessed or estimated.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{patientLabs.length} Total Tests</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="pb-3 pr-4">Test Name</th>
                <th className="pb-3 px-3">Result / Value</th>
                <th className="pb-3 px-3">Source Ref Range</th>
                <th className="pb-3 px-3">Report Date</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3">Source & Lineage</th>
                <th className="pb-3 px-3 text-center">Verification</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientLabs.map((lab) => (
                <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 pr-4">
                    <span className="font-bold text-slate-900 block">{lab.testName}</span>
                    {lab.observation && (
                      <span className="text-[11px] text-slate-500 italic block mt-0.5">{lab.observation}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                    {lab.resultValue}{' '}
                    <span className="font-sans font-normal text-xs text-slate-500">{lab.unit}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    {lab.referenceRange ? (
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {lab.referenceRange} {lab.unit}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 italic text-slate-500 text-[11px] bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded">
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        Reference range not provided in source
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-600 font-mono whitespace-nowrap">
                    {lab.date || 'Unrecorded'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={lab.status} explanation={lab.statusExplanation} />
                  </td>
                  <td className="py-3.5 px-3">
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
                  <td className="py-3.5 px-3 text-center">
                    <VerificationBadge status={lab.verificationStatus} verifiedBy={lab.provenance.verifiedBy} />
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    <button
                      onClick={() => setEditingLab(lab)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                      title="Edit or audit laboratory field"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medications Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Current Medications & Therapies</h2>
              <p className="text-xs text-slate-500">Documented in clinical visits or uploaded discharge records</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientMeds.map((med) => (
            <div
              key={med.id}
              className={`p-4 rounded-2xl border transition-all ${
                med.name.toLowerCase().includes('amoxicillin')
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Dose: {med.dose}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      Freq: {med.frequency}
                    </span>
                  </div>
                </div>
                <VerificationBadge status={med.verificationStatus} />
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <ProvenanceBadge provenance={med.provenance.provenance} fullProvenance={med.provenance} />
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  {med.provenance.sourceName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingLab && (
        <EditFieldModal lab={editingLab} onClose={() => setEditingLab(null)} />
      )}
    </div>
  );
};
