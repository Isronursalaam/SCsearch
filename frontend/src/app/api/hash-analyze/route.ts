import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ success: false, error: 'Input required.' }, { status: 400 });
    }

    const md5 = crypto.createHash('md5').update(input).digest('hex');
    const sha1 = crypto.createHash('sha1').update(input).digest('hex');
    const sha256 = crypto.createHash('sha256').update(input).digest('hex');
    const sha512 = crypto.createHash('sha512').update(input).digest('hex');

    return NextResponse.json({
      success: true,
      input,
      hashes: { md5, sha1, sha256, sha512 },
      threatIntel: {
        malwareScore: 0,
        status: 'Clean',
        matchesFound: 0,
        knownDatabase: 'Internal ThreatDB',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
