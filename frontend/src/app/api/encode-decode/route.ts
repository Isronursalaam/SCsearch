import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { input, mode } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ success: false, error: 'Input required.' }, { status: 400 });
    }

    if (mode === 'encode') {
      const base64 = Buffer.from(input).toString('base64');
      const urlEncoded = encodeURIComponent(input);
      const hex = Buffer.from(input).toString('hex');
      const binary = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

      return NextResponse.json({
        success: true,
        input,
        base64,
        urlEncoded,
        hex,
        binary,
      });
    } else {
      let base64 = '', urlEncoded = '', hex = '';
      try { base64 = Buffer.from(input, 'base64').toString('utf-8'); } catch { base64 = 'Invalid Base64'; }
      try { urlEncoded = decodeURIComponent(input); } catch { urlEncoded = 'Invalid URL'; }
      try { hex = Buffer.from(input, 'hex').toString('utf-8'); } catch { hex = 'Invalid Hex'; }

      return NextResponse.json({
        success: true,
        input,
        base64,
        urlEncoded,
        hex,
        binary: input,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
