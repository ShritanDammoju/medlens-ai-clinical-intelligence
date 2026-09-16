import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { usePatient } from '../context/PatientContext';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Copy, 
  Check, 
  Stethoscope, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Heart, 
  FileText, 
  AlertCircle,
  Clock,
  Pill,
  Shield
} from 'lucide-react';
import { savePatientRecordToFirestore, saveDoctorProfileToFirestore } from '../firebase/firestore';
import { Patient, DoctorProfile } from '../types/medical';

export const ProfilePage: React.FC = () => {
  const { userProfile, role, updateUserProfileState } = useAuth();
  const { currentPatient, connections } = usePatient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for Patient
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [dob, setDob] = useState(userProfile?.dateOfBirth || currentPatient?.dob || '1995-06-15');
  const [age, setAge] = useState(String(userProfile?.age || currentPatient?.age || 30));
  const [sex, setSex] = useState(userProfile?.sex || currentPatient?.sex || 'Female');
  const [symptoms, setSymptoms] = useState(userProfile?.symptoms?.join(', ') || '');
  const [conditions, setConditions] = useState(userProfile?.conditions?.join(', ') || '');
  const [allergies, setAllergies] = useState(userProfile?.allergies?.join(', ') || '');
  const [medications, setMedications] = useState(userProfile?.medications?.join(', ') || '');
  const [notes, setNotes] = useState(userProfile?.notes || currentPatient?.notes || '');

  // Form states for Doctor
  const [specialization, setSpecialization] = useState(
    userProfile?.specialization || 'Internal Medicine & Clinical Diagnostics'
  );
  const [hospitalOrClinic, setHospitalOrClinic] = useState(
    userProfile?.hospitalOrClinic || 'MedLens Health Center'
  );

  const doctorCode = userProfile?.doctorCode || (userProfile?.uid ? `MED-${userProfile.uid.substring(0, 6).toUpperCase()}` : 'MED-000000');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(doctorCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancel = () => {
    // Revert edits from saved profile
    setDisplayName(userProfile?.displayName || '');
    setDob(userProfile?.dateOfBirth || currentPatient?.dob || '1995-06-15');
    setAge(String(userProfile?.age || currentPatient?.age || 30));
    setSex(userProfile?.sex || currentPatient?.sex || 'Female');
    setSymptoms(userProfile?.symptoms?.join(', ') || '');
    setConditions(userProfile?.conditions?.join(', ') || '');
    setAllergies(userProfile?.allergies?.join(', ') || '');
    setMedications(userProfile?.medications?.join(', ') || '');
    setNotes(userProfile?.notes || currentPatient?.notes || '');
    setSpecialization(userProfile?.specialization || 'Internal Medicine & Clinical Diagnostics');
    setHospitalOrClinic(userProfile?.hospitalOrClinic || 'MedLens Health Center');
    setIsEditing(false);
    setFeedbackMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const parsedAge = parseInt(age, 10) || 30;
      const parsedSymptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      const parsedConditions = conditions.split(',').map(c => c.trim()).filter(Boolean);
      const parsedAllergies = allergies.split(',').map(a => a.trim()).filter(Boolean);
      const parsedMedications = medications.split(',').map(m => m.trim()).filter(Boolean);

      if (role === 'doctor') {
        await updateUserProfileState({
          displayName: displayName.trim(),
          specialization: specialization.trim(),
          hospitalOrClinic: hospitalOrClinic.trim()
        });

        if (userProfile?.uid) {
          const docData: DoctorProfile = {
            uid: userProfile.uid,
            email: userProfile.email || '',
            displayName: displayName.trim(),
            doctorCode,
            specialization: specialization.trim(),
            hospitalOrClinic: hospitalOrClinic.trim(),
            connectedPatientIds: connections.map(c => c.patientId),
            createdAt: userProfile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await saveDoctorProfileToFirestore(docData);
        }
      } else {
        await updateUserProfileState({
          displayName: displayName.trim(),
          dateOfBirth: dob,
          age: parsedAge,
          sex,
          symptoms: parsedSymptoms,
          conditions: parsedConditions,
          allergies: parsedAllergies,
          medications: parsedMedications,
          notes: notes.trim() || undefined
        });

        if (userProfile?.uid) {
          const patientData: Patient = {
            id: userProfile.uid,
            userId: userProfile.uid,
            name: displayName.trim(),
            age: parsedAge,
            sex: sex as any,
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
      }

      setFeedbackMsg({ type: 'success', text: 'Profile updated and saved to Firestore successfully.' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save profile changes:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recent Member';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'Profile Avatar'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-sky-400/40 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black border-2 border-sky-400/40 shadow-lg">
                {(userProfile?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {userProfile?.displayName || 'MedLens User'}
                </h1>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  role === 'doctor'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {role === 'doctor' ? 'Clinician Reviewer' : 'Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{userProfile?.email || 'Authenticated User'}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Member since {memberSince}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {role === 'doctor' ? 'Clinician Professional Information' : 'Patient Demographics & Clinical Profile'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Make your desired changes and click Save Changes' : 'Authorized medical profile data stored in Firestore'}
            </p>
          </div>
        </div>

        {/* Common: Display Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name / Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                {userProfile?.displayName || 'Clinical User'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Registered Email (Google Auth)
            </label>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-600 select-all">
              {userProfile?.email || 'user@medlens.health'}
            </div>
          </div>
        </div>

        {/* Role Specific Sections */}
        {role === 'doctor' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Specialization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {userProfile?.specialization || 'Internal Medicine & Clinical Diagnostics'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hospital / Clinic Affiliation
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={hospitalOrClinic}
                    onChange={(e) => setHospitalOrClinic(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {userProfile?.hospitalOrClinic || 'MedLens Affiliated Clinic'}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Code Display */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  Your Doctor Connection Code
                </span>
                <span className="font-mono text-2xl font-black text-sky-400 tracking-wider block mt-0.5 select-all">
                  {doctorCode}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Connected patients: <strong className="text-white">{connections.length} patients</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedCode ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Patient Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {dob}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {age} years
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biological Sex
                </label>
                {isEditing ? (
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {sex}
                  </div>
                )}
              </div>
            </div>

            {/* Baseline Health Info */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Baseline Clinical Data (Intake)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Provided by you
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Symptoms
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Fatigue, headache"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                      {symptoms || 'None recorded'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Medical Conditions
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="e.g. Hypertension"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                      {conditions || 'None recorded'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Allergies
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                      {allergies || 'None recorded'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Medications
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="e.g. Metformin 500mg"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                      {medications || 'None recorded'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Notes
                </label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                    {notes || 'No additional notes provided.'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
