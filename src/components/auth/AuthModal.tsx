import React from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { UserRole } from '../../types/medical';
import { Shield, User, Stethoscope, Lock, CheckCircle2, X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    closeAuthModal, 
    targetRole, 
    setTargetRole, 
    loginWithGoogle, 
    enterDemoMode,
    authLoading, 
    authError 
  } = useAuth();

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white relative">
          <button 
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Sign In to MedLens</h2>
              <p className="text-xs text-slate-300">Choose your workspace access role</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {authError}
            </div>
          )}

          {/* Role Chooser */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetRole('patient')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetRole === 'patient'
                    ? 'border-sky-500 bg-sky-50/60 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className={`w-5 h-5 mb-2 ${targetRole === 'patient' ? 'text-sky-600' : 'text-slate-400'}`} />
                <div className="font-bold text-sm">Patient Mode</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Explore reports, summaries & ask AI</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('doctor')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetRole === 'doctor'
                    ? 'border-sky-500 bg-sky-50/60 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className={`w-5 h-5 mb-2 ${targetRole === 'doctor' ? 'text-sky-600' : 'text-slate-400'}`} />
                <div className="font-bold text-sm">Clinician Reviewer</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Verification center, audit log & overrides</div>
              </button>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => loginWithGoogle(targetRole)}
            disabled={authLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{authLoading ? 'Signing In...' : 'Sign In with Google'}</span>
          </button>

          {/* Quick Offline Demo Bypass */}
          <div className="pt-2 text-center">
            <button
              onClick={enterDemoMode}
              className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              Continue with Simulated Offline Demo
            </button>
          </div>
        </div>

        {/* Security Tag */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          🔒 Secure authentication with HIPAA-aligned zero-leakage client privacy.
        </div>
      </div>
    </div>
  );
};
