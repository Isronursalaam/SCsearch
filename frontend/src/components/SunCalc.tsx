'use client';

import { useState, useCallback, useEffect } from 'react';
import { computeSunCalc } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

const LOCATION_PRESETS = [
  { name: 'Jakarta (Indonesia)', lat: -6.2088, lon: 106.8456 },
  { name: 'Surabaya (Indonesia)', lat: -7.2575, lon: 112.7521 },
  { name: 'Bali / Denpasar', lat: -8.6705, lon: 115.2126 },
  { name: 'IKN Nusantara', lat: -0.9612, lon: 116.7011 },
  { name: 'Tokyo (Jepang)', lat: 35.6762, lon: 139.6503 },
  { name: 'London (Inggris)', lat: 51.5074, lon: -0.1278 },
  { name: 'New York (AS)', lat: 40.7128, lon: -74.0060 },
  { name: 'Gaza (Palestina)', lat: 31.5017, lon: 34.4668 },
  { name: 'Kyiv (Ukraina)', lat: 50.4501, lon: 30.5234 },
];

export default function SunCalc() {
  const [lat, setLat] = useState('-6.2088');
  const [lon, setLon] = useState('106.8456');
  const [selectedPreset, setSelectedPreset] = useState('Jakarta (Indonesia)');
  
  // Date & Time states
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [hourMinute, setHourMinute] = useState('12:00');
  const [objectHeight, setObjectHeight] = useState('1.7');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(async (currentLat: string, currentLon: string, date: string, time: string, height: string) => {
    setLoading(true);
    try {
      const fullIsoDate = new Date(`${date}T${time}:00Z`).toISOString();
      const res = await computeSunCalc(
        Number(currentLat),
        Number(currentLon),
        fullIsoDate,
        Number(height) || 1.7
      );

      if (res.success) {
        setData(res);
      }
    } catch {
      // ignore error silently for smooth slider drag
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate whenever controls change
  useEffect(() => {
    calculate(lat, lon, selectedDate, hourMinute, objectHeight);
  }, [lat, lon, selectedDate, hourMinute, objectHeight, calculate]);

  const handlePresetSelect = (presetName: string) => {
    const found = LOCATION_PRESETS.find(p => p.name === presetName);
    if (found) {
      setSelectedPreset(presetName);
      setLat(found.lat.toString());
      setLon(found.lon.toString());
    }
  };

  // Convert minutes (0 to 1439) for range slider
  const minutesFromTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const timeFromMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <section className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Header Minimalis */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
              <span>☀️ SunCalc GEOINT Inspector</span>
              <span className="rounded border border-border px-2 py-0.5 text-[9px] font-mono font-bold text-text-muted">
                SunCalc.org Engine
              </span>
            </h2>
            <p className="text-xs text-text-secondary">
              Inspeksi vektor posisi matahari (Azimuth & Elevasi), bayangan fisik objek, serta kalkulasi waktu ephemeris (Sunrise/Sunset) untuk verifikasi chronolocation foto.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Location & Controls Bar */}
      <div className="mb-6 rounded-xl border border-border bg-white p-5 space-y-4">
        {/* Presets */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-black">Preset Lokasi GEOINT</label>
          <div className="flex flex-wrap gap-1.5">
            {LOCATION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset.name)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  selectedPreset === preset.name
                    ? 'bg-black text-white'
                    : 'border border-border bg-surface text-text-secondary hover:text-black'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Lat, Lon, Height */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => { setLat(e.target.value); setSelectedPreset('Custom'); }}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-mono text-black focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">Longitude</label>
            <input
              type="text"
              value={lon}
              onChange={(e) => { setLon(e.target.value); setSelectedPreset('Custom'); }}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-mono text-black focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">Tanggal Foto</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">Tinggi Objek (Meter)</label>
            <input
              type="number"
              step="0.1"
              value={objectHeight}
              onChange={(e) => setObjectHeight(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-mono text-black focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {/* Timeline Range Slider 24-Hours (SunCalc.org interactive style) */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-black flex items-center gap-1.5">
              <span>🕒 Waktu (UTC) Timeline Slider:</span>
              <span className="font-mono text-sm bg-black text-white px-2 py-0.5 rounded">{hourMinute} UTC</span>
            </span>
            <span className="text-[10px] text-text-muted">Geser slider untuk simulasi 24 jam real-time</span>
          </div>
          <input
            type="range"
            min="0"
            max="1439"
            step="5"
            value={minutesFromTime(hourMinute)}
            onChange={(e) => setHourMinute(timeFromMinutes(Number(e.target.value)))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div className="flex justify-between text-[9px] font-mono text-text-muted mt-1">
            <span>00:00 (Malam)</span>
            <span>06:00 (Pagi)</span>
            <span>12:00 (Siang)</span>
            <span>18:00 (Sore)</span>
            <span>23:59 (Malam)</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Display */}
      {data && (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Left Column: Visual Dial Compass & Vector Map (2 cols) */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-white p-5 flex flex-col justify-between items-center text-center">
            <h3 className="text-xs font-bold text-black mb-2">🧭 Vektor Kompas Matahari & Bayangan</h3>
            
            {/* SVG Sun & Shadow Compass Dial */}
            <div className="relative w-52 h-52 my-2">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Outer Ring */}
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="100" cy="100" r="5" fill="#000000" />
                
                {/* Cardinal Directions */}
                <text x="100" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000000">N (0°)</text>
                <text x="180" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6b7280">E (90°)</text>
                <text x="100" y="186" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6b7280">S (180°)</text>
                <text x="20" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6b7280">W (270°)</text>

                {/* Sun Vector (Yellow/Orange Line + Sun Icon) */}
                {(() => {
                  const rad = ((data.solarAzimuth - 90) * Math.PI) / 180;
                  const x = 100 + 70 * Math.cos(rad);
                  const y = 100 + 70 * Math.sin(rad);
                  return (
                    <g>
                      <line x1="100" y1="100" x2={x} y2={y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="3,3" />
                      <circle cx={x} cy={y} r="8" fill="#f59e0b" />
                    </g>
                  );
                })()}

                {/* Shadow Vector (Black Line opposite of Sun) */}
                {(() => {
                  const rad = ((data.shadowAzimuth - 90) * Math.PI) / 180;
                  // Length proportioned to shadow length
                  const len = Math.min(75, Math.max(15, data.shadowLength * 10));
                  const x = 100 + len * Math.cos(rad);
                  const y = 100 + len * Math.sin(rad);
                  return (
                    <g>
                      <line x1="100" y1="100" x2={x} y2={y} stroke="#000000" strokeWidth="4" />
                      <polygon points={`${x},${y} ${x-4},${y-4} ${x+4},${y+4}`} fill="#000000" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            <div className="w-full space-y-1 text-xs">
              <div className="flex justify-between border-t border-border/50 pt-2">
                <span className="text-text-muted">☀️ Azimuth Matahari:</span>
                <span className="font-mono font-bold text-amber-600">{data.solarAzimuth}°</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1">
                <span className="text-text-muted">👤 Arah Bayangan:</span>
                <span className="font-mono font-bold text-black">{data.shadowAzimuth}°</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1">
                <span className="text-text-muted">📏 Panjang Bayangan:</span>
                <span className="font-mono font-bold text-black">{data.shadowLength} meter</span>
              </div>
            </div>
          </div>

          {/* Right Column: Ephemeris Dashboard & Sun Status (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Status Card */}
            <div className="rounded-xl border border-border bg-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase">STATUS SIKLUS HARI</span>
                <h3 className="text-base font-black text-black">{data.sunStatus}</h3>
                <p className="text-xs text-text-secondary">Sudut Elevasi / Ketinggian: <strong className="font-mono text-black">{data.solarAltitude}°</strong> di atas horizon</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-text-muted block uppercase">DURASI SIANG</span>
                <span className="font-mono font-extrabold text-sm text-black">{data.ephemeris.dayLength}</span>
              </div>
            </div>

            {/* Ephemeris Timeline Table (Sunrise, Sunset, Solar Noon, Golden Hour) */}
            <div className="rounded-xl border border-border bg-white p-5 space-y-3">
              <h3 className="text-xs font-bold text-black border-b border-border/50 pb-2">
                🌅 Tabel Ephemeris Waktu Matahari (UTC)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">🌅 Fajr / Fajar (Dawn)</span>
                  <span className="font-mono font-bold text-black">{data.ephemeris.dawnCivil}</span>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">☀️ Terbit (Sunrise)</span>
                  <span className="font-mono font-bold text-amber-600">{data.ephemeris.sunrise}</span>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">🕛 Puncak (Solar Noon)</span>
                  <span className="font-mono font-bold text-black">{data.ephemeris.solarNoon}</span>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">🌇 Terbenam (Sunset)</span>
                  <span className="font-mono font-bold text-amber-600">{data.ephemeris.sunset}</span>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">🌆 Maghrib (Dusk)</span>
                  <span className="font-mono font-bold text-black">{data.ephemeris.duskCivil}</span>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <span className="text-[10px] text-text-muted block">📐 Maks. Elevasi</span>
                  <span className="font-mono font-bold text-black">{data.ephemeris.maxAltitude}°</span>
                </div>
              </div>
            </div>

            {/* GEOINT Forensic Advice Box */}
            <div className="rounded-xl border border-border bg-surface p-4 text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-black block mb-1">🔍 GEOINT Verification Tip:</span>
              Gunakan timeline slider di atas untuk menyesuaikan waktu pengambilan foto sampai garis bayangan pada foto sejajar dengan sudut azimuth bayangan ({data.shadowAzimuth}°).
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
