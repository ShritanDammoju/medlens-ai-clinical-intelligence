import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { generateDoctorCode } from '../../firebase/auth';
import { saveDoctorProfileToFirestore } from '../../firebase/firestore';
import { DoctorProfile } from '../../types/medical';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onComplete?: () => void;
}

export const DoctorOnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const { userProfile, updateUserProfileState } = useAuth();

  const [name, setName] = useState(() => {
    const raw = userProfile?.displayName || 'Dr. Clinician';
    return raw.startsWith('Dr.') ? raw : `Dr. ${raw}`;
  });
  const [specialization, setSpecialization] = useState(
    userProfile?.specialization || 'Internal Medicine & Clinical Diagnostics'
  );
  const [hospitalOrClinic, setHospitalOrClinic] = useState(
    userProfile?.hospitalOrClinic || 'MedLens Affiliated Clinical Center'
  );
  const [doctorCode] = useState(() => userProfile?.doctorCode || generateDoctorCode());
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(doctorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter your professional display name.');
      return;
    }
    if (!specialization.trim()) {
      setValidationError('Please enter your clinical specialization.');
      return;
    }
    if (!hospitalOrClinic.trim()) {
      setValidationError('Please enter your hospital or clinic affiliation.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Auth Profile
      await updateUserProfileState({
        displayName: name.trim(),
        specialization: specialization.trim(),
        hospitalOrClinic: hospitalOrClinic.trim(),
        doctorCode,
        isVerifiedReviewer: true,
        onboardingCompleted: true
      });

      // 2. Save Doctor Profile in Firestore
      if (userProfile?.uid) {
        const docProfile: DoctorProfile = {
          uid: userProfile.uid,
          email: userProfile.email || '',
          displayName: name.trim(),
          doctorCode,
          specialization: specialization.trim(),
          hospitalOrClinic: hospitalOrClinic.trim(),
          connectedPatientIds: [],
          createdAt: userProfile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDoctorProfileToFirestore(docProfile);
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });

      onComplete?.();
    } catch (err: any) {
      console.error('Doctor onboarding save error:', err);
      setValidationError('Failed to complete clinician setup. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Clinician Profile Setup</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome, Healthcare Professional
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Set up your clinician credentials and permanent connection code.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-5">
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Professional Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jordan Hayes, MD"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Specialization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Internal Medicine"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital / Clinic Affiliation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hospitalOrClinic}
                onChange={(e) => setHospitalOrClinic(e.target.value)}
                placeholder="e.g. City General Hospital"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Generated Doctor Code Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                Your Permanent Doctor Connection Code
              </span>
              <span className="text-[10px] text-slate-400">Share with patients for record access</span>
            </div>
            <div className="flex items-center justify-between gap-3 bg-slate-950/80 rounded-xl px-4 py-2.5 border border-slate-800">
              <span className="font-mono text-xl font-black text-sky-400 tracking-wider">
                {doctorCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSaving ? 'Configuring Profile...' : 'Complete Setup & Open Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
