import React, { useState } from 'react';
import { PatientProvider, usePatient } from './context/PatientContext';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { MedicationsPage } from './pages/MedicationsPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
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
import { PatientOnboardingModal } from './components/onboarding/PatientOnboardingModal';
import { DoctorOnboardingModal } from './components/onboarding/DoctorOnboardingModal';
import { MedLensChatbot } from './components/chat/MedLensChatbot';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { isReviewingExternalPatient } = usePatient();
  const { userProfile, role, openAuthModal } = useAuth();
  
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    return userProfile ? 'app' : 'landing';
  });
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    return role === 'doctor' ? 'doctor_portal' : 'overview';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('medlens_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('medlens_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Automatically switch between landing and authenticated app based on session
  React.useEffect(() => {
    if (userProfile) {
      setViewMode('app');
      if (role === 'doctor' && !isReviewingExternalPatient && currentTab !== 'profile' && currentTab !== 'settings') {
        setCurrentTab('doctor_portal');
      }
    } else {
      setViewMode('landing');
    }
  }, [userProfile, role, isReviewingExternalPatient]);

  const handleEnterApp = () => {
    if (!userProfile) {
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
        />
        <AuthModal />
      </>
    );
  }

  const renderTabContent = () => {
    if (currentTab === 'profile') {
      return <ProfilePage />;
    }

    // If doctor navigates to doctor portal
    if (currentTab === 'doctor_portal') {
      return <DoctorDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }

    switch (currentTab) {
      case 'overview':
        // If doctor without active patient inspection, show Doctor Dashboard
        if (role === 'doctor' && !isReviewingExternalPatient) {
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
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
        />

        {/* Content Area with Offset for Sidebar */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} min-w-0`}>
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

      {/* Mandatory Onboarding Modals */}
      {userProfile && role === 'patient' && !userProfile.onboardingCompleted && (
        <PatientOnboardingModal isOpen={true} />
      )}
      {userProfile && role === 'doctor' && !userProfile.onboardingCompleted && (
        <DoctorOnboardingModal isOpen={true} />
      )}

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
