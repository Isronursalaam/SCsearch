'use client';

import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenWarning: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'image-search', label: 'Image Recon' },
  { id: 'suncalc', label: 'GEOINT Sun' },
  { id: 'username', label: 'Username' },
  { id: 'domain', label: 'Domain/IP' },
  { id: 'email', label: 'Email Intel' },
  { id: 'threat', label: 'Threat Intel' },
  { id: 'phone', label: 'Phone Recon' },
  { id: 'subdomain', label: 'Subdomain' },
  { id: 'hash', label: 'Hash Tool' },
  { id: 'mac', label: 'MAC Vendor' },
  { id: 'headers', label: 'Header Audit' },
  { id: 'encoding', label: 'Encoder' },
];

export default function Navbar({ activeSection, onNavigate, onOpenWarning }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Minimalist Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-black">
            <span className="text-xs font-bold text-white">SC</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-black">
            SCsearch
          </span>
          <span className="rounded border border-border px-1.5 py-0.2 text-[9px] font-semibold text-text-muted">
            OSINT
          </span>
        </button>

        {/* Minimalist Desktop Nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                activeSection === item.id
                  ? 'bg-black text-white'
                  : 'text-text-secondary hover:bg-surface hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Legal Warning Badge Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWarning}
            className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 transition-all hover:bg-red-600 hover:text-white"
            title="Lihat Peringatan Hukum & Etika"
          >
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span>Peringatan Legal</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded border border-border xl:hidden"
            aria-label="Toggle navigation"
          >
            <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-white px-4 py-3 xl:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`rounded-md px-3 py-2 text-left text-xs font-semibold ${
                  activeSection === item.id
                    ? 'bg-black text-white'
                    : 'bg-surface text-text-secondary hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
