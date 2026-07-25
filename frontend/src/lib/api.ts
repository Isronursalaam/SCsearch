const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Upload an image file for reverse image search + metadata extraction.
 */
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

/**
 * Search by image URL for reverse image search + metadata extraction.
 */
export async function searchByUrl(url: string) {
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(err.error || `Search failed (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch OSINT tools, optionally filtered by category and/or search query.
 */
export async function fetchTools(category?: string, query?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (query) params.set('q', query);

  const res = await fetch(`${API_BASE}/api/tools?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch tools (${res.status})`);
  }

  return res.json();
}

/**
 * Search for a username across social platforms.
 */
export async function searchUsername(username: string) {
  const res = await fetch(`${API_BASE}/api/username-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(err.error || `Username search failed (${res.status})`);
  }

  return res.json();
}

/**
 * Perform domain/IP lookup (WHOIS + DNS + GeoIP).
 */
export async function lookupDomain(domain: string) {
  const res = await fetch(`${API_BASE}/api/domain-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lookup failed' }));
    throw new Error(err.error || `Domain lookup failed (${res.status})`);
  }

  return res.json();
}

/**
 * Perform email intelligence lookup.
 */
export async function lookupEmail(email: string) {
  const res = await fetch(`${API_BASE}/api/email-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lookup failed' }));
    throw new Error(err.error || `Email lookup failed (${res.status})`);
  }

  return res.json();
}

/**
 * Perform phone intelligence lookup.
 */
export async function lookupPhone(phone: string) {
  const res = await fetch(`${API_BASE}/api/phone-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lookup failed' }));
    throw new Error(err.error || `Phone lookup failed (${res.status})`);
  }

  return res.json();
}

/**
 * Perform subdomain & port enumeration.
 */
export async function scanSubdomains(domain: string) {
  const res = await fetch(`${API_BASE}/api/subdomain-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Scan failed' }));
    throw new Error(err.error || `Subdomain scan failed (${res.status})`);
  }

  return res.json();
}

/**
 * Perform hash generation & threat analysis.
 */
export async function analyzeHash(input: string) {
  const res = await fetch(`${API_BASE}/api/hash-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || `Hash analysis failed (${res.status})`);
  }

  return res.json();
}

/**
 * Reverse Hash to String (Hash Lookup)
 */
export async function reverseHash(hash: string) {
  const res = await fetch(`${API_BASE}/api/hash-reverse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lookup failed' }));
    throw new Error(err.error || `Hash lookup failed (${res.status})`);
  }

  return res.json();
}

/**
 * MAC Address OUI Lookup
 */
export async function lookupMacAddress(mac: string) {
  const res = await fetch(`${API_BASE}/api/mac-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mac }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lookup failed' }));
    throw new Error(err.error || `MAC lookup failed (${res.status})`);
  }

  return res.json();
}

/**
 * HTTP Security Headers Audit
 */
export async function auditHeaders(url: string) {
  const res = await fetch(`${API_BASE}/api/header-audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Audit failed' }));
    throw new Error(err.error || `Header audit failed (${res.status})`);
  }

  return res.json();
}

/**
 * Encoder & Decoder (Base64, URL, Hex, Binary)
 */
export async function processEncodeDecode(input: string, mode: 'encode' | 'decode') {
  const res = await fetch(`${API_BASE}/api/encode-decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Process failed' }));
    throw new Error(err.error || `Encoding failed (${res.status})`);
  }

  return res.json();
}

/**
 * Passive Threat Intelligence & Infrastructure Reputation Analysis
 */
export async function analyzeReputation(input: string) {
  const res = await fetch(`${API_BASE}/api/threat-reputation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || `Reputation analysis failed (${res.status})`);
  }

  return res.json();
}

/**
 * GEOINT Sun & Shadow Position Calculator
 */
export async function computeSunCalc(lat: number, lon: number, date: string, objectHeight: number = 1.0) {
  const res = await fetch(`${API_BASE}/api/sun-calc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, date, objectHeight }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Calculation failed' }));
    throw new Error(err.error || `Sun calculation failed (${res.status})`);
  }

  return res.json();
}

