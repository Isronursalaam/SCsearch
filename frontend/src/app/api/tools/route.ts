import { NextResponse } from 'next/server';

const TOOLS = [
  { id: 'google-images', name: 'Google Images (Reverse)', description: 'Google reverse image search.', url: 'https://images.google.com', category: 'image-recon', categoryLabel: 'Image Recon', isFree: true, tags: ['reverse image'] },
  { id: 'tineye', name: 'TinEye', description: 'Dedicated reverse image search engine.', url: 'https://tineye.com', category: 'image-recon', categoryLabel: 'Image Recon', isFree: true, tags: ['reverse image'] },
  { id: 'whois-lookup', name: 'WHOIS Lookup', description: 'Query domain registration records.', url: 'https://whois.domaintools.com', category: 'domain-ip', categoryLabel: 'Domain & IP', isFree: true, tags: ['whois'] },
  { id: 'shodan', name: 'Shodan', description: 'Search engine for internet-connected devices.', url: 'https://www.shodan.io', category: 'domain-ip', categoryLabel: 'Domain & IP', isFree: false, tags: ['devices'] },
  { id: 'haveibeenpwned', name: 'Have I Been Pwned', description: 'Check email in known breaches.', url: 'https://haveibeenpwned.com', category: 'email-username', categoryLabel: 'Email & Username', isFree: true, tags: ['breach'] },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase();

  let filtered = TOOLS;
  if (cat && cat !== 'all') filtered = filtered.filter(t => t.category === cat);
  if (q) filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));

  return NextResponse.json({
    success: true,
    count: filtered.length,
    tools: filtered,
  });
}
