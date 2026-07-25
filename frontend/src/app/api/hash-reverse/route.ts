import { NextResponse } from 'next/server';
import crypto from 'crypto';

const COMMON_DICTIONARY = [
  'admin', 'password', '123456', '12345678', '123456789', '12345', 'secret',
  'root', 'user', 'welcome', 'login', 'pass', '1234', 'qwerty', 'master',
  'indonesia', 'jakarta', 'bandung', 'surabaya', 'scsearch', 'osint',
  'hacker', 'security', 'admin123', 'password123', 'iloveyou', 'sunshine',
];

export async function POST(req: Request) {
  try {
    const { hash } = await req.json();
    if (!hash || typeof hash !== 'string') {
      return NextResponse.json({ success: false, error: 'Hash string required.' }, { status: 400 });
    }

    const cleanHash = hash.trim().toLowerCase();
    let hashType = 'Unknown';
    if (cleanHash.length === 32) hashType = 'MD5';
    else if (cleanHash.length === 40) hashType = 'SHA1';
    else if (cleanHash.length === 64) hashType = 'SHA256';

    for (const plain of COMMON_DICTIONARY) {
      const md5 = crypto.createHash('md5').update(plain).digest('hex');
      const sha1 = crypto.createHash('sha1').update(plain).digest('hex');
      const sha256 = crypto.createHash('sha256').update(plain).digest('hex');

      if (cleanHash === md5 || cleanHash === sha1 || cleanHash === sha256) {
        return NextResponse.json({
          success: true,
          hash: cleanHash,
          hashType,
          found: true,
          plainText: plain,
          method: 'Internal Wordlist Dictionary',
        });
      }
    }

    try {
      if (hashType === 'MD5') {
        const res = await fetch(`https://api.hashify.net/hash/md5/decrypter?hash=${cleanHash}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.plaintext) {
            return NextResponse.json({
              success: true,
              hash: cleanHash,
              hashType,
              found: true,
              plainText: json.plaintext,
              method: 'Online Hash DB (Hashify)',
            });
          }
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      hash: cleanHash,
      hashType,
      found: false,
      plainText: null,
      method: 'Local Wordlist + Online DB',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
