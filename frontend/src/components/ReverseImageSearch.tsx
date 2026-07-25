'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadImage, searchByUrl } from '@/lib/api';
import type { ImageMetadata, ImageSearchResult } from '@/types';

type SearchMode = 'upload' | 'url';
type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ReverseImageSearch() {
  const [mode, setMode] = useState<SearchMode>('upload');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ImageSearchResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setStatus('loading');
    setMetadata(null);
    setResults([]);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const data = await uploadImage(file);
      if (data.success) {
        setMetadata(data.metadata);
        setResults(data.searchResults || []);
        setStatus('success');
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, []);

  const handleUrlSearch = useCallback(async () => {
    if (!urlInput.trim()) return;
    setError(null);
    setStatus('loading');
    setMetadata(null);
    setResults([]);
    setPreviewUrl(urlInput.trim());

    try {
      const data = await searchByUrl(urlInput.trim());
      if (data.success) {
        setMetadata(data.metadata);
        setResults(data.searchResults || []);
        setStatus('success');
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, [urlInput]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const resetSearch = () => {
    setStatus('idle');
    setError(null);
    setPreviewUrl(null);
    setUrlInput('');
    setMetadata(null);
    setResults([]);
    setSelectedResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="image-search" className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="mb-1 text-xl font-bold tracking-tight text-black">
          Reverse Image Recon
        </h2>
        <p className="text-xs text-text-secondary">
          Unggah gambar atau gunakan URL untuk analisis EXIF serta pencocokan visual gambar 100% di dalam dasbor.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => { setMode('upload'); resetSearch(); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'upload' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          ↑ Unggah Berkas Gambar
        </button>
        <button
          onClick={() => { setMode('url'); resetSearch(); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'url' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          🔗 URL Tautan Gambar
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive ? 'border-black bg-surface' : 'border-border-dark hover:border-black hover:bg-surface'
          }`}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white group-hover:scale-105 transition-transform">
            <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="mb-1 text-xs font-bold text-black">
            {dragActive ? 'Lepaskan gambar di sini' : 'Tarik & lepas berkas gambar di sini'}
          </p>
          <p className="text-[11px] text-text-muted">
            atau klik untuk memilih — JPG, PNG, GIF, WebP (maks 20MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && status === 'idle' && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <label className="mb-2 block text-xs font-semibold text-black">
            URL Tautan Gambar
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSearch()}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
            />
            <button
              onClick={handleUrlSearch}
              disabled={!urlInput.trim()}
              className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
            >
              Cari
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-black" />
          <p className="text-xs font-bold text-black">Menganalisis Gambar...</p>
          <p className="mt-1 text-[11px] text-text-muted">Ekstraksi metadata EXIF & pencocokan visual</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
          <p className="mb-2">{error}</p>
          <button onClick={resetSearch} className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Results */}
      {status === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-secondary">
              Hasil Analisis — {results.length} pencocokan visual ditemukan
            </p>
            <button
              onClick={resetSearch}
              className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-text-secondary hover:border-black hover:text-black"
            >
              ← Analisis Baru
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {/* Left: Preview + Metadata */}
            <div className="space-y-4 lg:col-span-2">
              {previewUrl && (
                <div className="overflow-hidden rounded-xl border border-border bg-white p-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-44 w-full object-contain bg-surface rounded-lg"
                    onError={() => setPreviewUrl(null)}
                  />
                </div>
              )}

              {metadata && (
                <div className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold text-black">📋 Metadata EXIF Gambar</h3>
                  <div className="space-y-2">
                    <MetaRow label="Nama Berkas" value={metadata.fileName} />
                    <MetaRow label="Ukuran" value={metadata.fileSize} />
                    <MetaRow label="Format" value={metadata.mimeType} />
                    <MetaRow label="Resolusi" value={metadata.resolution} />
                    <MetaRow label="Kamera" value={metadata.camera} />
                    <MetaRow label="Lensa" value={metadata.lens} />
                    <MetaRow label="Tanggal Ambil" value={metadata.dateTaken ? new Date(metadata.dateTaken).toLocaleDateString() : null} />
                    {metadata.gps && (
                      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
                        <span className="text-[11px] text-text-muted">Koordinat GPS</span>
                        <button
                          onClick={() => copyToClipboard(`${metadata.gps?.latitude}, ${metadata.gps?.longitude}`)}
                          className="font-mono text-xs font-bold text-black hover:underline"
                        >
                          {metadata.gps.latitude?.toFixed(4)}, {metadata.gps.longitude?.toFixed(4)} 📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Search Results List (In-App Inspector on Click) */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="mb-3 text-xs font-bold text-black">🔍 Pencocokan Visual (In-App Inspection)</h3>
                <div className="space-y-2">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedResult(result)}
                      className="group cursor-pointer rounded-lg border border-border p-3 transition-all hover:border-black hover:bg-surface"
                    >
                      <div className="flex items-start gap-3">
                        {result.thumbnail && (
                          <img
                            src={result.thumbnail}
                            alt=""
                            className="h-10 w-10 rounded border border-border object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="mb-0.5 truncate text-xs font-bold text-black group-hover:underline">
                            {result.title}
                          </p>
                          <p className="mb-1 text-[10px] font-mono text-text-muted">{result.source}</p>
                          {result.snippet && (
                            <p className="line-clamp-2 text-[11px] text-text-secondary">
                              {result.snippet}
                            </p>
                          )}
                        </div>
                        <span className="rounded border border-border px-2 py-1 text-[9px] font-bold text-black group-hover:bg-black group-hover:text-white">
                          Inspeksi ↗
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Inspector Modal for Selected Result */}
      {selectedResult && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-scale space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded border border-border px-2 py-0.5 text-[9px] font-mono font-bold text-text-muted">
                  SOURCE: {selectedResult.source}
                </span>
                <h3 className="mt-1 text-sm font-bold text-black">{selectedResult.title}</h3>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-xs text-text-muted hover:border-black hover:text-black"
              >
                ✕
              </button>
            </div>

            {selectedResult.thumbnail && (
              <div className="rounded-xl border border-border bg-surface p-2 text-center">
                <img
                  src={selectedResult.thumbnail}
                  alt=""
                  className="mx-auto max-h-48 object-contain rounded-lg"
                />
              </div>
            )}

            <div className="rounded-xl bg-surface p-3 text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-black block mb-1">Snippet Analisis:</span>
              {selectedResult.snippet || 'Tidak ada deskripsi teks tambahan dari sumber.'}
            </div>

            <div className="rounded-xl border border-border p-3 space-y-1 font-mono text-xs">
              <span className="text-[10px] text-text-muted block font-sans font-bold">Tautan Sumber (URL):</span>
              <p className="break-all text-[11px] text-black select-all">{selectedResult.link}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(selectedResult.link)}
                className="flex-1 rounded-xl border border-border py-2 text-xs font-bold text-black hover:border-black"
              >
                {copiedLink ? '✓ Tautan Disalin!' : '📋 Salin Tautan URL'}
              </button>
              <button
                onClick={() => setSelectedResult(null)}
                className="rounded-xl bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0 text-xs">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium text-black">{value}</span>
    </div>
  );
}
