import { NextResponse } from 'next/server';

const MAC_DATABASE: Record<string, string> = {
  '00:05:02': 'Apple, Inc.',
  '00:0A:95': 'Apple, Inc.',
  '00:11:24': 'Apple, Inc.',
  '00:00:0C': 'Cisco Systems, Inc.',
  '00:00:F8': 'Intel Corporation',
  '00:02:78': 'Samsung Electronics Co.,Ltd',
  '00:18:AF': 'Huawei Technologies Co., Ltd.',
  '00:0A:EB': 'TP-Link Technologies Co., Ltd.',
  '00:E0:4C': 'Realtek Semiconductor Corp.',
  'B8:27:EB': 'Raspberry Pi Foundation',
  'DC:A6:32': 'Raspberry Pi Trading Ltd',
};

export async function POST(req: Request) {
  try {
    const { mac } = await req.json();
    if (!mac || typeof mac !== 'string') {
      return NextResponse.json({ success: false, error: 'MAC address required.' }, { status: 400 });
    }

    const clean = mac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (clean.length < 6) {
      return NextResponse.json({ success: false, error: 'Valid MAC requires at least 6 hex chars.' }, { status: 400 });
    }

    const formatted = clean.match(/.{1,2}/g)?.slice(0, 6).join(':') || mac;
    const oui = clean.substring(0, 6).match(/.{1,2}/g)?.join(':') || '';
    let vendor = MAC_DATABASE[oui] || null;

    if (!vendor) {
      try {
        const res = await fetch(`https://api.macvendors.com/${encodeURIComponent(formatted)}`);
        if (res.ok) vendor = await res.text();
      } catch {}
    }

    const firstByte = parseInt(clean.substring(0, 2), 16);
    return NextResponse.json({
      success: true,
      mac,
      normalizedMac: formatted,
      vendor: vendor || 'Unknown Vendor / Unregistered OUI',
      ouiPrefix: oui,
      isMulticast: (firstByte & 1) === 1,
      isLocalAddress: (firstByte & 2) === 2,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
