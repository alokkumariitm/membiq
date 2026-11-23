import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Views
import HomeView from './views/HomeView';
import PlansView from './views/PlansView';
import DashboardView from './views/DashboardView';
import SuperAdminView from './views/SuperAdminView';

// Modals
import CopyrightModal from './components/modals/CopyrightModal';
import AddrexModal from './components/modals/AddrexModal';
import TermsModal from './components/modals/TermsModal';
import PrivacyModal from './components/modals/PrivacyModal';
import RefundModal from './components/modals/RefundModal';

// Global Styles
import './styles/variables.css';
import './styles/global.css';

export function AppContent() {
  const [activeView, setActiveView] = useState('home');

  // Modal Open States
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  const [isAddrexOpen, setIsAddrexOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  return (
    <>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="main-content">
        {activeView === 'home' && (
          <HomeView setActiveView={setActiveView} />
        )}
        {activeView === 'plans' && (
          <PlansView
            setActiveView={setActiveView}
            openTermsModal={() => setIsTermsOpen(true)}
            openRefundModal={() => setIsRefundOpen(true)}
          />
        )}
        {activeView === 'dashboard' && (
          <DashboardView setActiveView={setActiveView} />
        )}
        {activeView === 'superadmin' && (
          <SuperAdminView />
        )}
      </main>

      {/* Global Footer with interactive links */}
      <Footer
        openCopyrightModal={() => setIsCopyrightOpen(true)}
        openAddrexModal={() => setIsAddrexOpen(true)}
        openTermsModal={() => setIsTermsOpen(true)}
        openPrivacyModal={() => setIsPrivacyOpen(true)}
        openRefundModal={() => setIsRefundOpen(true)}
      />

      {/* Modals */}
      <CopyrightModal
        isOpen={isCopyrightOpen}
        onClose={() => setIsCopyrightOpen(false)}
      />
      <AddrexModal
        isOpen={isAddrexOpen}
        onClose={() => setIsAddrexOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <RefundModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
