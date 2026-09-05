import React from 'react';
import { usePatient } from '../../context/PatientContext';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  User, 
  Check, 
  FlaskConical, 
  Pill, 
  Clock, 
  FileText 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { VerificationBadge } from '../common/VerificationBadge';

interface Props {
  onBack: () => void;
}

export const PrintablePatientSummary: React.FC<Props> = ({ onBack }) => {
  const { currentPatient, state } = usePatient();

  if (!currentPatient) return null;

  const patientLabs = state.labs.filter(l => l.patientId === currentPatient.id);
  const patientMeds = state.meds.filter(m => m.patientId === currentPatient.id);
  const patientObservations = state.observations.filter(o => o.patientId === currentPatient.id);
  const patientTimeline = state.timeline.filter(t => t.patientId === currentPatient.id);
  const aiInsights = state.aiInsights[currentPatient.id];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Export Patient Summary Record</h1>
            <p className="text-xs text-slate-500">Print-ready clinical document with full lineage audit</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md max-w-4xl mx-auto text-slate-900 font-sans space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-2xl tracking-tight text-slate-950">Med<span className="text-sky-600">Lens</span></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">� CLINICAL INFORMATION REPORT</span>
            </div>
            <p className="text-xs text-slate-500">AI-Powered Clinical Information Intelligence � Non-Diagnostic Synthesis</p>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div>Record ID: {currentPatient.id.toUpperCase()}</div>
          </div>
        </div>

        {/* Patient Demographics Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Patient Full Name</span>
            <span className="font-bold text-sm text-slate-900">{currentPatient.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Age & Sex</span>
            <span className="font-bold text-sm text-slate-900">{currentPatient.age} years � {currentPatient.sex}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Date of Birth</span>
            <span className="font-bold text-sm text-slate-900">{currentPatient.dob}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Blood Type</span>
            <span className="font-bold text-sm text-slate-900">{currentPatient.bloodType || 'A+'}</span>
          </div>
        </div>

        {/* AI Patient-Friendly Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-600" />
            1. Clinical Information Summary
          </h2>
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/60 text-xs sm:text-sm text-slate-800 leading-relaxed">
            {aiInsights?.patientFriendlySummary || 'Comprehensive synthesis of documented laboratory results.'}
          </div>
        </div>

        {/* Structured Laboratory Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-sky-600" />
            2. Structured Laboratory Results
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-2.5">Test Name</th>
                <th className="p-2.5">Result</th>
                <th className="p-2.5">Source Ref Range</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5">Source Document</th>
                <th className="p-2.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {patientLabs.map((l) => (
                <tr key={l.id}>
                  <td className="p-2.5 font-bold text-slate-900">{l.testName}</td>
                  <td className="p-2.5 font-mono font-bold">{l.resultValue} {l.unit}</td>
                  <td className="p-2.5 font-mono text-slate-600">{l.referenceRange ? `${l.referenceRange} ${l.unit}` : 'Not provided in source'}</td>
                  <td className="p-2.5 text-center font-bold">{l.status}</td>
                  <td className="p-2.5 text-slate-500 font-mono text-[11px]">{l.provenance.sourceName}</td>
                  <td className="p-2.5 text-right uppercase font-semibold text-[10px] text-emerald-800">{l.verificationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Medications */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-amber-600" />
            3. Tracked Medications & Supplements
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {patientMeds.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="font-bold text-slate-900 block">{m.name}</span>
                <span className="text-slate-600 block">{m.dose} � {m.frequency}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Source: {m.provenance.sourceName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-600" />
            4. Clinical Document Observations
          </h2>
          <div className="space-y-2 text-xs">
            {patientObservations.map((o) => (
              <div key={o.id} className="p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">{o.title}: </span>
                <span className="text-slate-700">{o.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent Safety Disclaimer */}
        <div className="pt-6 border-t border-slate-300 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            MedLens Responsible Clinical AI Disclaimer
          </p>
          <p className="leading-relaxed">
            MedLens is an information organization and understanding tool. It does not provide medical diagnosis or treatment. Information may be incomplete or inaccurate. Always verify important information with the original source and consult a qualified healthcare professional for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
