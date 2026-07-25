'use client';

import { useState, useCallback } from 'react';
import { searchUsername } from '@/lib/api';

interface PlatformResult {
  platform: string;
  url: string;
  status: 'found' | 'not_found' | 'error';
  responseTime: number;
  icon: string;
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export default function UsernameSearch() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; found: number; notFound: number; errors: number } | null>(null);
  const [filter, setFilter] = useState<'all' | 'found' | 'not_found'>('all');

  const handleSearch = useCallback(async () => {
    if (!username.trim() || username.trim().length < 2) return;
    setError(null);
    setStatus('loading');
    setResults([]);
    setSummary(null);

    try {
      const data = await searchUsername(username.trim());
      if (data.success) {
        setResults(data.results || []);
        setSummary(data.summary || null);
        setStatus('success');
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, [username]);

  const filteredResults = results.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const resetSearch = () => {
    setStatus('idle');
    setError(null);
    setUsername('');
    setResults([]);
    setSummary(null);
    setFilter('all');
  };

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-black">
          Username & Social Recon
        </h2>
        <p className="text-sm text-text-secondary">
          Search for a username across 20+ social platforms to find matching profiles.
        </p>
      </div>

      {/* Search Input */}
      {(status === 'idle' || status === 'success' || status === 'error') && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-6">
          <label className="mb-3 block text-sm font-medium text-black">Username</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-text-muted">@</span>
              </div>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="johndoe"
                className="w-full rounded-xl border border-border py-3 pr-4 pl-9 text-sm text-black placeholder-text-muted transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!username.trim() || username.trim().length < 2}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Search
            </button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Enter a username to check across GitHub, Reddit, Instagram, Twitter/X, TikTok, and more.
          </p>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-border bg-white p-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-black" />
          <p className="text-sm font-medium text-black">Scanning platforms for &quot;{username}&quot;...</p>
          <p className="mt-1 text-xs text-text-muted">Checking 20+ social networks simultaneously</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={resetSearch}
            className="rounded-lg border border-red-300 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {status === 'success' && (
        <div className="space-y-4">
          {/* Summary Bar */}
          {summary && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-black">{summary.found}</p>
                  <p className="text-[10px] font-medium tracking-wide text-text-muted">FOUND</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-text-muted">{summary.notFound}</p>
                  <p className="text-[10px] font-medium tracking-wide text-text-muted">NOT FOUND</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-text-muted">{summary.errors}</p>
                  <p className="text-[10px] font-medium tracking-wide text-text-muted">ERRORS</p>
                </div>
              </div>
              <button
                onClick={resetSearch}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:border-black hover:text-black"
              >
                ← New Search
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {(['all', 'found', 'not_found'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200 ${
                  filter === f ? 'bg-black text-white shadow-sm' : 'text-text-secondary hover:text-black'
                }`}
              >
                {f === 'all' ? `All (${results.length})` : f === 'found' ? `Found (${results.filter(r => r.status === 'found').length})` : `Not Found (${results.filter(r => r.status === 'not_found').length})`}
              </button>
            ))}
          </div>

          {/* Platform Cards */}
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredResults.map((result, idx) => (
              <div
                key={`${result.platform}-${idx}`}
                className={`animate-fade-in-up flex items-center justify-between rounded-xl border p-4 transition-all duration-200 stagger-${Math.min(idx + 1, 6)} ${
                  result.status === 'found'
                    ? 'border-black bg-white hover:shadow-sm'
                    : result.status === 'error'
                    ? 'border-border bg-surface opacity-60'
                    : 'border-border bg-white opacity-50'
                }`}
                style={{ opacity: 0 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{result.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-black">{result.platform}</p>
                    <p className="text-[10px] text-text-muted">{result.responseTime}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.status === 'found' ? (
                    <>
                      <span className="rounded-full bg-black px-2.5 py-0.5 text-[10px] font-bold text-white">
                        FOUND
                      </span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-black hover:text-black"
                        title="Open profile"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    </>
                  ) : result.status === 'not_found' ? (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-text-muted">
                      NOT FOUND
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-text-muted">
                      TIMEOUT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
