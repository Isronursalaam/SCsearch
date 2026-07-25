import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL required.' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 SCsearch OSINT Header Audit' },
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const audit = [
      {
        header: 'Strict-Transport-Security (HSTS)',
        status: headers['strict-transport-security'] ? 'pass' : 'fail',
        description: headers['strict-transport-security'] ? 'HSTS is enabled.' : 'Missing HSTS header.',
      },
      {
        header: 'Content-Security-Policy (CSP)',
        status: headers['content-security-policy'] ? 'pass' : 'fail',
        description: headers['content-security-policy'] ? 'CSP defined.' : 'Missing CSP header.',
      },
      {
        header: 'X-Frame-Options',
        status: headers['x-frame-options'] ? 'pass' : 'warning',
        description: headers['x-frame-options'] ? `Set to "${headers['x-frame-options']}".` : 'Missing X-Frame-Options.',
      },
      {
        header: 'X-Content-Type-Options',
        status: headers['x-content-type-options'] === 'nosniff' ? 'pass' : 'fail',
        description: headers['x-content-type-options'] === 'nosniff' ? 'Set to "nosniff".' : 'Missing nosniff.',
      },
    ];

    return NextResponse.json({
      success: true,
      url: targetUrl,
      statusCode: response.status,
      server: headers['server'] || null,
      score: headers['strict-transport-security'] && headers['content-security-policy'] ? 'A+' : 'B',
      headers,
      securityAudit: audit,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
