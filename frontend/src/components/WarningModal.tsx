'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'scsearch_legal_agreed';

interface WarningModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function WarningModal({ forceOpen, onClose }: WarningModalProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      setFading(false);
    } else {
      const agreed = localStorage.getItem(STORAGE_KEY);
      if (!agreed) {
        setVisible(true);
      }
    }
  }, [forceOpen]);

  const handleAgree = () => {
    setFading(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      if (onClose) onClose();
    }, 250);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(153, 27, 27, 0.95)' }}
    >
      {/* Modal Card */}
      <div
        className={`animate-fade-in-scale w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl ${
          fading ? 'scale-95 opacity-0 transition-all duration-200' : ''
        }`}
      >
        {/* Warning Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 border-2 border-red-300">
            <svg
              className="h-7 w-7 text-red-700 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="mb-1 text-center text-lg font-black tracking-tight text-red-700 uppercase">
          ⚠️ PERINGATAN HUKUM & ETIKA OSINT
        </h2>
        <p className="mb-4 text-center text-xs font-semibold text-red-600">
          PERNYATAAN PENGGUNAAN SESUAI LEGALITAS
        </p>

        {/* Disclaimer Text */}
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-relaxed text-red-950 space-y-2">
          <p>
            Selamat datang di <strong>SCsearch</strong>. Platform ini menyediakan perkakas OSINT (Open Source Intelligence) yang <strong>HANYA BERIZIN</strong> untuk:
          </p>
          <ul className="ml-4 list-disc space-y-1 font-medium text-red-900">
            <li>Riset akademik, edukasi keamanan siber, dan jurnalistik etis.</li>
            <li>Pengujian penetrasi atau investigasi keamanan yang disetujui (Authorized).</li>
            <li>Tujuan hukum yang legal sesuai perundang-undangan cybercrime.</li>
          </ul>
          <div className="rounded-lg border border-red-300 bg-red-100 p-2.5 text-[11px] font-bold text-red-900">
            ⛔ DILARANG KERAS: Penguntitan (Stalking), Doxing, Pelecehan, Cybercrime, atau Akses Tanpa Izin. Pelanggaran tunduk pada hukum pidana ITE.
          </div>
        </div>

        {/* Agree Button */}
        <button
          id="warning-agree-btn"
          onClick={handleAgree}
          className="w-full cursor-pointer rounded-xl bg-red-700 px-6 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-red-800 active:scale-[0.98]"
        >
          SAYA SETUJU, PAHAM & PATUH HUKUM
        </button>

        {/* Footer */}
        <p className="mt-3 text-center text-[10px] text-red-500 font-mono">
          [ SCsearch Legal Compliance Engine ]
        </p>
      </div>
    </div>
  );
}
