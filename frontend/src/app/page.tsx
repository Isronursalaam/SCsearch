'use client';

import { useState } from 'react';
import WarningModal from '@/components/WarningModal';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import ReverseImageSearch from '@/components/ReverseImageSearch';
import UsernameSearch from '@/components/UsernameSearch';
import DomainLookup from '@/components/DomainLookup';
import EmailLookup from '@/components/EmailLookup';
import PhoneLookup from '@/components/PhoneLookup';
import SubdomainScanner from '@/components/SubdomainScanner';
import HashAnalyzer from '@/components/HashAnalyzer';
import MacLookup from '@/components/MacLookup';
import HeaderAudit from '@/components/HeaderAudit';
import EncodingTool from '@/components/EncodingTool';
import ThreatReputation from '@/components/ThreatReputation';
import SunCalc from '@/components/SunCalc';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Legal Warning Modal (Auto on first visit + manual trigger) */}
      <WarningModal
        forceOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      />

      {/* Navbar with Legal Warning Badge */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenWarning={() => setShowWarningModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pt-20 pb-12 bg-white">
        {activeSection === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {activeSection === 'image-search' && <ReverseImageSearch />}
        {activeSection === 'suncalc' && <SunCalc />}
        {activeSection === 'username' && <UsernameSearch />}
        {activeSection === 'domain' && <DomainLookup />}
        {activeSection === 'email' && <EmailLookup />}
        {activeSection === 'threat' && <ThreatReputation />}
        {activeSection === 'phone' && <PhoneLookup />}
        {activeSection === 'subdomain' && <SubdomainScanner />}
        {activeSection === 'hash' && <HashAnalyzer />}
        {activeSection === 'mac' && <MacLookup />}
        {activeSection === 'headers' && <HeaderAudit />}
        {activeSection === 'encoding' && <EncodingTool />}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-border bg-white px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-black">
              <span className="text-[7px] font-bold text-white">SC</span>
            </div>
            <span className="text-[11px] font-medium text-text-muted">
              SCsearch — GEOINT & OSINT Intelligence Dashboard
            </span>
          </div>
          <button
            onClick={() => setShowWarningModal(true)}
            className="text-[10px] font-semibold text-red-600 hover:underline"
          >
            ⚠️ Peringatan Legalitas & Etika
          </button>
        </div>
      </footer>
    </>
  );
}
