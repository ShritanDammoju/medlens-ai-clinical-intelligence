import React from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  FileText, 
  FlaskConical, 
  Pill, 
  CheckCheck,
  User
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { LabTrendChart } from '../components/dashboard/LabTrendChart';
import { KeyObservationsCard } from '../components/dashboard/KeyObservationsCard';
import { LatestLabsCard } from '../components/dashboard/LatestLabsCard';
import { MedicationOverviewCard } from '../components/dashboard/MedicationOverviewCard';
import { RecentReportsCard } from '../components/dashboard/RecentReportsCard';
import { AISummaryCard } from '../components/dashboard/AISummaryCard';
import { NavTab } from '../components/layout/Sidebar';
import { LabResult } from '../types/medical';

interface Props {
  onNavigateTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigateTab, onOpenUpload }) => {
  const { currentPatient, state } = usePatient();

  const patientLabs = state.labs.filter((l: LabResult) => l.patientId === currentPatient?.id);
  const patientMeds = state.meds.filter((m) => m.patientId === currentPatient?.id);
  const patientReports = state.reports.filter((r) => r.patientId === currentPatient?.id);
  const needsReviewCount = patientLabs.filter((l: LabResult) => l.verificationStatus === 'needs_review').length;
  const abnormalCount = patientLabs.filter((l: LabResult) => l.status === 'LOW' || l.status === 'HIGH').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Patient Greeting & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Overview
            </h1>
            {currentPatient?.isDemo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Patient: <strong className="text-slate-800">{currentPatient?.name}</strong> � {currentPatient?.age} years � {currentPatient?.sex} � DOB: {currentPatient?.dob}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('patients')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-4 h-4 text-sky-600" />
            <span>Full Patient Record</span>
          </button>
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
      <AISummaryCard onViewInsights={() => onNavigateTab('insights')} />

      {/* Recharts Biomarker Trajectory */}
      <LabTrendChart />

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
    </div>
  );
};
