export interface SunCalcResult {
  latitude: number;
  longitude: number;
  dateTime: string;
  objectHeight: number;
  solarAltitude: number; // Elevation angle in degrees
  solarAzimuth: number;  // Sun direction in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  shadowLength: number;  // Calculated shadow length in meters
  shadowAzimuth: number; // Direction the shadow points (opposite of sun)
  sunStatus: 'Above Horizon' | 'Below Horizon (Night)' | 'Twilight' | 'Golden Hour';
  ephemeris: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dawnCivil: string;
    duskCivil: string;
    dayLength: string;
    maxAltitude: number;
  };
}

/**
 * Astronomical Solar Position Calculation (GEOINT Chronolocation - SunCalc.org Engine)
 */
export function calculateSunPosition(
  lat: number,
  lon: number,
  dateStr: string,
  objectHeight: number = 1.7
): SunCalcResult {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getUTCHours() + date.getUTCMinutes() / 60 - 12) / 24);

  // Equation of time (in minutes)
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar Declination (in radians)
  const decl = 0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes
  const timeOffset = eqtime + 4 * lon;
  const tst = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + timeOffset;

  // Solar Hour Angle (in degrees)
  let ha = (tst / 4) - 180;
  if (ha < -180) ha += 360;

  const latRad = toRadians(lat);
  const haRad = toRadians(ha);

  // Solar Zenith Angle
  const cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const elevationRad = (Math.PI / 2) - zenithRad;
  const solarAltitude = toDegrees(elevationRad);

  // Solar Azimuth Angle
  const cosAzimuth = (Math.sin(decl) - Math.sin(latRad) * Math.sin(elevationRad)) / (Math.cos(latRad) * Math.cos(elevationRad));
  let azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
  let solarAzimuth = toDegrees(azimuthRad);

  if (ha > 0) {
    solarAzimuth = 360 - solarAzimuth;
  }

  // Shadow Calculation
  let shadowLength = 0;
  if (solarAltitude > 0) {
    shadowLength = objectHeight / Math.tan(elevationRad);
  }

  const shadowAzimuth = (solarAzimuth + 180) % 360;

  let sunStatus: SunCalcResult['sunStatus'] = 'Above Horizon';
  if (solarAltitude > 0 && solarAltitude <= 6) sunStatus = 'Golden Hour';
  else if (solarAltitude <= 0 && solarAltitude >= -6) sunStatus = 'Twilight';
  else if (solarAltitude < -6) sunStatus = 'Below Horizon (Night)';

  // Ephemeris calculation (Sunrise, Sunset, Solar Noon)
  const solarNoonMinutes = 720 - 4 * lon - eqtime;
  const haSunriseRad = Math.acos(-Math.tan(latRad) * Math.tan(decl));
  const haSunriseDeg = toDegrees(isNaN(haSunriseRad) ? 0 : haSunriseRad);

  const sunriseMinutes = solarNoonMinutes - haSunriseDeg * 4;
  const sunsetMinutes = solarNoonMinutes + haSunriseDeg * 4;

  const dawnMinutes = sunriseMinutes - 24; // Civil twilight ~24 mins before
  const duskMinutes = sunsetMinutes + 24;

  const maxAltitude = 90 - Math.abs(lat - toDegrees(decl));

  const dayLengthMins = Math.max(0, sunsetMinutes - sunriseMinutes);
  const dayLengthHoursStr = `${Math.floor(dayLengthMins / 60)}j ${Math.floor(dayLengthMins % 60)}m`;

  return {
    latitude: lat,
    longitude: lon,
    dateTime: date.toISOString(),
    objectHeight,
    solarAltitude: Number(solarAltitude.toFixed(2)),
    solarAzimuth: Number(solarAzimuth.toFixed(2)),
    shadowLength: Number(shadowLength.toFixed(2)),
    shadowAzimuth: Number(shadowAzimuth.toFixed(2)),
    sunStatus,
    ephemeris: {
      sunrise: formatMinutesToUTC(sunriseMinutes),
      sunset: formatMinutesToUTC(sunsetMinutes),
      solarNoon: formatMinutesToUTC(solarNoonMinutes),
      dawnCivil: formatMinutesToUTC(dawnMinutes),
      duskCivil: formatMinutesToUTC(duskMinutes),
      dayLength: dayLengthHoursStr,
      maxAltitude: Number(maxAltitude.toFixed(1)),
    },
  };
}

function formatMinutesToUTC(totalMinutes: number): string {
  if (isNaN(totalMinutes)) return '--:-- UTC';
  let mins = (totalMinutes + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} UTC`;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
