'use client';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const TOOL_MODULES = [
  {
    id: 'image-search',
    icon: '◎',
    title: 'Image Recon & EXIF',
    description: 'Pencocokan visual gambar & ekstraksi metadata EXIF (Kamera, Tanggal, Geotag GPS).',
    badge: 'Media Recon',
  },
  {
    id: 'suncalc',
    icon: '☀️',
    title: 'GEOINT Sun & Shadow Calc',
    description: 'Kalkulasi posisi matahari, sudut elevasi, azimuth, & panjang bayangan untuk verifikasi chronolocation foto.',
    badge: 'GEOINT Intel',
  },
  {
    id: 'username',
    icon: '👤',
    title: 'Username Search',
    description: 'Pelacakan nama pengguna secara simultan di 20+ jejaring sosial & komunitas.',
    badge: 'Social OSINT',
  },
  {
    id: 'domain',
    icon: '◈',
    title: 'Domain & IP Lookup',
    description: 'Investigasi data WHOIS, resolusi DNS lengkap, dan peta lokasi server GeoIP.',
    badge: 'Network Recon',
  },
  {
    id: 'email',
    icon: '◇',
    title: 'Email Intelligence',
    description: 'Verifikasi server MX, deteksi disposable email, dan simulasi riwayat kebocoran data.',
    badge: 'Account Intel',
  },
  {
    id: 'threat',
    icon: '🛡️',
    title: 'Threat Intel & Reputation',
    description: 'Analisis pasif reputasi domain, IP, URL, dan berkas/hash tanpa menyentuh target secara langsung.',
    badge: 'Threat Intel',
  },
  {
    id: 'phone',
    icon: '📞',
    title: 'Phone Recon',
    description: 'Analisis nomor telepon, identifikasi operator seluler, serta tautan direct WA & Telegram.',
    badge: 'Telecom Recon',
  },
  {
    id: 'subdomain',
    icon: '🔌',
    title: 'Subdomain & Port Scanner',
    description: 'Pemindaian subdomain publik aktif & pemeriksaan status port service jaringan.',
    badge: 'Infrastructure',
  },
  {
    id: 'hash',
    icon: '🔑',
    title: 'Hash & Crypto Tool',
    description: 'Generasi hash (MD5, SHA1, SHA256) & deskripsi teks asli (Reverse Hash Lookup).',
    badge: 'Crypto & Hash',
  },
  {
    id: 'mac',
    icon: '💻',
    title: 'MAC Vendor Lookup',
    description: 'Identifikasi produsen perangkat keras jaringan dari OUI alamat MAC.',
    badge: 'Hardware Recon',
  },
  {
    id: 'headers',
    icon: '🛡️',
    title: 'HTTP Header Security Audit',
    description: 'Audit keamanan header HTTP (HSTS, CSP, X-Frame-Options) & skor proteksi.',
    badge: 'Web Security',
  },
  {
    id: 'encoding',
    icon: '⚡',
    title: 'Base64 & Hex Encoder',
    description: 'Enkoding & dekoding teks ke Base64, URL Encoded, Hexadecimal, dan Biner.',
    badge: 'Data Encoding',
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <section id="dashboard" className="mx-auto w-full max-w-6xl">
      {/* Grid Perkakas OSINT Minimalis */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Modul Perkakas Terintegrasi ({TOOL_MODULES.length})
          </h2>
          <span className="text-[10px] font-mono text-text-muted">100% Passive & In-App Processing</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_MODULES.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="group flex flex-col justify-between rounded-xl border border-border bg-white p-4 text-left transition-all duration-200 hover:border-black hover:shadow-xs"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-sm transition-colors group-hover:bg-black group-hover:text-white">
                    {tool.icon}
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 text-[9px] font-semibold text-text-muted">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="mb-1 text-xs font-bold text-black group-hover:underline">
                  {tool.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  {tool.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-black">
                <span>Buka Tool</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Peringatan Etis Banner Red */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-xs font-bold text-red-700 mb-1">
          ⚠️ Himbauan Etika & Hukum Penggunaan
        </p>
        <p className="text-[11px] text-red-900 leading-relaxed max-w-2xl mx-auto">
          Pastikan Anda menggunakan platform ini hanya untuk riset keamanan berizin, akademis, dan investigasi legal. Penggunaan untuk peretasan jahat, doxing, atau pelecehan dilarang keras.
        </p>
      </div>
    </section>
  );
}
