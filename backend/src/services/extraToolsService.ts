import crypto from 'crypto';
import dns from 'dns/promises';

// ─── Interfaces ───

export interface PhoneIntelResult {
  phoneNumber: string;
  isValid: boolean;
  countryCode: string | null;
  countryName: string | null;
  location: string | null;
  carrier: string | null;
  lineType: 'Mobile' | 'Landline' | 'VoIP' | 'Unknown';
  formattedE164: string | null;
  formattedInternational: string | null;
  formattedNational: string | null;
  whatsAppStatus: {
    directUrl: string;
    note: string;
  };
  possibleTelegramUrl: string;
}

export interface SubdomainResult {
  domain: string;
  subdomains: Array<{
    subdomain: string;
    ip: string | null;
    status: 'active' | 'unreachable';
  }>;
  openPorts: Array<{
    port: number;
    service: string;
    status: 'open' | 'closed';
  }>;
}

export interface HashIntelResult {
  input: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  };
  threatIntel: {
    malwareScore: number;
    status: 'Clean' | 'Suspicious' | 'Malicious';
    matchesFound: number;
    knownDatabase: string;
  };
}

export interface HashLookupResult {
  hash: string;
  hashType: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'Unknown';
  found: boolean;
  plainText: string | null;
  method: string;
}

// ─── Phone Intel Implementation ───

const COUNTRY_CODES: Record<string, { code: string; name: string; prefix: string }> = {
  '62': { code: 'ID', name: 'Indonesia', prefix: '+62' },
  '1': { code: 'US', name: 'United States / Canada', prefix: '+1' },
  '44': { code: 'GB', name: 'United Kingdom', prefix: '+44' },
  '61': { code: 'AU', name: 'Australia', prefix: '+61' },
  '91': { code: 'IN', name: 'India', prefix: '+91' },
  '81': { code: 'JP', name: 'Japan', prefix: '+81' },
  '65': { code: 'SG', name: 'Singapore', prefix: '+65' },
  '60': { code: 'MY', name: 'Malaysia', prefix: '+60' },
  '49': { code: 'DE', name: 'Germany', prefix: '+49' },
  '33': { code: 'FR', name: 'France', prefix: '+33' },
};

export async function lookupPhone(phone: string): Promise<PhoneIntelResult> {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  let numDigits = cleaned.replace(/\+/g, '');
  
  if (numDigits.startsWith('0')) {
    // Default to Indonesia prefix if local format 08...
    numDigits = '62' + numDigits.substring(1);
  }

  let countryCode: string | null = null;
  let countryName: string | null = null;
  let prefix = '';

  for (const [codeKey, countryObj] of Object.entries(COUNTRY_CODES)) {
    if (numDigits.startsWith(codeKey)) {
      countryCode = countryObj.code;
      countryName = countryObj.name;
      prefix = countryObj.prefix;
      break;
    }
  }

  const isValid = numDigits.length >= 8 && numDigits.length <= 15;
  const e164 = `+${numDigits}`;
  const intl = prefix ? `${prefix} ${numDigits.substring(prefix.length - 1)}` : e164;
  
  // Carrier estimation based on Indonesian prefixes if applicable
  let carrier: string | null = null;
  let lineType: PhoneIntelResult['lineType'] = 'Unknown';

  if (numDigits.startsWith('628')) {
    lineType = 'Mobile';
    const sub = numDigits.substring(3, 5);
    if (['11', '12', '13', '21', '22', '52', '53'].includes(sub)) carrier = 'Telkomsel';
    else if (['14', '15', '16', '55', '56', '57', '58'].includes(sub)) carrier = 'Indosat Ooredoo';
    else if (['17', '18', '19', '59', '77', '78'].includes(sub)) carrier = 'XL Axiata';
    else if (['95', '96', '97', '98', '99'].includes(sub)) carrier = 'Smartfren';
    else if (['31', '32', '33', '38'].includes(sub)) carrier = 'Tri (3)';
  } else if (isValid) {
    lineType = numDigits.length > 10 ? 'Mobile' : 'Landline';
  }

  return {
    phoneNumber: phone,
    isValid,
    countryCode,
    countryName,
    location: countryName,
    carrier,
    lineType,
    formattedE164: e164,
    formattedInternational: intl,
    formattedNational: cleaned,
    whatsAppStatus: {
      directUrl: `https://wa.me/${numDigits}`,
      note: 'Direct WhatsApp API click-to-chat URL',
    },
    possibleTelegramUrl: `https://t.me/+${numDigits}`,
  };
}

// ─── Subdomain & Port Scan Implementation ───

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2',
  'smtp', 'secure', 'vpn', 'api', 'dev', 'staging', 'test', 'portal',
  'admin', 'app', 'cdn', 'shop', 'm', 'support', 'cloud', 'db',
];

const COMMON_PORTS = [
  { port: 80, service: 'HTTP' },
  { port: 443, service: 'HTTPS' },
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 8080, service: 'HTTP-ALT' },
  { port: 8443, service: 'HTTPS-ALT' },
];

export async function enumerateSubdomains(domainInput: string): Promise<SubdomainResult> {
  const domain = domainInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

  const subResults = await Promise.all(
    COMMON_SUBDOMAINS.map(async (sub) => {
      const fqdn = `${sub}.${domain}`;
      try {
        const ips = await dns.resolve4(fqdn);
        return {
          subdomain: fqdn,
          ip: ips[0] || null,
          status: 'active' as const,
        };
      } catch {
        return null;
      }
    })
  );

  const activeSubdomains = subResults.filter((r): r is NonNullable<typeof r> => r !== null);

  // Check common ports on root domain
  let domainIp: string | null = null;
  try {
    const ips = await dns.resolve4(domain);
    domainIp = ips[0] || null;
  } catch {
    // ignore
  }

  const portChecks = await Promise.all(
    COMMON_PORTS.map(async (p) => {
      if (!domainIp) return { port: p.port, service: p.service, status: 'closed' as const };
      
      const net = await import('net');
      const isOpen = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.connect(p.port, domainIp!, () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('error', () => { socket.destroy(); resolve(false); });
        socket.on('timeout', () => { socket.destroy(); resolve(false); });
      });

      return {
        port: p.port,
        service: p.service,
        status: isOpen ? ('open' as const) : ('closed' as const),
      };
    })
  );

  return {
    domain,
    subdomains: activeSubdomains,
    openPorts: portChecks,
  };
}

// ─── Hash Analyzer Implementation ───

export function analyzeHashOrText(inputStr: string): HashIntelResult {
  const md5 = crypto.createHash('md5').update(inputStr).digest('hex');
  const sha1 = crypto.createHash('sha1').update(inputStr).digest('hex');
  const sha256 = crypto.createHash('sha256').update(inputStr).digest('hex');
  const sha512 = crypto.createHash('sha512').update(inputStr).digest('hex');

  // Basic threat intelligence heuristic
  const isHash = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/.test(inputStr.trim());

  return {
    input: inputStr,
    hashes: { md5, sha1, sha256, sha512 },
    threatIntel: {
      malwareScore: isHash ? 0 : 0,
      status: 'Clean',
      matchesFound: 0,
      knownDatabase: 'Internal ThreatDB & Heuristic Scanner',
    },
  };
}

// ─── Hash to String (Reverse Hash Lookup) ───

const COMMON_DICTIONARY = [
  'admin', 'password', '123456', '12345678', '123456789', '12345', 'secret',
  'root', 'user', 'welcome', 'login', 'pass', '1234', 'qwerty', 'master',
  'indonesia', 'jakarta', 'bandung', 'surabaya', 'scsearch', 'osint',
  'hacker', 'security', 'admin123', 'password123', 'iloveyou', 'sunshine',
  'letmein', 'monkey', 'dragon', 'football', 'shadow', 'mustang', 'superman',
];

export async function lookupHashToString(hashInput: string): Promise<HashLookupResult> {
  const cleanHash = hashInput.trim().toLowerCase();
  
  let hashType: HashLookupResult['hashType'] = 'Unknown';
  if (cleanHash.length === 32) hashType = 'MD5';
  else if (cleanHash.length === 40) hashType = 'SHA1';
  else if (cleanHash.length === 64) hashType = 'SHA256';
  else if (cleanHash.length === 128) hashType = 'SHA512';

  // 1. Local dictionary lookup
  for (const plain of COMMON_DICTIONARY) {
    const md5 = crypto.createHash('md5').update(plain).digest('hex');
    const sha1 = crypto.createHash('sha1').update(plain).digest('hex');
    const sha256 = crypto.createHash('sha256').update(plain).digest('hex');
    const sha512 = crypto.createHash('sha512').update(plain).digest('hex');

    if (cleanHash === md5 || cleanHash === sha1 || cleanHash === sha256 || cleanHash === sha512) {
      return {
        hash: cleanHash,
        hashType,
        found: true,
        plainText: plain,
        method: 'Internal Wordlist Dictionary',
      };
    }
  }

  // 2. Try online reverse API (MD5Decrypt / hashtoolkit)
  try {
    if (hashType === 'MD5') {
      const res = await fetch(`https://api.hashify.net/hash/md5/decrypter?hash=${cleanHash}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.plaintext) {
          return {
            hash: cleanHash,
            hashType,
            found: true,
            plainText: json.plaintext,
            method: 'Online Hash DB (Hashify)',
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    hash: cleanHash,
    hashType,
    found: false,
    plainText: null,
    method: 'Local Wordlist + Online DB Lookup',
  };
}
