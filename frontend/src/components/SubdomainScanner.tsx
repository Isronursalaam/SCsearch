'use client';

import { useState, useCallback } from 'react';
import { scanSubdomains } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SubdomainScanner() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleScan = useCallback(async () => {
    if (!domain.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await scanSubdomains(domain.trim());
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Scan failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, [domain]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">Subdomain & Port Scanner</h2>
        <p className="text-xs text-text-secondary">Pindai subdomain aktif serta port jaringan umum (HTTP, HTTPS, SSH, FTP, DNS) dari target domain.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">Domain Target</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="target-example.com"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleScan}
            disabled={!domain.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Memindai...' : 'Pemindaian'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
      )}

      {status === 'success' && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-xs font-bold text-black">🌐 Subdomain Aktif ({data.subdomains.length})</h3>
            {data.subdomains.length > 0 ? (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {data.subdomains.map((sub: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center rounded-lg bg-surface p-2 text-xs font-mono">
                    <span className="text-black font-semibold truncate max-w-[60%]">{sub.subdomain}</span>
                    <span className="text-text-muted text-[10px]">{sub.ip || 'No IP'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">Tidak ditemukan subdomain publik umum yang aktif.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-xs font-bold text-black">🔌 Port Service Check</h3>
            <div className="space-y-1.5">
              {data.openPorts.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center rounded-lg bg-surface p-2 text-xs font-mono">
                  <span>Port {p.port} ({p.service})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'open' ? 'bg-black text-white' : 'border border-border text-text-muted'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
