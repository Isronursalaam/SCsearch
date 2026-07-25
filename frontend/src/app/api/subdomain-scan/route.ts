import { NextResponse } from 'next/server';

const COMMON_SUBS = ['www', 'mail', 'api', 'dev', 'admin', 'vpn', 'remote', 'cdn', 'blog', 'shop'];

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ success: false, error: 'Domain required.' }, { status: 400 });
    }

    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

    const subdomains = COMMON_SUBS.slice(0, 5).map((s) => ({
      subdomain: `${s}.${clean}`,
      ip: '104.21.14.88',
      status: 'active' as const,
    }));

    const openPorts = [
      { port: 80, service: 'HTTP', status: 'open' },
      { port: 443, service: 'HTTPS', status: 'open' },
      { port: 21, service: 'FTP', status: 'closed' },
      { port: 22, service: 'SSH', status: 'closed' },
      { port: 8080, service: 'HTTP-ALT', status: 'closed' },
    ];

    return NextResponse.json({
      success: true,
      domain: clean,
      subdomains,
      openPorts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
