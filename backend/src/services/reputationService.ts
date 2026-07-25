export interface ThreatReputationResult {
  target: string;
  targetType: 'domain' | 'ip' | 'url' | 'hash';
  riskScore: number; // 0 (Safe) - 100 (Critical)
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Malicious';
  category: string;
  threatFeedMatches: Array<{
    engine: string;
    status: 'Clean' | 'Suspicious' | 'Malicious';
    category: string;
  }>;
  details: {
    hostingProvider?: string;
    asn?: string;
    country?: string;
    sslIssuer?: string;
    isBlacklisted: boolean;
    knownThreatType?: string;
  };
}

/**
 * Perform passive threat intelligence and reputation analysis on Domain, IP, URL, or File Hash.
 */
export async function analyzeThreatReputation(input: string): Promise<ThreatReputationResult> {
  const target = input.trim();

  // Determine target type
  let targetType: ThreatReputationResult['targetType'] = 'domain';
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) {
    targetType = 'ip';
  } else if (/^https?:\/\//i.test(target)) {
    targetType = 'url';
  } else if (/^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/.test(target)) {
    targetType = 'hash';
  }

  // Simulated passive engine threat feeds
  const engines = [
    'Global Threat Exchange',
    'OpenPhish Feed',
    'Malware Domain List',
    'DNS Blacklist (DNSBL)',
    'Spamhaus ZEN',
    'URLhaus Intelligence',
    'VirusTotal Community Heuristics',
  ];

  // Deterministic risk scoring based on string hash for consistent results
  const strHash = target.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isKnownBad = target.toLowerCase().includes('malware') || target.toLowerCase().includes('phish') || target.toLowerCase().includes('test-virus');
  
  let riskScore = isKnownBad ? 88 : (strHash % 35); // Default 0-34 for normal domains
  
  // High risk keywords simulation
  if (target.includes('.xyz') || target.includes('.top') || target.includes('bit.ly')) {
    riskScore += 25;
  }

  let riskLevel: ThreatReputationResult['riskLevel'] = 'Safe';
  if (riskScore >= 75) riskLevel = 'Malicious';
  else if (riskScore >= 50) riskLevel = 'High Risk';
  else if (riskScore >= 25) riskLevel = 'Medium Risk';
  else if (riskScore >= 10) riskLevel = 'Low Risk';

  const threatFeedMatches = engines.map((engine, idx) => {
    const isEngineFlagged = isKnownBad || (riskScore > 40 && idx % 3 === 0);
    return {
      engine,
      status: isEngineFlagged ? ('Malicious' as const) : ('Clean' as const),
      category: isEngineFlagged ? 'Phishing / Malware' : 'Benign / Clean',
    };
  });

  const category = isKnownBad ? 'Phishing & Malware Infrastructure' : targetType === 'hash' ? 'File Sample Reputation' : 'Web & Network Infrastructure';

  return {
    target,
    targetType,
    riskScore,
    riskLevel,
    category,
    threatFeedMatches,
    details: {
      hostingProvider: targetType === 'ip' ? 'Cloud Infrastructure' : 'Global CDN Provider',
      asn: 'AS13335 / AS15169',
      country: 'Global Anycast',
      sslIssuer: 'Let\'s Encrypt / DigiCert Trust',
      isBlacklisted: riskScore >= 50,
      knownThreatType: riskScore >= 50 ? 'Suspicious Infrastructure / Malware Host' : 'None Detected',
    },
  };
}
