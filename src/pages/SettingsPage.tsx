import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { usePatient } from '../context/PatientContext';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  User, 
  Stethoscope, 
  LogOut, 
  Copy, 
  Check, 
  ExternalLink,
  Shield,
  KeyRound
} from 'lucide-react';
import { ConnectedDoctorsCard } from '../components/patient/ConnectedDoctorsCard';

export const SettingsPage: React.FC = () => {
  const { userProfile, role, logout } = useAuth();
  const { aiMode, connections } = usePatient();
  const [copied, setCopied] = useState(false);

  const doctorCode = userProfile?.doctorCode || (userProfile?.uid ? `MED-${userProfile.uid.substring(0, 6).toUpperCase()}` : 'Generating...');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(doctorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Account Settings & Security</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your clinical profile, provider connections, and security preferences.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical Profile</h2>
              <p className="text-xs text-slate-500">Your authenticated account credentials</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            role === 'doctor' 
              ? 'bg-sky-100 text-sky-800 border border-sky-200' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {role === 'doctor' ? 'Clinician Account' : 'Patient Account'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Full Name</span>
            <span className="font-bold text-slate-900">{userProfile?.displayName || 'Clinical User'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Email Address</span>
            <span className="font-bold text-slate-900">{userProfile?.email || 'Authenticated User'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Account ID (UID)</span>
            <span className="font-mono text-xs text-slate-700 select-all">{userProfile?.uid || 'Unknown'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Authentication Provider</span>
            <span className="font-bold text-slate-900">Google OAuth (Firebase Auth)</span>
          </div>
        </div>
      </div>

      {/* Role-Specific Connection Manager */}
      {role === 'doctor' ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Doctor Connection Code</h2>
              <p className="text-xs text-slate-500">Provide this code to your patients for record access</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Your Clinician Code</span>
              <span className="font-mono text-2xl font-black text-sky-400 tracking-wider block mt-0.5">
                {doctorCode}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Active connections: <strong className="text-white">{connections.length} patients</strong>
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied!' : 'Copy Doctor Code'}</span>
            </button>
          </div>
        </div>
      ) : (
        <ConnectedDoctorsCard />
      )}

      {/* Privacy, Authorization & Security Architecture */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Security & Privacy Architecture</h2>
            <p className="text-xs text-slate-500">Authenticated access with role-based authorization</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-900">
              Authenticated access with role-based authorization and encrypted network transmission.
            </p>
            <p className="text-xs text-slate-500">
              Your clinical documents and biomarker extractions are stored securely in Google Cloud Firestore under your authenticated user ID. Data is synchronized across devices only after secure authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Strict Data Isolation</span>
              <p className="text-[11px] text-slate-500">Patients can only access their own records. Clinicians can only inspect records for patients with an approved connection.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Source-Bound Calibration</span>
              <p className="text-[11px] text-slate-500">Reference intervals are strictly bound to the source report's printed ranges. MedLens never invents normal limits.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Non-Diagnostic Mandate</span>
              <p className="text-[11px] text-slate-500">MedLens assists comprehension and clinical organization. It does not replace the judgment of licensed healthcare providers.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Clinician Audit Lineage</span>
              <p className="text-[11px] text-slate-500">All reviews, adjustments, and reconciliations create permanent, timestamped audit records with reviewer identification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Engine Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Active AI Intelligence Engine</h2>
            <p className="text-xs text-slate-500">Production generative clinical assistant</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-sky-950">Gemini 3.8 Flash</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Server-Side
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Clinical queries are processed securely via the server-side <code className="text-sky-800 font-mono text-xs">/api/chat</code> endpoint. Your API key remains strictly server-side and is never transmitted to the client browser.
          </p>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Sign Out of MedLens</h2>
          <p className="text-xs text-slate-500">Securely conclude your active session on this device</p>
        </div>

        <button
          onClick={() => logout()}
          className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
