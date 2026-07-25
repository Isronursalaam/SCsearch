'use client';

import { useState, useCallback } from 'react';
import { lookupDomain } from '@/lib/api';

type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DomainLookup() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'whois' | 'dns' | 'geoip'>('whois');

  const handleSearch = useCallback(async () => {
    if (!domain.trim() || domain.trim().length < 3) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await lookupDomain(domain.trim());
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
  }, [domain]);

  const resetSearch = () => {
    setStatus('idle');
    setError(null);
    setDomain('');
    setData(null);
    setActiveTab('whois');
  };

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-black">
          Domain & IP Lookup
        </h2>
        <p className="text-sm text-text-secondary">
          Investigate any domain or IP address — WHOIS records, DNS configuration, and geolocation.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <label className="mb-3 block text-sm font-medium text-black">Domain or IP Address</label>
        <div className="flex gap-3">
          <input
            id="domain-input"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="example.com or 8.8.8.8"
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-black placeholder-text-muted transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!domain.trim() || domain.trim().length < 3 || status === 'loading'}
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {status === 'loading' ? 'Searching...' : 'Lookup'}
          </button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Enter a domain name (google.com) or IP address (1.1.1.1) for a full investigation.
        </p>
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-border bg-white p-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-black" />
          <p className="text-sm font-medium text-black">Investigating &quot;{domain}&quot;...</p>
          <p className="mt-1 text-xs text-text-muted">Running WHOIS, DNS, and GeoIP queries</p>
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
              Results for <strong className="text-black">{data.domain}</strong>
            </p>
            <button onClick={resetSearch} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:border-black hover:text-black">
              ← New Lookup
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {(['whois', 'dns', 'geoip'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all duration-200 ${
                  activeTab === tab ? 'bg-black text-white shadow-sm' : 'text-text-secondary hover:text-black'
                }`}
              >
                {tab === 'whois' ? '📋 WHOIS' : tab === 'dns' ? '🌐 DNS Records' : '📍 GeoIP'}
              </button>
            ))}
          </div>

          {/* WHOIS Tab */}
          {activeTab === 'whois' && (
            <div className="animate-fade-in rounded-2xl border border-border bg-white p-6">
              {data.whois ? (
                <div className="space-y-3">
                  <InfoRow label="Domain Name" value={data.whois.domainName} />
                  <InfoRow label="Registrar" value={data.whois.registrar} />
                  <InfoRow label="Creation Date" value={data.whois.creationDate} />
                  <InfoRow label="Expiration Date" value={data.whois.expirationDate} />
                  <InfoRow label="Updated Date" value={data.whois.updatedDate} />
                  <InfoRow label="DNSSEC" value={data.whois.dnssec} />
                  {data.whois.nameServers?.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="mb-2 text-xs font-medium text-text-muted">Name Servers</p>
                      <div className="space-y-1">
                        {data.whois.nameServers.map((ns: string, i: number) => (
                          <p key={i} className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs text-black">
                            {ns}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.whois.status?.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="mb-2 text-xs font-medium text-text-muted">Status</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.whois.status.map((s: string, i: number) => (
                          <span key={i} className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                            {s.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-text-muted">No WHOIS data available for this query.</p>
              )}
            </div>
          )}

          {/* DNS Tab */}
          {activeTab === 'dns' && (
            <div className="animate-fade-in rounded-2xl border border-border bg-white p-6">
              {data.dns ? (
                <div className="space-y-4">
                  {data.dns.a?.length > 0 && (
                    <DnsSection title="A Records (IPv4)" records={data.dns.a.map((r: string) => r)} />
                  )}
                  {data.dns.aaaa?.length > 0 && (
                    <DnsSection title="AAAA Records (IPv6)" records={data.dns.aaaa.map((r: string) => r)} />
                  )}
                  {data.dns.mx?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-text-muted">MX Records (Mail)</p>
                      <div className="space-y-1">
                        {data.dns.mx.map((r: any, i: number) => (
                          <p key={i} className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs text-black">
                            <span className="text-text-muted">Priority {r.priority}:</span> {r.exchange}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.dns.ns?.length > 0 && (
                    <DnsSection title="NS Records (Nameservers)" records={data.dns.ns} />
                  )}
                  {data.dns.txt?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-text-muted">TXT Records</p>
                      <div className="space-y-1">
                        {data.dns.txt.map((r: string, i: number) => (
                          <p key={i} className="break-all rounded-lg bg-surface px-3 py-1.5 font-mono text-[11px] text-black">
                            {r}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.dns.cname?.length > 0 && (
                    <DnsSection title="CNAME Records" records={data.dns.cname} />
                  )}
                  {data.dns.soa && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-text-muted">SOA Record</p>
                      <div className="rounded-lg bg-surface p-3 font-mono text-xs text-black">
                        <p>Primary NS: {data.dns.soa.nsname}</p>
                        <p>Admin: {data.dns.soa.hostmaster}</p>
                        <p>Serial: {data.dns.soa.serial}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-text-muted">No DNS records found.</p>
              )}
            </div>
          )}

          {/* GeoIP Tab */}
          {activeTab === 'geoip' && (
            <div className="animate-fade-in rounded-2xl border border-border bg-white p-6">
              {data.geoip ? (
                <div className="space-y-3">
                  <InfoRow label="IP Address" value={data.geoip.ip} mono />
                  <InfoRow label="Country" value={data.geoip.country ? `${data.geoip.country} (${data.geoip.countryCode})` : null} />
                  <InfoRow label="Region" value={data.geoip.regionName} />
                  <InfoRow label="City" value={data.geoip.city} />
                  <InfoRow label="ZIP Code" value={data.geoip.zip} />
                  <InfoRow label="Timezone" value={data.geoip.timezone} />
                  <InfoRow label="ISP" value={data.geoip.isp} />
                  <InfoRow label="Organization" value={data.geoip.org} />
                  <InfoRow label="AS" value={data.geoip.as} />
                  {data.geoip.lat != null && data.geoip.lon != null && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="mb-2 text-xs font-medium text-text-muted">Coordinates</p>
                      <a
                        href={`https://maps.google.com/?q=${data.geoip.lat},${data.geoip.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-2 font-mono text-xs text-black transition-colors hover:bg-surface-hover"
                      >
                        📍 {data.geoip.lat.toFixed(4)}, {data.geoip.lon.toFixed(4)}
                        <span className="text-text-muted">→ Open in Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-text-muted">No geolocation data available.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Helper Components ───

function InfoRow({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span className={`max-w-[65%] truncate text-right text-xs font-medium text-black ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function DnsSection({ title, records }: { title: string; records: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-wide text-text-muted">{title}</p>
      <div className="space-y-1">
        {records.map((r, i) => (
          <p key={i} className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs text-black">{r}</p>
        ))}
      </div>
    </div>
  );
}
