import React, { useState, useRef, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';
import { 
  Search, 
  UserPlus, 
  Printer, 
  Activity, 
  ChevronDown, 
  Menu, 
  Shield, 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  Copy, 
  Check, 
  Sparkles,
  Stethoscope
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
    searchQuery, 
    setSearchQuery,
    isReviewingExternalPatient,
    exitPatientReview
  } = usePatient();

  const { userProfile, role, openAuthModal, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Patient Selector (when reviewing external patient) */}
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

          {/* User Profile Dropdown Menu */}
          {userProfile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                aria-label="User profile menu"
              >
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(userProfile.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight">
                    {userProfile.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize leading-none">
                    {userProfile.role}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userProfile.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                    <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      role === 'doctor' 
                        ? 'bg-sky-50 text-sky-700 border-sky-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {role === 'doctor' ? 'Clinician' : 'Patient'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateTab?.('profile');
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-sky-600" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateTab?.('settings');
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings & Security</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
