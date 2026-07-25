'use client';

import { useState, useCallback } from 'react';
import { processEncodeDecode } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EncodingTool() {
  const [inputStr, setInputStr] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleProcess = useCallback(async () => {
    if (!inputStr.trim()) return;
    setError(null);
    setStatus('loading');
    setData(null);

    try {
      const result = await processEncodeDecode(inputStr.trim(), mode);
      if (result.success) {
        setData(result);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Proses gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStatus('error');
    }
  }, [inputStr, mode]);

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black">Base64, URL & Hex Encoder/Decoder</h2>
        <p className="text-xs text-text-secondary">Enkoding & dekoding string teks ke Base64, URL Encoded, Hexadecimal, dan Biner.</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => { setMode('encode'); setStatus('idle'); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'encode' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          🔒 Enkoding (Encode)
        </button>
        <button
          onClick={() => { setMode('decode'); setStatus('idle'); }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'decode' ? 'bg-black text-white shadow-xs' : 'text-text-secondary hover:text-black'
          }`}
        >
          🔓 Dekoding (Decode)
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-xs font-semibold text-black">Input String Teks</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder={mode === 'encode' ? 'Teks rahasia...' : 'SGVsbG8gV29ybGQ='}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-mono text-black focus:border-black focus:outline-none"
          />
          <button
            onClick={handleProcess}
            disabled={!inputStr.trim() || status === 'loading'}
            className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-30"
          >
            {status === 'loading' ? 'Proses...' : mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700">{error}</div>
      )}

      {status === 'success' && data && (
        <div className="rounded-xl border border-border bg-white p-5 space-y-3 font-mono text-xs">
          <div>
            <span className="text-[10px] text-text-muted block font-sans font-bold">Base64</span>
            <span className="select-all text-black font-semibold break-all">{data.base64}</span>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-[10px] text-text-muted block font-sans font-bold">URL Encoded</span>
            <span className="select-all text-black font-semibold break-all">{data.urlEncoded}</span>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-[10px] text-text-muted block font-sans font-bold">Hexadecimal</span>
            <span className="select-all text-black font-semibold break-all">{data.hex}</span>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-[10px] text-text-muted block font-sans font-bold">Biner (Binary)</span>
            <span className="select-all text-black font-semibold break-all text-[11px]">{data.binary}</span>
          </div>
        </div>
      )}
    </section>
  );
}
