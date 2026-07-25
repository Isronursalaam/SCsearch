import dns from 'dns/promises';

// ─── Types ───

export interface EmailIntelResult {
  email: string;
  isValid: boolean;
  domain: string;
  username: string;
  mxRecords: Array<{ priority: number; exchange: string }>;
  hasMxRecords: boolean;
  isDisposable: boolean;
  isFreeProvider: boolean;
  providerName: string | null;
  domainAge: string | null;
  breachInfo: {
    found: boolean;
    count: number;
    breaches: Array<{
      name: string;
      date: string;
      description: string;
      dataTypes: string[];
    }>;
  };
  socialProfiles: Array<{
    platform: string;
    url: string;
    status: 'likely' | 'possible' | 'unknown';
    icon: string;
  }>;
}

// ─── Known Providers ───

const FREE_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.id', 'yahoo.co.uk',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'tuta.com',
  'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
  'fastmail.com', 'hey.com',
]);

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'temp-mail.org', '10minutemail.com',
  'maildrop.cc', 'harakirimail.com', 'fakeinbox.com',
]);

const PROVIDER_NAMES: Record<string, string> = {
  'gmail.com': 'Google Gmail',
  'googlemail.com': 'Google Gmail',
  'yahoo.com': 'Yahoo Mail',
  'hotmail.com': 'Microsoft Outlook',
  'outlook.com': 'Microsoft Outlook',
  'live.com': 'Microsoft Live',
  'protonmail.com': 'ProtonMail',
  'proton.me': 'Proton Mail',
  'icloud.com': 'Apple iCloud',
  'zoho.com': 'Zoho Mail',
  'yandex.com': 'Yandex Mail',
  'aol.com': 'AOL Mail',
  'tutanota.com': 'Tutanota',
  'fastmail.com': 'Fastmail',
};

// ─── Email Validation ───

function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email) && email.includes('.');
}

// ─── Breach Check (simulated with common known breaches) ───

function simulateBreachCheck(email: string): EmailIntelResult['breachInfo'] {
  // This simulates what HIBP would return. In production, 
  // you'd use the HIBP API (requires API key) or similar service.
  const domain = email.split('@')[1].toLowerCase();
  
  // Simulate by returning commonly known breaches based on provider
  const commonBreaches = [
    {
      name: 'Collection #1',
      date: '2019-01-07',
      description: 'A large collection of credential stuffing lists shared on hacking forums, containing 773 million unique email addresses.',
      dataTypes: ['Email addresses', 'Passwords'],
    },
    {
      name: 'LinkedIn',
      date: '2021-06-22',
      description: '700M LinkedIn user records scraped and published, including email addresses, phone numbers, and professional details.',
      dataTypes: ['Email addresses', 'Names', 'Phone numbers', 'Professional info'],
    },
    {
      name: 'Adobe',
      date: '2013-10-04',
      description: '153 million Adobe accounts were breached, exposing email addresses, encrypted passwords, and password hints.',
      dataTypes: ['Email addresses', 'Passwords', 'Password hints'],
    },
  ];

  // Simple hash-based "randomization" for demo purposes
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const breachCount = hash % 4; // 0-3 breaches

  return {
    found: breachCount > 0,
    count: breachCount,
    breaches: commonBreaches.slice(0, breachCount),
  };
}

// ─── Social Profile Estimation ───

function estimateSocialProfiles(username: string, domain: string): EmailIntelResult['socialProfiles'] {
  const profiles: EmailIntelResult['socialProfiles'] = [];

  // If it's a gmail/personal email, the username might be used on social platforms
  if (FREE_PROVIDERS.has(domain)) {
    profiles.push(
      { platform: 'GitHub', url: `https://github.com/${username}`, status: 'possible', icon: '🐙' },
      { platform: 'Twitter/X', url: `https://x.com/${username}`, status: 'possible', icon: '𝕏' },
      { platform: 'Instagram', url: `https://instagram.com/${username}`, status: 'possible', icon: '📸' },
      { platform: 'LinkedIn', url: `https://linkedin.com/in/${username}`, status: 'possible', icon: '💼' },
      { platform: 'Reddit', url: `https://reddit.com/user/${username}`, status: 'possible', icon: '🔴' },
    );
  }

  // Gravatar (uses email hash)
  profiles.push({
    platform: 'Gravatar',
    url: `https://en.gravatar.com/${username}`,
    status: 'possible',
    icon: '🌐',
  });

  return profiles;
}

// ─── Main Lookup Function ───

/**
 * Perform comprehensive email intelligence lookup.
 */
export async function emailLookup(email: string): Promise<EmailIntelResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const [username, domain] = normalizedEmail.split('@');

  const valid = isValidEmail(normalizedEmail);

  // Lookup MX records for the domain
  let mxRecords: Array<{ priority: number; exchange: string }> = [];
  try {
    const mx = await dns.resolveMx(domain);
    mxRecords = mx.map(r => ({ priority: r.priority, exchange: r.exchange }))
      .sort((a, b) => a.priority - b.priority);
  } catch {
    // MX lookup failed
  }

  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeProvider = FREE_PROVIDERS.has(domain);
  const providerName = PROVIDER_NAMES[domain] || null;

  // Breach check
  const breachInfo = simulateBreachCheck(normalizedEmail);

  // Social profiles
  const socialProfiles = estimateSocialProfiles(username, domain);

  return {
    email: normalizedEmail,
    isValid: valid,
    domain,
    username,
    mxRecords,
    hasMxRecords: mxRecords.length > 0,
    isDisposable,
    isFreeProvider,
    providerName,
    domainAge: null,
    breachInfo,
    socialProfiles,
  };
}
