import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';
import { 
  Search, 
  UserPlus, 
  Printer, 
  RotateCcw, 
  Activity, 
  ChevronDown, 
  Menu,
  Shield,
  LogIn,
  LogOut,
  Stethoscope,
  User,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface Props {
  onOpenIntake: () => void;
  onOpenUpload: () => void;
  onToggleMobileSidebar: () => void;
  onNavigateToExport: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Navbar: React.FC<Props> = ({
  onOpenIntake,
  onOpenUpload,
  onToggleMobileSidebar,
  onNavigateToExport,
  onNavigateTab
}) => {
  const { 
    currentPatient, 
    state, 
    setCurrentPatientId, 
    loadDemoPatient, 
    searchQuery, 
    setSearchQuery,
    isReviewingExternalPatient,
    exitPatientReview
  } = usePatient();

  const { userProfile, role, isDemoMode, openAuthModal, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (userProfile?.doctorCode) {
      navigator.clipboard.writeText(userProfile.doctorCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Med<span className="text-sky-600">Lens</span></span>
                <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                  role === 'doctor' 
                    ? 'bg-sky-100 text-sky-800 border-sky-200' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {role === 'doctor' ? 'CLINICIAN' : 'PATIENT'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, lab test, medication, or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Identity & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Doctor Code Quick Access Badge (for Clinicians) */}
          {role === 'doctor' && userProfile?.doctorCode && (
            <button
              onClick={handleCopyCode}
              title="Click to copy your Doctor Code for patients"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold border border-sky-200/80 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-sky-600 uppercase font-bold">Code:</span>
              <span className="font-mono font-bold text-sky-800">{userProfile.doctorCode}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-500" />}
            </button>
          )}

          {/* Load Demo Patient (only shown in Demo Mode or when not logged in) */}
          {isDemoMode && (
            <button
              onClick={loadDemoPatient}
              title="Reset to Alex Carter Hackathon Demo Dataset"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Reset Demo</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}

          {/* Patient Selector (when multiple patients exist in clinician view) */}
          {state.patients.length > 1 && (
            <div className="relative">
              <select
                value={currentPatient?.id || ''}
                onChange={(e) => setCurrentPatientId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {state.patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* New Patient Intake Button */}
          <button
            onClick={onOpenIntake}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Intake</span>
          </button>

          {/* Export Patient Record */}
          <button
            onClick={onNavigateToExport}
            title="Export Patient Record (Print-ready summary)"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Sign In / Sign Out */}
          {userProfile ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {userProfile.displayName}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{userProfile.role}</span>
              </div>

              <button
                onClick={() => logout()}
                title="Sign Out of MedLens"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('patient')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
