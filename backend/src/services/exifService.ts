import exifParser from 'exif-parser';
import sharp from 'sharp';

export interface ImageMetadata {
  fileName: string;
  fileSize: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  resolution: string | null;
  camera: string | null;
  lens: string | null;
  dateTaken: string | null;
  gps: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  colorSpace: string | null;
  orientation: number | null;
}

/**
 * Extract EXIF metadata from an image buffer.
 */
export async function extractMetadata(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ImageMetadata> {
  const fileSizeKB = (buffer.length / 1024).toFixed(1);
  const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  const fileSize = buffer.length > 1024 * 1024
    ? `${fileSizeMB} MB`
    : `${fileSizeKB} KB`;

  // Get image dimensions via sharp
  let width: number | null = null;
  let height: number | null = null;
  let resolution: string | null = null;

  try {
    const sharpMeta = await sharp(buffer).metadata();
    width = sharpMeta.width ?? null;
    height = sharpMeta.height ?? null;
    if (width && height) {
      resolution = `${width} × ${height}`;
    }
  } catch {
    // sharp failed — not a supported image format
  }

  // Try EXIF parsing (works best with JPEG)
  let camera: string | null = null;
  let lens: string | null = null;
  let dateTaken: string | null = null;
  let gps: { latitude: number | null; longitude: number | null } | null = null;
  let orientation: number | null = null;

  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    const tags = result.tags;

    if (tags) {
      camera = [tags.Make, tags.Model].filter(Boolean).join(' ') || null;
      lens = (tags as Record<string, unknown>).LensModel as string || null;
      orientation = tags.Orientation ?? null;

      if (tags.DateTimeOriginal) {
        dateTaken = new Date(tags.DateTimeOriginal * 1000).toISOString();
      }

      if (tags.GPSLatitude !== undefined && tags.GPSLongitude !== undefined) {
        gps = {
          latitude: tags.GPSLatitude,
          longitude: tags.GPSLongitude,
        };
      }
    }
  } catch {
    // EXIF parsing failed — not a JPEG or no EXIF data
  }

  return {
    fileName,
    fileSize,
    mimeType,
    width,
    height,
    resolution,
    camera,
    lens,
    dateTaken,
    gps,
    colorSpace: null,
    orientation,
  };
}
