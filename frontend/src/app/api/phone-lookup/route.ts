import { NextResponse } from 'next/server';

const COUNTRY_CODES: Record<string, { code: string; name: string; prefix: string }> = {
  '62': { code: 'ID', name: 'Indonesia', prefix: '+62' },
  '1': { code: 'US', name: 'United States / Canada', prefix: '+1' },
  '44': { code: 'GB', name: 'United Kingdom', prefix: '+44' },
  '61': { code: 'AU', name: 'Australia', prefix: '+61' },
  '91': { code: 'IN', name: 'India', prefix: '+91' },
  '81': { code: 'JP', name: 'Japan', prefix: '+81' },
  '65': { code: 'SG', name: 'Singapore', prefix: '+65' },
  '60': { code: 'MY', name: 'Malaysia', prefix: '+60' },
  '49': { code: 'DE', name: 'Germany', prefix: '+49' },
  '33': { code: 'FR', name: 'France', prefix: '+33' },
};

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ success: false, error: 'Phone number required.' }, { status: 400 });
    }

    const cleaned = phone.replace(/[^0-9+]/g, '');
    let numDigits = cleaned.replace(/\+/g, '');
    if (numDigits.startsWith('0')) numDigits = '62' + numDigits.substring(1);

    let countryCode: string | null = null;
    let countryName: string | null = null;
    let prefix = '';

    for (const [codeKey, countryObj] of Object.entries(COUNTRY_CODES)) {
      if (numDigits.startsWith(codeKey)) {
        countryCode = countryObj.code;
        countryName = countryObj.name;
        prefix = countryObj.prefix;
        break;
      }
    }

    const isValid = numDigits.length >= 8 && numDigits.length <= 15;
    const e164 = `+${numDigits}`;
    const intl = prefix ? `${prefix} ${numDigits.substring(prefix.length - 1)}` : e164;

    let carrier: string | null = null;
    let lineType = 'Unknown';

    if (numDigits.startsWith('628')) {
      lineType = 'Mobile';
      const sub = numDigits.substring(3, 5);
      if (['11', '12', '13', '21', '22', '52', '53'].includes(sub)) carrier = 'Telkomsel';
      else if (['14', '15', '16', '55', '56', '57', '58'].includes(sub)) carrier = 'Indosat Ooredoo';
      else if (['17', '18', '19', '59', '77', '78'].includes(sub)) carrier = 'XL Axiata';
      else if (['95', '96', '97', '98', '99'].includes(sub)) carrier = 'Smartfren';
      else if (['31', '32', '33', '38'].includes(sub)) carrier = 'Tri (3)';
    } else if (isValid) {
      lineType = numDigits.length > 10 ? 'Mobile' : 'Landline';
    }

    return NextResponse.json({
      success: true,
      phoneNumber: phone,
      isValid,
      countryCode,
      countryName,
      location: countryName,
      carrier,
      lineType,
      formattedE164: e164,
      formattedInternational: intl,
      formattedNational: cleaned,
      whatsAppStatus: {
        directUrl: `https://wa.me/${numDigits}`,
        note: 'Direct WhatsApp API click-to-chat URL',
      },
      possibleTelegramUrl: `https://t.me/+${numDigits}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
