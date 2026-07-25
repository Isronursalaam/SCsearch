export interface OsintTool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'image-recon' | 'domain-ip' | 'email-username';
  categoryLabel: string;
  isFree: boolean;
  tags: string[];
}

export const tools: OsintTool[] = [
  // ─── Image Recon ──────────────────────────────────────────
  {
    id: 'google-images',
    name: 'Google Images (Reverse)',
    description: 'Google reverse image search — identify sources, find higher resolution versions, and discover visually similar images.',
    url: 'https://images.google.com',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: true,
    tags: ['reverse image', 'google', 'visual search'],
  },
  {
    id: 'tineye',
    name: 'TinEye',
    description: 'Dedicated reverse image search engine that tracks where images appear online and finds modified versions.',
    url: 'https://tineye.com',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: true,
    tags: ['reverse image', 'tracking', 'duplicates'],
  },
  {
    id: 'yandex-images',
    name: 'Yandex Images',
    description: 'Russian search engine with powerful face and scene recognition for reverse image lookup.',
    url: 'https://yandex.com/images/',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: true,
    tags: ['reverse image', 'face recognition', 'yandex'],
  },
  {
    id: 'pimeyes',
    name: 'PimEyes',
    description: 'Face recognition search engine — find where a face appears across the internet.',
    url: 'https://pimeyes.com',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: false,
    tags: ['face recognition', 'people search', 'identity'],
  },
  {
    id: 'exiftool',
    name: 'ExifTool (Online)',
    description: 'Extract EXIF, IPTC, XMP, and other metadata from images including GPS coordinates and camera information.',
    url: 'https://exif.tools',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: true,
    tags: ['metadata', 'exif', 'gps', 'camera'],
  },
  {
    id: 'fotoforensics',
    name: 'FotoForensics',
    description: 'Image forensics tool using Error Level Analysis (ELA) to detect modifications and manipulations.',
    url: 'https://fotoforensics.com',
    category: 'image-recon',
    categoryLabel: 'Image Recon',
    isFree: true,
    tags: ['forensics', 'manipulation detection', 'ela'],
  },

  // ─── Domain & IP Lookup ───────────────────────────────────
  {
    id: 'whois-lookup',
    name: 'WHOIS Lookup',
    description: 'Query domain registration records — ownership, registrar, creation/expiry dates, and nameservers.',
    url: 'https://whois.domaintools.com',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: true,
    tags: ['whois', 'domain', 'registration'],
  },
  {
    id: 'shodan',
    name: 'Shodan',
    description: 'Search engine for internet-connected devices — find open ports, services, and vulnerabilities on any IP.',
    url: 'https://www.shodan.io',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: false,
    tags: ['iot', 'ports', 'vulnerability', 'devices'],
  },
  {
    id: 'censys',
    name: 'Censys',
    description: 'Internet-wide scan data for discovering hosts, certificates, and network services.',
    url: 'https://search.censys.io',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: false,
    tags: ['certificates', 'hosts', 'network'],
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    description: 'Historical DNS data, WHOIS records, subdomains, and associated IPs for any domain.',
    url: 'https://securitytrails.com',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: false,
    tags: ['dns', 'subdomains', 'history'],
  },
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Analyze domains, IPs, and URLs against 70+ antivirus engines and URL/domain blocklists.',
    url: 'https://www.virustotal.com',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: true,
    tags: ['malware', 'scanning', 'reputation'],
  },
  {
    id: 'ipinfo',
    name: 'IPinfo',
    description: 'IP geolocation, ASN lookup, carrier detection, and company data for any IP address.',
    url: 'https://ipinfo.io',
    category: 'domain-ip',
    categoryLabel: 'Domain & IP',
    isFree: true,
    tags: ['geolocation', 'asn', 'ip'],
  },

  // ─── Email & Username Recon ───────────────────────────────
  {
    id: 'haveibeenpwned',
    name: 'Have I Been Pwned',
    description: 'Check if an email address has appeared in known data breaches and leaks.',
    url: 'https://haveibeenpwned.com',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: true,
    tags: ['breach', 'email', 'leak', 'password'],
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Find and verify professional email addresses associated with any company domain.',
    url: 'https://hunter.io',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: false,
    tags: ['email', 'company', 'verification'],
  },
  {
    id: 'namechk',
    name: 'Namechk',
    description: 'Check username availability across dozens of social media platforms and domains.',
    url: 'https://namechk.com',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: true,
    tags: ['username', 'social media', 'availability'],
  },
  {
    id: 'sherlock',
    name: 'Sherlock Project',
    description: 'Hunt usernames across 400+ social networks — open source CLI tool by the Sherlock Project.',
    url: 'https://github.com/sherlock-project/sherlock',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: true,
    tags: ['username', 'social media', 'cli', 'open source'],
  },
  {
    id: 'emailrep',
    name: 'EmailRep',
    description: 'Email reputation and risk scoring — check if an email is suspicious, disposable, or associated with breaches.',
    url: 'https://emailrep.io',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: true,
    tags: ['email', 'reputation', 'risk'],
  },
  {
    id: 'whatsmyname',
    name: "WhatsMyName",
    description: 'Enumerate usernames across hundreds of websites — open source web-based OSINT username tool.',
    url: 'https://whatsmyname.app',
    category: 'email-username',
    categoryLabel: 'Email & Username',
    isFree: true,
    tags: ['username', 'enumeration', 'open source'],
  },
];

export function getToolsByCategory(category?: string): OsintTool[] {
  if (!category || category === 'all') return tools;
  return tools.filter((t) => t.category === category);
}

export function searchTools(query: string): OsintTool[] {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
  );
}
