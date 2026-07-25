import dns from 'dns/promises';

// ─── Types ───

export interface WhoisInfo {
  domainName: string;
  registrar: string | null;
  creationDate: string | null;
  expirationDate: string | null;
  updatedDate: string | null;
  nameServers: string[];
  status: string[];
  dnssec: string | null;
  raw: string;
}

export interface DnsRecords {
  a: string[];
  aaaa: string[];
  mx: Array<{ priority: number; exchange: string }>;
  ns: string[];
  txt: string[];
  cname: string[];
  soa: {
    nsname: string;
    hostmaster: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  } | null;
}

export interface GeoIpInfo {
  ip: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  regionName: string | null;
  city: string | null;
  zip: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  as: string | null;
}

export interface DomainLookupResult {
  domain: string;
  whois: WhoisInfo | null;
  dns: DnsRecords | null;
  geoip: GeoIpInfo | null;
  error?: string;
}

// ─── WHOIS via whois-json-like parsing ───

/**
 * Perform WHOIS lookup using raw TCP connection to whois servers.
 */
async function performWhois(domain: string): Promise<WhoisInfo | null> {
  try {
    const net = await import('net');
    
    const rawWhois = await new Promise<string>((resolve, reject) => {
      const socket = new net.Socket();
      let data = '';
      
      socket.setTimeout(10000);
      socket.connect(43, 'whois.verisign-grs.com', () => {
        socket.write(`${domain}\r\n`);
      });
      
      socket.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      
      socket.on('end', () => resolve(data));
      socket.on('timeout', () => { socket.destroy(); reject(new Error('WHOIS timeout')); });
      socket.on('error', (err: Error) => reject(err));
    });

    // Try to find the registrar WHOIS server and query it
    const referralMatch = rawWhois.match(/Registrar WHOIS Server:\s*(.+)/i);
    let detailedWhois = rawWhois;
    
    if (referralMatch && referralMatch[1]) {
      const referralServer = referralMatch[1].trim();
      try {
        const net2 = await import('net');
        detailedWhois = await new Promise<string>((resolve, reject) => {
          const socket = new net2.Socket();
          let data = '';
          
          socket.setTimeout(10000);
          socket.connect(43, referralServer, () => {
            socket.write(`${domain}\r\n`);
          });
          
          socket.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });
          
          socket.on('end', () => resolve(data));
          socket.on('timeout', () => { socket.destroy(); resolve(rawWhois); });
          socket.on('error', () => resolve(rawWhois));
        });
      } catch {
        detailedWhois = rawWhois;
      }
    }

    // Parse WHOIS response
    const getField = (pattern: RegExp): string | null => {
      const match = detailedWhois.match(pattern);
      return match ? match[1].trim() : null;
    };

    const getMultiField = (pattern: RegExp): string[] => {
      const matches = [...detailedWhois.matchAll(new RegExp(pattern, 'gi'))];
      return matches.map(m => m[1].trim()).filter(Boolean);
    };

    return {
      domainName: getField(/Domain Name:\s*(.+)/i) || domain,
      registrar: getField(/Registrar:\s*(.+)/i),
      creationDate: getField(/Creat(?:ion|ed) Date:\s*(.+)/i),
      expirationDate: getField(/(?:Registry Expiry|Expir(?:ation|y)) Date:\s*(.+)/i),
      updatedDate: getField(/Updated Date:\s*(.+)/i),
      nameServers: getMultiField(/Name Server:\s*(.+)/i),
      status: getMultiField(/(?:Domain )?Status:\s*(.+)/i),
      dnssec: getField(/DNSSEC:\s*(.+)/i),
      raw: detailedWhois,
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return null;
  }
}

// ─── DNS Records ───

async function lookupDns(domain: string): Promise<DnsRecords | null> {
  try {
    const records: DnsRecords = {
      a: [],
      aaaa: [],
      mx: [],
      ns: [],
      txt: [],
      cname: [],
      soa: null,
    };

    // Run all DNS queries in parallel
    const queries = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
      dns.resolveMx(domain),
      dns.resolveNs(domain),
      dns.resolveTxt(domain),
      dns.resolveCname(domain),
      dns.resolveSoa(domain),
    ]);

    if (queries[0].status === 'fulfilled') records.a = queries[0].value;
    if (queries[1].status === 'fulfilled') records.aaaa = queries[1].value;
    if (queries[2].status === 'fulfilled') records.mx = queries[2].value.map(r => ({ priority: r.priority, exchange: r.exchange }));
    if (queries[3].status === 'fulfilled') records.ns = queries[3].value;
    if (queries[4].status === 'fulfilled') records.txt = queries[4].value.map(t => t.join(''));
    if (queries[5].status === 'fulfilled') records.cname = queries[5].value;
    if (queries[6].status === 'fulfilled') records.soa = queries[6].value;

    return records;
  } catch (error) {
    console.error('DNS lookup failed:', error);
    return null;
  }
}

// ─── GeoIP (using ip-api.com, free, no key) ───

async function lookupGeoIp(ip: string): Promise<GeoIpInfo | null> {
  try {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status !== 'success') return null;

    return {
      ip: data.query || ip,
      country: data.country || null,
      countryCode: data.countryCode || null,
      region: data.region || null,
      regionName: data.regionName || null,
      city: data.city || null,
      zip: data.zip || null,
      lat: data.lat ?? null,
      lon: data.lon ?? null,
      timezone: data.timezone || null,
      isp: data.isp || null,
      org: data.org || null,
      as: data.as || null,
    };
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return null;
  }
}

// ─── Main Lookup Function ───

/**
 * Perform a full domain/IP investigation: WHOIS + DNS + GeoIP.
 */
export async function domainLookup(input: string): Promise<DomainLookupResult> {
  // Clean the input
  const domain = input.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

  // Check if it's an IP address
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);

  let whois: WhoisInfo | null = null;
  let dnsRecords: DnsRecords | null = null;
  let geoip: GeoIpInfo | null = null;

  if (isIp) {
    // IP address — only GeoIP
    geoip = await lookupGeoIp(domain);
  } else {
    // Domain — WHOIS + DNS + GeoIP
    const [whoisResult, dnsResult] = await Promise.allSettled([
      performWhois(domain),
      lookupDns(domain),
    ]);

    whois = whoisResult.status === 'fulfilled' ? whoisResult.value : null;
    dnsRecords = dnsResult.status === 'fulfilled' ? dnsResult.value : null;

    // Get GeoIP from first A record
    if (dnsRecords && dnsRecords.a.length > 0) {
      geoip = await lookupGeoIp(dnsRecords.a[0]);
    }
  }

  return {
    domain,
    whois,
    dns: dnsRecords,
    geoip,
  };
}
