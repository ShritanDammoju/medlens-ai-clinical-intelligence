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
  ArrowRight
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

  const isRealAccountEmpty = !currentPatient?.isDemo && patientReports.length === 0 && patientLabs.length === 0;

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
              Clinical Overview
            </h1>
            {currentPatient?.isDemo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                Demo Dataset
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Patient: <strong className="text-slate-800">{currentPatient?.name || userProfile?.displayName || 'Clinical User'}</strong> • {currentPatient?.age || 32} years • {currentPatient?.sex || 'Female'} • ID: <code className="text-xs font-mono">{currentPatient?.id?.substring(0, 12)}...</code>
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

      {/* Real Account Empty State Onboarding: 5-Step Clinical Workflow */}
      {isRealAccountEmpty && (
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-sky-800/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Guided Onboarding • What Should I Do Next?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {userProfile?.displayName || 'Patient'}! Your Clinical Intelligence Workspace is ready.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              MedLens transforms your scattered diagnostic reports into an organized, reference-range-verified patient record. Follow these 5 clear steps to build your verified clinical baseline:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Step 1</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Profile & Intake</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Document baseline symptoms, allergies, and active medications.
                </p>
              </div>
              <button
                onClick={() => onOpenIntake ? onOpenIntake() : onNavigateTab('patients')}
                className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Start Intake</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Step 2</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Upload Report</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Upload PDF, PNG, JPG, or paste text to run the 10-stage OCR engine.
                </p>
              </div>
              <button
                onClick={onOpenUpload}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider">Step 3</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Review Extraction</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Inspect extracted lab tests, units, and source-printed reference ranges.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('labs')}
                className="w-full py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Inspect Labs</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Step 4</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Verify Record</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Confirm accuracy, resolve discrepancies, and verify observations.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('verification')}
                className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Verify</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Step 5</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Connect Doctor</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Enter physician code (<code className="text-sky-300 font-mono">MED-XXXXXX</code>) to authorize review.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full py-2 rounded-xl border border-white/30 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Stethoscope className="w-3 h-3" />
                <span>Doctor Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Connected Clinicians Card for sovereign patient access management */}
      <ConnectedDoctorsCard />
    </div>
  );
};
