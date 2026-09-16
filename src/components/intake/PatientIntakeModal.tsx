import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';
import { 
  UserPlus, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Heart, 
  ShieldAlert, 
  Pill, 
  Activity,
  FileText,
  Users,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { savePatientRecordToFirestore, getPatientById } from '../../firebase/firestore';
import { Patient } from '../../types/medical';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PatientIntakeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentPatient, addPatient, connections } = usePatient();
  const { role, userProfile, updateUserProfileState } = useAuth();

  const isDoctor = role === 'doctor';
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  // Selected patient for doctor view
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (isDoctor && acceptedConnections.length > 0) {
      return acceptedConnections[0].patientId;
    }
    return currentPatient?.id || userProfile?.uid || '';
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Health Info
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');

  // Step 3: Additional Notes
  const [notes, setNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load selected patient details
  useEffect(() => {
    if (isDoctor) {
      if (acceptedConnections.length > 0) {
        const targetId = selectedPatientId || acceptedConnections[0].patientId;
        const targetConn = acceptedConnections.find(c => c.patientId === targetId);
        setName(targetConn?.patientName || '');
        setAge(targetConn?.patientAge ? String(targetConn.patientAge) : '32');
        setSex((targetConn?.patientSex as any) || 'Female');
        setEmail(targetConn?.patientEmail || '');
      }
    } else {
      setName(currentPatient?.name || userProfile?.displayName || '');
      setAge(String(currentPatient?.age || userProfile?.age || 30));
      setDob(currentPatient?.dob || userProfile?.dateOfBirth || '1995-06-15');
      setSex((currentPatient?.sex || userProfile?.sex as any) || 'Female');
      setEmail(currentPatient?.email || userProfile?.email || '');
      setSymptoms(userProfile?.symptoms?.join(', ') || '');
      setConditions(userProfile?.conditions?.join(', ') || '');
      setAllergies(userProfile?.allergies?.join(', ') || '');
      setMedications(userProfile?.medications?.join(', ') || '');
      setNotes(currentPatient?.notes || userProfile?.notes || '');
    }
  }, [isDoctor, selectedPatientId, currentPatient, userProfile]);

  if (!isOpen) return null;

  // If doctor has NO connected patients, show clear empty state
  if (isDoctor && acceptedConnections.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 text-center space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Connected Patients</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              To document clinical intake for a patient, the patient must first connect with you using your Doctor Connection Code (<strong className="text-slate-800">{userProfile?.doctorCode || 'MED-CODE'}</strong>).
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const selectedPatientName = isDoctor
    ? (acceptedConnections.find(c => c.patientId === selectedPatientId)?.patientName || name)
    : (name || 'Your Records');

  const handleNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!name.trim()) {
        setValidationError('Please enter patient name.');
        return;
      }
      if (!age || parseInt(age) <= 0) {
        setValidationError('Please enter a valid age.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsSaving(true);

    try {
      const parsedAge = parseInt(age) || 30;
      const parsedSymptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      const parsedConditions = conditions.split(',').map(c => c.trim()).filter(Boolean);
      const parsedAllergies = allergies.split(',').map(a => a.trim()).filter(Boolean);
      const parsedMedications = medications.split(',').map(m => m.trim()).filter(Boolean);

      const targetId = isDoctor ? selectedPatientId : (userProfile?.uid || 'pat-' + Date.now());

      const patientData: Patient = {
        id: targetId,
        userId: isDoctor ? targetId : userProfile?.uid,
        name: name.trim(),
        age: parsedAge,
        sex,
        dob: dob || '1995-06-15',
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        notes: notes.trim() || undefined,
        bloodType: 'O+',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: false
      };

      // Save patient record in Firestore
      await savePatientRecordToFirestore(patientData);

      if (!isDoctor) {
        await updateUserProfileState({
          displayName: name.trim(),
          age: parsedAge,
          sex,
          dateOfBirth: dob || '1995-06-15',
          symptoms: parsedSymptoms,
          conditions: parsedConditions,
          allergies: parsedAllergies,
          medications: parsedMedications,
          notes: notes.trim() || undefined
        });
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to save intake:', err);
      setValidationError('Failed to save intake record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              {isDoctor ? <Stethoscope className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">
                  {isDoctor ? 'Clinician Intake' : 'Patient Self-Intake'}
                </span>
                <ProvenanceBadge provenance="Patient Provided" className="bg-white/10 text-white border-white/20" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isDoctor ? 'Document Patient Intake' : 'Update Clinical Intake'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Patient Selector Banner */}
        {isDoctor && (
          <div className="p-4 bg-sky-50 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Documenting Intake for: <strong className="text-sky-950">{selectedPatientName}</strong></span>
            </div>
            {acceptedConnections.length > 1 && (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {acceptedConnections.map(c => (
                  <option key={c.patientId} value={c.patientId}>
                    {c.patientName} ({c.patientAge}y)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>1</span>
            <span>Demographics</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>2</span>
            <span>Symptoms & Meds</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>3</span>
            <span>Notes</span>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {validationError}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sex *</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>Current Symptoms</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fatigue, occasional shortness of breath"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Existing Medical Conditions</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Hypothyroidism"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Known Allergies</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Current Medications</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lisinopril 10mg"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Clinical Notes & Background Context</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Record historical surgeries, family history, or clinical observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Information</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Spouse) - +1 (555) 987-6543"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Record Intake'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
