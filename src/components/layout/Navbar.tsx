import React from 'react';
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
  User
} from 'lucide-react';

interface Props {
  onOpenIntake: () => void;
  onOpenUpload: () => void;
  onToggleMobileSidebar: () => void;
  onNavigateToExport: () => void;
}

export const Navbar: React.FC<Props> = ({
  onOpenIntake,
  onOpenUpload,
  onToggleMobileSidebar,
  onNavigateToExport
}) => {
  const { 
    currentPatient, 
    state, 
    setCurrentPatientId, 
    loadDemoPatient, 
    searchQuery, 
    setSearchQuery,
    aiMode 
  } = usePatient();

  const { userProfile, role, isDemoMode, openAuthModal, logout } = useAuth();

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
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
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

        {/* Right: Actions, Patient Selector & Demo Loader */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role / Auth Switcher Badge */}
          <button
            onClick={() => openAuthModal(role === 'doctor' ? 'patient' : 'doctor')}
            title="Switch between Patient and Clinician Reviewer role"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80"
          >
            {role === 'doctor' ? (
              <>
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                <span>Dr. Mode</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Patient</span>
              </>
            )}
          </button>

          {/* Load Demo Patient Button */}
          <button
            onClick={loadDemoPatient}
            title="Reset to Alex Carter Hackathon Demo Dataset"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Load Demo Patient</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Patient Dropdown Selector */}
          <div className="relative">
            <select
              value={currentPatient?.id || ''}
              onChange={(e) => setCurrentPatientId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {state.patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.sex})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* New Patient Intake Button */}
          <button
            onClick={onOpenIntake}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Patient</span>
          </button>

          {/* Export Patient Record */}
          <button
            onClick={onNavigateToExport}
            title="Export Patient Record (Print-ready PDF summary)"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Sign In / Out */}
          {userProfile ? (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('patient')}
              title="Sign In with Google"
              className="p-1.5 text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
