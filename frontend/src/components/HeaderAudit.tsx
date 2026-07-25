'use client';

import { useState, useCallback } from 'react';
import { auditHeaders } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HeaderAudit() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleAudit = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await auditHeaders(url.trim());
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Audit gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [url]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">HTTP Security Header Audit</h2>
        <p className="text-xs text-text-secondary">Audit keamanan header server web (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) & skor proteksi.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">URL Target Website</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleAudit}
            disabled={!url.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Mengaudit...' : 'Audit Header'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
      )}

      {status === 'success' && data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-white p-5">
            <div>
              <p className="text-xs text-text-muted">Target URL</p>
              <p className="font-mono text-sm font-bold text-black">{data.url}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Skor Keamanan</p>
              <span className={`inline-block rounded-lg px-3 py-1 text-sm font-black ${
                data.score === 'A+' || data.score === 'A' ? 'bg-black text-white' : 'bg-surface text-black border border-border'
              }`}>
                GRADE {data.score}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 text-xs font-bold text-black">🛡️ Audit Header Keamanan</h3>
            <div className="space-y-2">
              {data.securityAudit.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between rounded-lg bg-surface p-3 text-xs">
                  <div>
                    <span className="font-bold text-black block">{item.header}</span>
                    <span className="text-[11px] text-text-secondary">{item.description}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'pass' ? 'bg-black text-white' : item.status === 'warning' ? 'border border-border text-black' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status.toUpperCase()}
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
