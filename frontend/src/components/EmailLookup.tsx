'use client';

import { useState, useCallback } from 'react';
import { lookupEmail } from '@/lib/api';

type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EmailLookup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleSearch = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await lookupEmail(email.trim());
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
  }, [email]);

  const resetSearch = () => {
    setStatus('idle');
    setError(null);
    setEmail('');
    setData(null);
  };

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-black">
          Email Intelligence
        </h2>
        <p className="text-sm text-text-secondary">
          Analyze an email address — validate MX records, detect disposable providers, check breach history, and find associated profiles.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <label className="mb-3 block text-sm font-medium text-black">Email Address</label>
        <div className="flex gap-3">
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="user@example.com"
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-black placeholder-text-muted transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!email.trim() || !email.includes('@') || status === 'loading'}
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {status === 'loading' ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-border bg-white p-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-black" />
          <p className="text-sm font-medium text-black">Analyzing &quot;{email}&quot;...</p>
          <p className="mt-1 text-xs text-text-muted">Checking MX records, breach databases, and providers</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 text-sm font-medium text-red-700">{error}</p>
          <button onClick={resetSearch} className="rounded-lg border border-red-300 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100">
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {status === 'success' && data && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">
              Results for <strong className="text-black">{data.email}</strong>
            </p>
            <button onClick={resetSearch} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:border-black hover:text-black">
              ← New Lookup
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Email Validation */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold tracking-tight text-black">📧 Email Analysis</h3>
              <div className="space-y-2.5">
                <InfoRow label="Email" value={data.email} mono />
                <InfoRow label="Username" value={data.username} mono />
                <InfoRow label="Domain" value={data.domain} mono />
                <InfoRow label="Valid Format" value={data.isValid ? '✅ Yes' : '❌ No'} />
                <InfoRow label="Has MX Records" value={data.hasMxRecords ? '✅ Yes' : '❌ No'} />
                <InfoRow label="Provider" value={data.providerName || 'Custom / Unknown'} />
                <InfoRow label="Free Provider" value={data.isFreeProvider ? 'Yes' : 'No'} />
                <InfoRow
                  label="Disposable"
                  value={data.isDisposable ? '⚠️ Yes — Disposable email detected' : '✅ No'}
                  highlight={data.isDisposable}
                />
              </div>
            </div>

            {/* MX Records */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold tracking-tight text-black">🌐 MX Records</h3>
              {data.mxRecords?.length > 0 ? (
                <div className="space-y-1.5">
                  {data.mxRecords.map((mx: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                      <span className="font-mono text-xs text-black">{mx.exchange}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted">
                        Priority: {mx.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-text-muted">No MX records found for this domain.</p>
              )}
            </div>

            {/* Breach Info */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold tracking-tight text-black">🔓 Breach Check</h3>
              {data.breachInfo?.found ? (
                <div>
                  <div className="mb-3 rounded-xl bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">
                      ⚠ Found in {data.breachInfo.count} known breach{data.breachInfo.count !== 1 ? 'es' : ''}
                    </p>
                    <p className="mt-0.5 text-[10px] text-red-600">
                      (Simulated results — connect HIBP API for real data)
                    </p>
                  </div>
                  <div className="space-y-2">
                    {data.breachInfo.breaches.map((breach: any, i: number) => (
                      <div key={i} className="rounded-xl border border-border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-bold text-black">{breach.name}</p>
                          <span className="text-[10px] text-text-muted">{breach.date}</span>
                        </div>
                        <p className="mb-2 text-[11px] leading-relaxed text-text-secondary">
                          {breach.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {breach.dataTypes.map((dt: string, j: number) => (
                            <span key={j} className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              {dt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-surface p-4 text-center">
                  <p className="text-xs font-medium text-black">✅ No known breaches found</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">(Simulated — connect HIBP API for real data)</p>
                </div>
              )}
            </div>

            {/* Associated Profiles */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold tracking-tight text-black">👤 Possible Profiles</h3>
              {data.socialProfiles?.length > 0 ? (
                <div className="space-y-1.5">
                  {data.socialProfiles.map((profile: any, i: number) => (
                    <a
                      key={i}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-lg border border-border p-2.5 transition-all hover:border-black"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{profile.icon}</span>
                        <span className="text-xs font-medium text-black">{profile.platform}</span>
                      </div>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted">
                        {profile.status}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-text-muted">No associated profiles detected.</p>
              )}
              <p className="mt-3 text-[10px] text-text-muted">
                Profiles marked as &quot;possible&quot; are inferred from the username and require manual verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span
        className={`max-w-[60%] truncate text-right text-xs font-medium ${
          highlight ? 'text-red-600' : 'text-black'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
