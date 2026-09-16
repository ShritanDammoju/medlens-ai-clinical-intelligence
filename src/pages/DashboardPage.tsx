import React from 'react';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../firebase/AuthContext';
import { 
  FileText, 
  FlaskConical, 
  Pill, 
  CheckCheck,
  User,
  Upload,
  UserPlus,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Clock,
  Bot,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { LabTrendChart } from '../components/dashboard/LabTrendChart';
import { KeyObservationsCard } from '../components/dashboard/KeyObservationsCard';
import { LatestLabsCard } from '../components/dashboard/LatestLabsCard';
import { MedicationOverviewCard } from '../components/dashboard/MedicationOverviewCard';
import { RecentReportsCard } from '../components/dashboard/RecentReportsCard';
import { AISummaryCard } from '../components/dashboard/AISummaryCard';
import { ConnectedDoctorsCard } from '../components/patient/ConnectedDoctorsCard';
import { NavTab } from '../components/layout/Sidebar';
import { LabResult } from '../types/medical';

interface Props {
  onNavigateTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenIntake?: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigateTab, onOpenUpload, onOpenIntake }) => {
  const { currentPatient, state, isReviewingExternalPatient, exitPatientReview } = usePatient();
  const { userProfile, role } = useAuth();

  const patientLabs = state.labs.filter((l: LabResult) => l.patientId === currentPatient?.id);
  const patientMeds = state.meds.filter((m) => m.patientId === currentPatient?.id);
  const patientReports = state.reports.filter((r) => r.patientId === currentPatient?.id);
  const needsReviewCount = patientLabs.filter((l: LabResult) => l.verificationStatus === 'needs_review').length;
  const abnormalCount = patientLabs.filter((l: LabResult) => l.status === 'LOW' || l.status === 'HIGH').length;

  const isAccountEmpty = patientReports.length === 0 && patientLabs.length === 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentPatient?.name || userProfile?.displayName || 'there';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Reviewing External Patient Banner (for Clinicians) */}
      {isReviewingExternalPatient && (
        <div className="p-4 rounded-2xl bg-sky-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Reviewing Patient: {currentPatient?.name}</div>
              <div className="text-xs text-sky-200">You are reviewing this patient's clinical records. Modifications will be logged under your reviewer identity.</div>
            </div>
          </div>
          <button
            onClick={() => {
              exitPatientReview();
              onNavigateTab('doctor_portal');
            }}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Return to Doctor Dashboard
          </button>
        </div>
      )}

      {/* Patient Greeting & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Patient: <strong className="text-slate-800">{displayName}</strong> • {currentPatient?.age || 30} years • {currentPatient?.sex || 'Female'} • ID: <code className="text-xs font-mono">{currentPatient?.id?.substring(0, 12)}...</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenIntake && (
            <button
              onClick={onOpenIntake}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Update Intake</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('patients')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-4 h-4 text-sky-600" />
            <span>Full Patient Record</span>
          </button>
        </div>
      </div>

      {/* Real Account Empty State Onboarding */}
      {isAccountEmpty && (
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-sky-800/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Getting Started</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              No medical reports yet. Upload your first report to begin building your structured clinical record.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              MedLens unifies fragmented diagnostic reports into an organized, reference-range-verified patient record.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenUpload}
              className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-extrabold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Your First Diagnostic Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Role-Aware Patient Recommendations (6 Recommended Next Steps) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Recommended Next Steps</h2>
              <p className="text-xs text-slate-500">Actions to maintain a comprehensive and verified health record</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Action 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <UserPlus className="w-4 h-4" />
                <span>1. Complete Clinical Intake</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Document your baseline symptoms, existing conditions, known allergies, and active medications.
              </p>
            </div>
            <button
              onClick={() => onOpenIntake ? onOpenIntake() : onNavigateTab('profile')}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{userProfile?.onboardingCompleted ? 'Update Profile' : 'Start Intake'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* Action 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <Upload className="w-4 h-4" />
                <span>2. Upload Medical Report</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add PDF lab results, imaging summaries, or clinical letters to extract structured biomarkers.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Upload Document</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* Action 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <FlaskConical className="w-4 h-4" />
                <span>3. Review Extracted Biomarkers</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect extracted test parameters, units, and laboratory-printed reference ranges.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('labs')}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Lab Results</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* Action 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <Stethoscope className="w-4 h-4" />
                <span>4. Connect with your Doctor</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your physician's Doctor Code to authorize secure clinical record review.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Enter Doctor Code</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* Action 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <Clock className="w-4 h-4" />
                <span>5. Review Health Timeline</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track chronological changes, diagnostic dates, and medication history in a unified stream.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Open Timeline</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* Action 6 */}
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                <Bot className="w-4 h-4" />
                <span>6. Ask MedLens Assistant</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use Gemini 3.8 Flash to synthesize reports, explain terminology, and reference source documents.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('insights')}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore AI Insights</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Reports"
          value={patientReports.length}
          subtitle="Processed clinical files"
          icon={FileText}
          colorScheme="sky"
          onClick={() => onNavigateTab('reports')}
        />
        <StatCard
          title="Lab Tests"
          value={patientLabs.length}
          subtitle={`${abnormalCount} outside source limits`}
          icon={FlaskConical}
          colorScheme="emerald"
          badge={abnormalCount > 0 ? `${abnormalCount} Flagged` : undefined}
          onClick={() => onNavigateTab('labs')}
        />
        <StatCard
          title="Medications"
          value={patientMeds.length}
          subtitle="Active documented therapies"
          icon={Pill}
          colorScheme="amber"
          onClick={() => onNavigateTab('medications')}
        />
        <StatCard
          title="Needs Verification"
          value={needsReviewCount}
          subtitle="Awaiting clinician review"
          icon={CheckCheck}
          colorScheme="rose"
          badge={needsReviewCount > 0 ? "Pending" : undefined}
          onClick={() => onNavigateTab('verification')}
        />
      </div>

      {/* AI Summary Highlight */}
      {patientLabs.length > 0 && (
        <AISummaryCard onViewInsights={() => onNavigateTab('insights')} />
      )}

      {/* Recharts Biomarker Trajectory */}
      {patientLabs.length > 0 && (
        <LabTrendChart />
      )}

      {/* Main Grid: Latest Labs & Medication Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatestLabsCard onViewAll={() => onNavigateTab('labs')} />
        </div>
        <div>
          <MedicationOverviewCard onViewAll={() => onNavigateTab('medications')} />
        </div>
      </div>

      {/* Secondary Grid: Observations & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyObservationsCard onViewAll={() => onNavigateTab('patients')} />
        <RecentReportsCard
          onUploadClick={onOpenUpload}
          onViewAll={() => onNavigateTab('reports')}
        />
      </div>

      {/* Connected Clinicians Card */}
      <ConnectedDoctorsCard />
    </div>
  );
};
