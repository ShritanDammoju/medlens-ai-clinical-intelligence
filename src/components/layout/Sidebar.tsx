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
  ShieldCheck,
  Activity,
  X
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export type NavTab = 
  | 'overview' 
  | 'patients' 
  | 'reports' 
  | 'medications' 
  | 'labs' 
  | 'timeline' 
  | 'insights' 
  | 'verification' 
  | 'comparison'
  | 'settings'
  | 'export';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile
}) => {
  const { state } = usePatient();

  const needsReviewCount = state.labs.filter(l => l.verificationStatus === 'needs_review').length +
    state.meds.filter(m => m.verificationStatus === 'needs_review').length;

  const conflictsCount = state.conflicts.filter(c => !c.resolved).length;

  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'patients' as NavTab, label: 'Patient Record', icon: Users },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText, count: state.reports.length },
    { id: 'medications' as NavTab, label: 'Medications', icon: Pill, count: state.meds.length },
    { id: 'labs' as NavTab, label: 'Lab Results', icon: FlaskConical, count: state.labs.length },
    { id: 'comparison' as NavTab, label: 'Comparison', icon: GitCompare },
    { id: 'timeline' as NavTab, label: 'Timeline', icon: Clock },
    { 
      id: 'insights' as NavTab, 
      label: 'AI Insights', 
      icon: Sparkles,
      badge: conflictsCount > 0 ? `${conflictsCount} conflict` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    { 
      id: 'verification' as NavTab, 
      label: 'Verification', 
      icon: CheckCheck,
      badge: needsReviewCount > 0 ? `${needsReviewCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { id: 'settings' as NavTab, label: 'Settings & Privacy', icon: Settings },
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
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out no-print
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-tight">Med<span className="text-sky-400">Lens</span></span>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide leading-none">Clinical Intelligence</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Workflow
          </div>

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
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer
                  ${isActive 
                    ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

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
              </button>
            );
          })}
        </div>

        {/* Bottom Clinical Trust Badge */}
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
      </aside>
    </>
  );
};
