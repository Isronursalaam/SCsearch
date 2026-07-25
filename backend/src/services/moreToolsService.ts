// ─── Interfaces ───

export interface MacLookupResult {
  mac: string;
  normalizedMac: string;
  vendor: string;
  ouiPrefix: string;
  isMulticast: boolean;
  isLocalAddress: boolean;
}

export interface HeaderAuditResult {
  url: string;
  statusCode: number;
  server: string | null;
  score: string;
  headers: Record<string, string>;
  securityAudit: Array<{
    header: string;
    status: 'pass' | 'warning' | 'fail';
    description: string;
  }>;
}

export interface EncodeDecodeResult {
  input: string;
  base64: string;
  urlEncoded: string;
  hex: string;
  binary: string;
}

// ─── MAC Vendor Database (OUI) ───

const MAC_DATABASE: Record<string, string> = {
  '00:05:02': 'Apple, Inc.',
  '00:0A:95': 'Apple, Inc.',
  '00:11:24': 'Apple, Inc.',
  '00:1C:B3': 'Apple, Inc.',
  '00:23:12': 'Apple, Inc.',
  '00:25:00': 'Apple, Inc.',
  '00:00:0C': 'Cisco Systems, Inc.',
  '00:01:42': 'Cisco Systems, Inc.',
  '00:02:4A': 'Cisco Systems, Inc.',
  '00:00:F8': 'Intel Corporation',
  '00:02:B3': 'Intel Corporation',
  '00:03:47': 'Intel Corporation',
  '00:07:E9': 'Intel Corporation',
  '00:02:78': 'Samsung Electronics Co.,Ltd',
  '00:07:AB': 'Samsung Electronics Co.,Ltd',
  '00:12:FB': 'Samsung Electronics Co.,Ltd',
  '00:18:AF': 'Huawei Technologies Co., Ltd.',
  '00:1E:10': 'Huawei Technologies Co., Ltd.',
  '00:0A:EB': 'TP-Link Technologies Co., Ltd.',
  '00:14:78': 'TP-Link Technologies Co., Ltd.',
  '00:1D:0F': 'TP-Link Technologies Co., Ltd.',
  '00:E0:4C': 'Realtek Semiconductor Corp.',
  '00:19:D1': 'Sony Corporation',
  'B8:27:EB': 'Raspberry Pi Foundation',
  'DC:A6:32': 'Raspberry Pi Trading Ltd',
  'E4:5F:01': 'Raspberry Pi Trading Ltd',
  '00:15:5D': 'Microsoft Corporation (Hyper-V)',
  '00:50:56': 'VMware, Inc.',
  '00:0C:29': 'VMware, Inc.',
  '08:00:27': 'Oracle Corporation (VirtualBox)',
};

export async function lookupMac(macInput: string): Promise<MacLookupResult> {
  const clean = macInput.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  
  if (clean.length < 6) {
    throw new Error('Valid MAC address requires at least 6 hex characters.');
  }

  const formatted = clean.match(/.{1,2}/g)?.slice(0, 6).join(':') || macInput;
  const oui = clean.substring(0, 6).match(/.{1,2}/g)?.join(':') || '';

  // Check database
  let vendor = MAC_DATABASE[oui] || null;

  if (!vendor) {
    try {
      const res = await fetch(`https://api.macvendors.com/${encodeURIComponent(formatted)}`);
      if (res.ok) {
        vendor = await res.text();
      }
    } catch {
      // ignore
    }
  }

  const firstByte = parseInt(clean.substring(0, 2), 16);
  const isMulticast = (firstByte & 1) === 1;
  const isLocalAddress = (firstByte & 2) === 2;

  return {
    mac: macInput,
    normalizedMac: formatted,
    vendor: vendor || 'Unknown Vendor / Unregistered OUI',
    ouiPrefix: oui,
    isMulticast,
    isLocalAddress,
  };
}

// ─── Header & Security Audit Implementation ───

export async function auditHttpHeaders(urlInput: string): Promise<HeaderAuditResult> {
  let targetUrl = urlInput.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SCsearch OSINT Security Audit 1.0',
    },
    redirect: 'follow',
  });

  const headers: Record<string, string> = {};
  response.headers.forEach((val, key) => {
    headers[key.toLowerCase()] = val;
  });

  const audit: HeaderAuditResult['securityAudit'] = [];
  let scorePoints = 100;

  // 1. Strict-Transport-Security (HSTS)
  if (headers['strict-transport-security']) {
    audit.push({ header: 'Strict-Transport-Security (HSTS)', status: 'pass', description: 'HSTS is enabled, forcing HTTPS connections.' });
  } else {
    scorePoints -= 20;
    audit.push({ header: 'Strict-Transport-Security (HSTS)', status: 'fail', description: 'Missing HSTS header. Vulnerable to SSL stripping.' });
  }

  // 2. Content-Security-Policy (CSP)
  if (headers['content-security-policy']) {
    audit.push({ header: 'Content-Security-Policy (CSP)', status: 'pass', description: 'CSP is defined, mitigating XSS and data injection attacks.' });
  } else {
    scorePoints -= 25;
    audit.push({ header: 'Content-Security-Policy (CSP)', status: 'fail', description: 'Missing CSP. Increased risk of XSS vulnerabilities.' });
  }

  // 3. X-Frame-Options
  if (headers['x-frame-options']) {
    audit.push({ header: 'X-Frame-Options', status: 'pass', description: `Set to "${headers['x-frame-options']}", preventing clickjacking.` });
  } else {
    scorePoints -= 15;
    audit.push({ header: 'X-Frame-Options', status: 'warning', description: 'Missing X-Frame-Options. Site could be embedded in iframe (Clickjacking).' });
  }

  // 4. X-Content-Type-Options
  if (headers['x-content-type-options'] === 'nosniff') {
    audit.push({ header: 'X-Content-Type-Options', status: 'pass', description: 'Set to "nosniff", preventing MIME-type sniffing.' });
  } else {
    scorePoints -= 10;
    audit.push({ header: 'X-Content-Type-Options', status: 'fail', description: 'Missing or invalid nosniff header. Risk of MIME sniffing.' });
  }

  // 5. Server disclosure check
  if (headers['server']) {
    audit.push({ header: 'Server Banner Disclosure', status: 'warning', description: `Server identifies as "${headers['server']}". Information disclosure.` });
  } else {
    audit.push({ header: 'Server Banner Disclosure', status: 'pass', description: 'Server software version banner is hidden.' });
  }

  let score = 'A+';
  if (scorePoints < 50) score = 'F';
  else if (scorePoints < 70) score = 'C';
  else if (scorePoints < 85) score = 'B';
  else if (scorePoints < 95) score = 'A';

  return {
    url: targetUrl,
    statusCode: response.status,
    server: headers['server'] || null,
    score,
    headers,
    securityAudit: audit,
  };
}

// ─── Encode & Decode Helper ───

export function processEncoding(inputStr: string, mode: 'encode' | 'decode'): EncodeDecodeResult {
  if (mode === 'encode') {
    const base64 = Buffer.from(inputStr).toString('base64');
    const urlEncoded = encodeURIComponent(inputStr);
    const hex = Buffer.from(inputStr).toString('hex');
    const binary = inputStr.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

    return {
      input: inputStr,
      base64,
      urlEncoded,
      hex,
      binary,
    };
  } else {
    let base64 = '';
    let urlEncoded = '';
    let hex = '';
    let binary = '';

    try { base64 = Buffer.from(inputStr, 'base64').toString('utf-8'); } catch { base64 = 'Invalid Base64'; }
    try { urlEncoded = decodeURIComponent(inputStr); } catch { urlEncoded = 'Invalid URL Encoded string'; }
    try { hex = Buffer.from(inputStr, 'hex').toString('utf-8'); } catch { hex = 'Invalid Hex string'; }
    binary = inputStr;

    return {
      input: inputStr,
      base64,
      urlEncoded,
      hex,
      binary,
    };
  }
}
