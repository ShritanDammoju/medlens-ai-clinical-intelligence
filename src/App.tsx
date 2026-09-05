import React, { useState } from 'react';
import { PatientProvider, usePatient } from './context/PatientContext';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { MedicationsPage } from './pages/MedicationsPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StructuredPatientRecord } from './components/records/StructuredPatientRecord';
import { VerificationCenter } from './components/verification/VerificationCenter';
import { AIInsightsView } from './components/insights/AIInsightsView';
import { PatientTimeline } from './components/timeline/PatientTimeline';
import { ReportComparison } from './components/comparison/ReportComparison';
import { PrintablePatientSummary } from './components/export/PrintablePatientSummary';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { SafetyBanner } from './components/common/SafetyBanner';
import { SourceModal } from './components/common/SourceModal';
import { ReportUploadModal } from './components/reports/ReportUploadModal';
import { PatientIntakeModal } from './components/intake/PatientIntakeModal';
import { MedLensChatbot } from './components/chat/MedLensChatbot';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { loadDemoPatient, isReviewingExternalPatient } = usePatient();
  const { userProfile, role, isDemoMode, exitDemoMode, openAuthModal } = useAuth();
  
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    return role === 'doctor' ? 'doctor_portal' : 'overview';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const handleLaunchDemo = () => {
    loadDemoPatient();
    setCurrentTab('overview');
    setViewMode('app');
  };

  const handleEnterApp = () => {
    if (!userProfile && !isDemoMode) {
      openAuthModal('patient');
      return;
    }
    if (role === 'doctor') {
      setCurrentTab('doctor_portal');
    } else {
      setCurrentTab('overview');
    }
    setViewMode('app');
  };

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={handleEnterApp}
          onLaunchDemo={handleLaunchDemo}
        />
        <AuthModal />
      </>
    );
  }

  const renderTabContent = () => {
    // If doctor navigates to doctor portal
    if (currentTab === 'doctor_portal') {
      return <DoctorDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }

    switch (currentTab) {
      case 'overview':
        // If doctor without active patient inspection, show Doctor Dashboard
        if (role === 'doctor' && !isReviewingExternalPatient && !isDemoMode) {
          return <DoctorDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
        }
        return (
          <DashboardPage
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenIntake={() => setIsIntakeOpen(true)}
          />
        );
      case 'patients':
        return (
          <StructuredPatientRecord
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onUploadClick={() => setIsUploadOpen(true)}
          />
        );
      case 'reports':
        return <ReportsPage onOpenUpload={() => setIsUploadOpen(true)} />;
      case 'medications':
        return <MedicationsPage />;
      case 'labs':
        return <LabResultsPage />;
      case 'comparison':
        return <ReportComparison />;
      case 'timeline':
        return <PatientTimeline />;
      case 'insights':
        return <AIInsightsView />;
      case 'verification':
        return <VerificationCenter />;
      case 'settings':
        return <SettingsPage />;
      case 'export':
        return <PrintablePatientSummary onBack={() => setCurrentTab(role === 'doctor' ? 'doctor_portal' : 'overview')} />;
      default:
        return (
          <DashboardPage
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenIntake={() => setIsIntakeOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Persistent Amber Demo Banner (ONLY when demo mode is active) */}
      {isDemoMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold shadow-xs border-b border-amber-500 z-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                DEMO MODE ACTIVE
              </span>
              <span>Viewing simulated Alex Carter clinical records. Actions are in-memory and not persisted to a real clinical account.</span>
            </div>
            <button
              onClick={() => {
                exitDemoMode();
                setViewMode('landing');
              }}
              className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
            >
              Exit Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Top Persistent Safety Banner */}
      <SafetyBanner />

      {/* Main Layout Shell */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Area with Offset for Sidebar */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Sticky Navigation Bar */}
          <Navbar
            onOpenIntake={() => setIsIntakeOpen(true)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            onNavigateToExport={() => setCurrentTab('export')}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderTabContent()}
          </main>

          {/* Application Footer */}
          <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>MedLens — AI-Powered Clinical Information Intelligence</span>
              <span>All reference intervals verified against source laboratory documentation.</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Floating AI Chatbot */}
      <MedLensChatbot />

      {/* Global Modals */}
      <SourceModal />
      <AuthModal />

      <ReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setCurrentTab('verification')}
      />

      <PatientIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSuccess={() => setCurrentTab('patients')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppContent />
      </PatientProvider>
    </AuthProvider>
  );
}
