'use client';

import { useState, useCallback } from 'react';
import { analyzeReputation } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ThreatReputation() {
  const [inputStr, setInputStr] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleAnalyze = useCallback(async () => {
    if (!inputStr.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await analyzeReputation(inputStr.trim());
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Analisis reputasi gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [inputStr]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">Reputasi Infrastruktur & Threat Intelligence</h2>
        <p className="text-xs text-text-secondary">Analisis pasif reputasi domain, IP, URL, dan sampel berkas/hash tanpa menyentuh atau mengakses target secara langsung.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">Domain, IP, URL, atau Hash Berkas</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="example.com, 1.1.1.1, https://bad-site.org, atau hash MD5/SHA256"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-mono text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={!inputStr.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Menganalisis...' : 'Analisis Reputasi'}
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
              <span className="rounded border border-border px-2 py-0.5 text-[9px] font-mono font-bold text-text-muted uppercase">
                {data.targetType} REPUTATION
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-black">{data.target}</p>
              <p className="text-[11px] text-text-secondary">{data.category}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Skor Risiko</p>
              <span className={`inline-block rounded-lg px-3 py-1 text-sm font-black ${
                data.riskScore >= 50 ? 'bg-red-700 text-white' : data.riskScore >= 20 ? 'border border-border text-black' : 'bg-black text-white'
              }`}>
                {data.riskScore}/100 ({data.riskLevel.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5 space-y-3">
            <h3 className="text-xs font-bold text-black">🌐 Detail Infrastruktur Pasif</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-surface p-3">
                <span className="text-[10px] text-text-muted block">Provider / Hosting ASN</span>
                <span className="font-semibold text-black">{data.details.hostingProvider} ({data.details.asn})</span>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <span className="text-[10px] text-text-muted block">Status Blacklist</span>
                <span className={`font-bold ${data.details.isBlacklisted ? 'text-red-600' : 'text-black'}`}>
                  {data.details.isBlacklisted ? '⚠️ Terdaftar dalam Blacklist' : '✅ Tidak Terdaftar Blacklist'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 text-xs font-bold text-black">🛡️ Hasil Pemeriksaan Threat Feed Engine ({data.threatFeedMatches.length})</h3>
            <div className="space-y-1.5">
              {data.threatFeedMatches.map((feed: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center rounded-lg bg-surface p-2.5 text-xs">
                  <div>
                    <span className="font-semibold text-black block">{feed.engine}</span>
                    <span className="text-[10px] text-text-muted">{feed.category}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    feed.status === 'Clean' ? 'bg-black text-white' : 'bg-red-700 text-white'
                  }`}>
                    {feed.status.toUpperCase()}
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
