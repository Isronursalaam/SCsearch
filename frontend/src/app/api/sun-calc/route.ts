import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lat, lon, date, objectHeight } = await req.json();
    if (lat == null || lon == null) {
      return NextResponse.json({ success: false, error: 'Latitude and longitude required.' }, { status: 400 });
    }

    const d = new Date(date || new Date().toISOString());
    const dayOfYear = getDayOfYear(d);
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (d.getUTCHours() + d.getUTCMinutes() / 60 - 12) / 24);

    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    const timeOffset = eqtime + 4 * lon;
    const tst = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + timeOffset;

    let ha = (tst / 4) - 180;
    if (ha < -180) ha += 360;

    const latRad = (lat * Math.PI) / 180;
    const haRad = (ha * Math.PI) / 180;

    const cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
    const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
    const elevationRad = (Math.PI / 2) - zenithRad;
    const solarAltitude = (elevationRad * 180) / Math.PI;

    const cosAzimuth = (Math.sin(decl) - Math.sin(latRad) * Math.sin(elevationRad)) / (Math.cos(latRad) * Math.cos(elevationRad));
    let azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
    let solarAzimuth = (azimuthRad * 180) / Math.PI;
    if (ha > 0) solarAzimuth = 360 - solarAzimuth;

    const height = Number(objectHeight) || 1.7;
    let shadowLength = 0;
    if (solarAltitude > 0) {
      shadowLength = height / Math.tan(elevationRad);
    }
    const shadowAzimuth = (solarAzimuth + 180) % 360;

    let sunStatus = 'Above Horizon';
    if (solarAltitude > 0 && solarAltitude <= 6) sunStatus = 'Golden Hour';
    else if (solarAltitude <= 0 && solarAltitude >= -6) sunStatus = 'Twilight';
    else if (solarAltitude < -6) sunStatus = 'Below Horizon (Night)';

    const solarNoonMinutes = 720 - 4 * lon - eqtime;
    const haSunriseRad = Math.acos(-Math.tan(latRad) * Math.tan(decl));
    const haSunriseDeg = (isNaN(haSunriseRad) ? 0 : haSunriseRad * 180) / Math.PI;

    const sunriseMinutes = solarNoonMinutes - haSunriseDeg * 4;
    const sunsetMinutes = solarNoonMinutes + haSunriseDeg * 4;
    const dayLengthMins = Math.max(0, sunsetMinutes - sunriseMinutes);

    return NextResponse.json({
      success: true,
      latitude: lat,
      longitude: lon,
      dateTime: d.toISOString(),
      objectHeight: height,
      solarAltitude: Number(solarAltitude.toFixed(2)),
      solarAzimuth: Number(solarAzimuth.toFixed(2)),
      shadowLength: Number(shadowLength.toFixed(2)),
      shadowAzimuth: Number(shadowAzimuth.toFixed(2)),
      sunStatus,
      ephemeris: {
        sunrise: formatMinutesToUTC(sunriseMinutes),
        sunset: formatMinutesToUTC(sunsetMinutes),
        solarNoon: formatMinutesToUTC(solarNoonMinutes),
        dawnCivil: formatMinutesToUTC(sunriseMinutes - 24),
        duskCivil: formatMinutesToUTC(sunsetMinutes + 24),
        dayLength: `${Math.floor(dayLengthMins / 60)}j ${Math.floor(dayLengthMins % 60)}m`,
        maxAltitude: Number((90 - Math.abs(lat - (decl * 180 / Math.PI))).toFixed(1)),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function formatMinutesToUTC(totalMinutes: number): string {
  if (isNaN(totalMinutes)) return '--:-- UTC';
  let mins = (totalMinutes + 1440) % 1440;
  return `${Math.floor(mins / 60).toString().padStart(2, '0')}:${Math.floor(mins % 60).toString().padStart(2, '0')} UTC`;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
