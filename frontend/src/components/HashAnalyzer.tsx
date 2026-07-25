'use client';

import { useState, useCallback } from 'react';
import { analyzeHash, reverseHash } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HashAnalyzer() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [inputStr, setInputStr] = useState('');
  const [hashInput, setHashInput] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dataEncode, setDataEncode] = useState<any>(null);
  const [dataDecode, setDataDecode] = useState<any>(null);

  // String to Hash (Encode)
  const handleEncode = useCallback(async () => {
    if (!inputStr.trim()) return;
    setError(null);
    setStatus('loading');
    setDataEncode(null);

    try {
      const result = await analyzeHash(inputStr.trim());
      if (result.success) {
        setDataEncode(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Generasi hash gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [inputStr]);

  // Hash to String (Decode / Reverse Lookup)
  const handleDecode = useCallback(async () => {
    if (!hashInput.trim()) return;
    setError(null);
    setStatus('loading');
    setDataDecode(null);

    try {
      const result = await reverseHash(hashInput.trim());
      if (result.success) {
        setDataDecode(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Lookup hash gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [hashInput]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">Hash Tool (String to Hash & Hash to String)</h2>
        <p className="text-xs text-text-secondary">Generasi hash kriptografi serta dekripsi/lookup hash kembali ke teks asli (reverse lookup).</p>
      </div>

      {/* Tabs Switcher */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => { setActiveTab('encode'); setStatus('idle'); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            activeTab === 'encode' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          🔒 String to Hash (Encode)
        </button>
        <button
          onClick={() => { setActiveTab('decode'); setStatus('idle'); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            activeTab === 'decode' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          🔓 Hash to String (Decode / Reverse)
        </button>
      </div>

      {/* Tab 1: String to Hash */}
      {activeTab === 'encode' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <label className="mb-2 block text-xs font-semibold text-black">Teks Baku / String Input</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
                placeholder="Masukkan kata kunci atau teks..."
                className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
              />
              <button
                onClick={handleEncode}
                disabled={!inputStr.trim() || status === 'loading'}
                className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
              >
                {status === 'loading' ? 'Proses...' : 'Generate Hash'}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
          )}

          {status === 'success' && dataEncode && (
            <div className="rounded-xl border border-border bg-white p-4 space-y-2 font-mono text-xs">
              <div>
                <span className="text-[10px] text-text-muted block font-sans">MD5</span>
                <span className="select-all text-black font-semibold break-all">{dataEncode.hashes.md5}</span>
              </div>
              <div className="border-t border-border/50 pt-2">
                <span className="text-[10px] text-text-muted block font-sans">SHA-1</span>
                <span className="select-all text-black font-semibold break-all">{dataEncode.hashes.sha1}</span>
              </div>
              <div className="border-t border-border/50 pt-2">
                <span className="text-[10px] text-text-muted block font-sans">SHA-256</span>
                <span className="select-all text-black font-semibold break-all">{dataEncode.hashes.sha256}</span>
              </div>
              <div className="border-t border-border/50 pt-2">
                <span className="text-[10px] text-text-muted block font-sans">SHA-512</span>
                <span className="select-all text-black font-semibold break-all">{dataEncode.hashes.sha512}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hash to String */}
      {activeTab === 'decode' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <label className="mb-2 block text-xs font-semibold text-black">String Hash (MD5, SHA1, SHA256)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
                placeholder="5f4dcc3b5aa765d61d8327deb882cf99"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-mono text-black focus:border-black focus:outline-none"
              />
              <button
                onClick={handleDecode}
                disabled={!hashInput.trim() || status === 'loading'}
                className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
              >
                {status === 'loading' ? 'Mencari...' : 'Reverse Hash'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">Masukkan nilai hash untuk dicari teks aslinya melalui database kata sandi & wordlist.</p>
          </div>

          {status === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
          )}

          {status === 'success' && dataDecode && (
            <div className="rounded-xl border border-border bg-white p-5 space-y-3">
              <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
                <span className="text-text-muted">Tipe Hash Terdeteksi</span>
                <span className="font-mono font-bold text-black">{dataDecode.hashType}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2 text-xs">
                <span className="text-text-muted">Metode Pencarian</span>
                <span className="font-semibold text-black">{dataDecode.method}</span>
              </div>
              <div className="border-t border-border/50 pt-2 text-xs">
                <span className="text-text-muted block mb-1">Hasil Teks Asli (Plain Text)</span>
                {dataDecode.found ? (
                  <div className="rounded-lg bg-surface p-3 font-mono font-bold text-black text-sm select-all">
                    {dataDecode.plainText}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-surface p-3 text-xs text-text-muted">
                    ❌ Teks asli tidak ditemukan dalam kamus wordlist publik. Hash kriptografi satu arah bersifat tidak dapat dibalik secara matematis tanpa kamus kecocokan.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
