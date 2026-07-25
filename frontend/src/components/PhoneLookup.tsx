'use client';

import { useState, useCallback } from 'react';
import { lookupPhone } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PhoneLookup() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleSearch = useCallback(async () => {
    if (!phone.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await lookupPhone(phone.trim());
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Lookup failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, [phone]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">Phone Recon & Carrier Lookup</h2>
        <p className="text-xs text-text-secondary">Analisis nomor telepon, negara, operator seluler (carrier), serta tautan WhatsApp & Telegram direct.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">Nomor Telepon</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="+6281234567890 atau 08123456789"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!phone.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Proses...' : 'Analisis'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
      )}

      {status === 'success' && data && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5 space-y-2.5">
            <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
              <span className="text-text-muted">Nomor Input</span>
              <span className="font-mono font-bold text-black">{data.phoneNumber}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
              <span className="text-text-muted">Format E.164</span>
              <span className="font-mono font-semibold text-black">{data.formattedE164}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
              <span className="text-text-muted">Negara / Wilayah</span>
              <span className="font-semibold text-black">{data.countryName || 'Tidak Diketahui'} ({data.countryCode || '-'})</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
              <span className="text-text-muted">Operator (Carrier)</span>
              <span className="font-semibold text-black">{data.carrier || 'Umum / Tidak Terdeteksi'}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
              <span className="text-text-muted">Tipe Saluran</span>
              <span className="font-semibold text-black">{data.lineType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={data.whatsAppStatus.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white p-3 text-xs font-semibold text-black hover:border-black"
            >
              <span>💬 WhatsApp Chat</span>
              <span className="text-[10px] text-text-muted">↗</span>
            </a>
            <a
              href={data.possibleTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white p-3 text-xs font-semibold text-black hover:border-black"
            >
              <span>✈️ Telegram Profile</span>
              <span className="text-[10px] text-text-muted">↗</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
