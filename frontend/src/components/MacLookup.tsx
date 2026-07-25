'use client';

import { useState, useCallback } from 'react';
import { lookupMacAddress } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MacLookup() {
  const [mac, setMac] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleLookup = useCallback(async () => {
    if (!mac.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await lookupMacAddress(mac.trim());
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Lookup MAC gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [mac]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">MAC Address Vendor Lookup (OUI)</h2>
        <p className="text-xs text-text-secondary">Identifikasi produsen perangkat keras jaringan (Apple, Cisco, Samsung, Raspberry Pi) dari OUI alamat MAC.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">Alamat MAC (MAC Address)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="00:1A:2B:3C:4D:5E atau B8-27-EB-00-00-00"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-mono text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleLookup}
            disabled={!mac.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Mencari...' : 'Cari Vendor'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
      )}

      {status === 'success' && data && (
        <div className="rounded-xl border border-border bg-white p-5 space-y-3">
          <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
            <span className="text-text-muted">Produsen / Vendor Perangkat</span>
            <span className="font-bold text-black">{data.vendor}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
            <span className="text-text-muted">Normalized MAC</span>
            <span className="font-mono font-semibold text-black">{data.normalizedMac}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
            <span className="text-text-muted">Awalan OUI Prefix</span>
            <span className="font-mono font-semibold text-black">{data.ouiPrefix}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
            <span className="text-text-muted">Tipe Transmisi</span>
            <span className="font-semibold text-black">{data.isMulticast ? 'Multicast' : 'Unicast'}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
            <span className="text-text-muted">Tipe Alamat</span>
            <span className="font-semibold text-black">{data.isLocalAddress ? 'Locally Administered (LAA)' : 'Globally Unique (BAA)'}</span>
          </div>
        </div>
      )}
    </section>
  );
}
