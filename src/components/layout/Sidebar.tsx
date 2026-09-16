import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Pill, 
  FlaskConical, 
  Clock, 
  Sparkles, 
  CheckCheck, 
  GitCompare, 
  Settings, 
  User,
  ShieldCheck,
  Activity,
  Stethoscope,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';

export type NavTab = 
  | 'overview' 
  | 'doctor_portal'
  | 'patients' 
  | 'reports' 
  | 'medications' 
  | 'labs' 
  | 'timeline' 
  | 'insights' 
  | 'verification' 
  | 'comparison'
  | 'profile'
  | 'settings'
  | 'export';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const { state, pendingDoctorRequests, isReviewingExternalPatient } = usePatient();
  const { role } = useAuth();

  const needsReviewCount = state.labs.filter(l => l.verificationStatus === 'needs_review').length +
    state.meds.filter(m => m.verificationStatus === 'needs_review').length;

  const conflictsCount = state.conflicts.filter(c => !c.resolved).length;
  const isDoctor = role === 'doctor';

  const navItems = isDoctor
    ? [
        { 
          id: 'doctor_portal' as NavTab, 
          label: 'Clinician Dashboard', 
          icon: Stethoscope,
          badge: pendingDoctorRequests.length > 0 ? `${pendingDoctorRequests.length}` : undefined,
          badgeColor: 'bg-emerald-400 text-slate-950 font-bold'
        },
        ...(isReviewingExternalPatient ? [
          { id: 'overview' as NavTab, label: 'Patient Overview', icon: LayoutDashboard },
          { id: 'patients' as NavTab, label: 'Patient Record', icon: Users },
          { id: 'reports' as NavTab, label: 'Diagnostic Reports', icon: FileText, count: state.reports.length },
          { id: 'labs' as NavTab, label: 'Biomarkers & Trends', icon: FlaskConical, count: state.labs.length },
          { id: 'medications' as NavTab, label: 'Medications', icon: Pill, count: state.meds.length },
          { id: 'timeline' as NavTab, label: 'Clinical Timeline', icon: Clock },
          { 
            id: 'verification' as NavTab, 
            label: 'Verification Center', 
            icon: CheckCheck,
            badge: needsReviewCount > 0 ? `${needsReviewCount}` : undefined,
            badgeColor: 'bg-amber-100 text-amber-800'
          },
        ] : []),
        { id: 'profile' as NavTab, label: 'Clinician Profile', icon: User },
        { id: 'settings' as NavTab, label: 'Settings & Security', icon: Settings },
      ]
    : [
        { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'patients' as NavTab, label: 'My Health Record', icon: Users },
        { id: 'reports' as NavTab, label: 'Diagnostic Reports', icon: FileText, count: state.reports.length },
        { id: 'labs' as NavTab, label: 'Lab Trends', icon: FlaskConical, count: state.labs.length },
        { id: 'medications' as NavTab, label: 'Medications', icon: Pill, count: state.meds.length },
        { id: 'timeline' as NavTab, label: 'Health Timeline', icon: Clock },
        { 
          id: 'insights' as NavTab, 
          label: 'AI Insights', 
          icon: Sparkles,
          badge: conflictsCount > 0 ? `${conflictsCount}` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800'
        },
        { id: 'comparison' as NavTab, label: 'Report Comparison', icon: GitCompare },
        { 
          id: 'verification' as NavTab, 
          label: 'Verification', 
          icon: CheckCheck,
          badge: needsReviewCount > 0 ? `${needsReviewCount}` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        { id: 'profile' as NavTab, label: 'My Profile', icon: User },
        { id: 'settings' as NavTab, label: 'Settings & Clinicians', icon: Settings },
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out no-print
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Brand Header */}
        <div className={`h-16 px-4 flex items-center justify-between border-b border-slate-800/80 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/30 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="hidden lg:block">
                <span className="text-white font-extrabold text-lg tracking-tight">Med<span className="text-sky-400">Lens</span></span>
                <p className="text-[9px] text-slate-400 font-medium tracking-wide leading-none">Clinical Intelligence</p>
              </div>
            )}
            <div className="lg:hidden">
              <span className="text-white font-extrabold text-lg tracking-tight">Med<span className="text-sky-400">Lens</span></span>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide leading-none">Clinical Intelligence</p>
            </div>
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar to Icon Rail'}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Clinical Workflow</span>
              {isDoctor && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  DOCTOR
                </span>
              )}
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer group
                  ${isActive 
                    ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                  ${isCollapsed ? 'lg:justify-center' : 'justify-between'}
                `}
              >
                <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && !item.badge && (
                      <span className="text-[11px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Clinical Trust Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Reference Safe</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                MedLens never synthesizes unverified reference ranges. Non-diagnostic intelligence.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
