import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { savePatientRecordToFirestore } from '../../firebase/firestore';
import { Patient } from '../../types/medical';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onComplete?: () => void;
}

export const PatientOnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const { userProfile, updateUserProfileState } = useAuth();
  const { currentPatient, addPatient } = usePatient();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(userProfile?.displayName || '');
  const [dob, setDob] = useState(userProfile?.dateOfBirth || '1995-06-15');
  const [age, setAge] = useState(userProfile?.age ? String(userProfile.age) : '30');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(
    (userProfile?.sex as any) || 'Female'
  );

  // Optional baseline health inputs
  const [symptoms, setSymptoms] = useState(userProfile?.symptoms?.join(', ') || '');
  const [conditions, setConditions] = useState(userProfile?.conditions?.join(', ') || '');
  const [allergies, setAllergies] = useState(userProfile?.allergies?.join(', ') || '');
  const [medications, setMedications] = useState(userProfile?.medications?.join(', ') || '');
  const [notes, setNotes] = useState(userProfile?.notes || '');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const calculateAge = (dobString: string) => {
    if (!dobString) return;
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculated = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculated--;
    }
    if (calculated >= 0 && calculated <= 120) {
      setAge(String(calculated));
    }
  };

  const handleNext = () => {
    setValidationError(null);
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!dob) {
      setValidationError('Please specify your date of birth.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 125) {
      setValidationError('Please enter a valid age (0-125).');
      return;
    }
    setStep(2);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsSaving(true);

    try {
      const parsedAge = parseInt(age, 10) || 30;
      const parsedSymptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      const parsedConditions = conditions.split(',').map(c => c.trim()).filter(Boolean);
      const parsedAllergies = allergies.split(',').map(a => a.trim()).filter(Boolean);
      const parsedMedications = medications.split(',').map(m => m.trim()).filter(Boolean);

      // Save to Auth Profile in Firestore
      await updateUserProfileState({
        displayName: name.trim(),
        dateOfBirth: dob,
        age: parsedAge,
        sex,
        symptoms: parsedSymptoms,
        conditions: parsedConditions,
        allergies: parsedAllergies,
        medications: parsedMedications,
        notes: notes.trim() || undefined,
        onboardingCompleted: true
      });

      // Save to Patient Record in Firestore
      if (userProfile?.uid) {
        const patientData: Patient = {
          id: userProfile.uid,
          userId: userProfile.uid,
          name: name.trim(),
          age: parsedAge,
          sex,
          dob,
          email: userProfile.email,
          connectedDoctorIds: [],
          notes: notes.trim() || undefined,
          createdAt: userProfile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false
        };
        await savePatientRecordToFirestore(patientData);
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });

      onComplete?.();
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setValidationError('Unable to complete profile setup. Please try again.');
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
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Mandatory Profile Setup</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome to MedLens
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Please complete your patient clinical profile to access your health record.
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/10">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-sky-400' : 'bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-sky-400' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleComplete} className="p-6 sm:p-7 space-y-5">
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Step 1: Basic Demographics</h3>
                <p className="text-xs text-slate-500">Required to structure your medical reports correctly.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      calculateAge(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biological Sex <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Female', 'Male', 'Other'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSex(option)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        sex === option
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Health Baseline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 2: Baseline Health Context</h3>
                  <p className="text-xs text-slate-500">Optional baseline data to cross-check against uploaded lab reports.</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Provided by you
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Symptoms (if any)
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild fatigue, joint stiffness (comma separated)"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Known Medical Conditions (if any)
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes (comma separated)"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Medications
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Lisinopril"
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context your healthcare provider or review team should note..."
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Demographics
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Profile...' : 'Save & Open Dashboard'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
