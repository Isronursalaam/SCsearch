declare module 'exif-parser' {
  interface ExifTags {
    Make?: string;
    Model?: string;
    Orientation?: number;
    DateTimeOriginal?: number;
    GPSLatitude?: number;
    GPSLongitude?: number;
    [key: string]: unknown;
  }

  interface ExifResult {
    tags: ExifTags;
    imageSize?: {
      width: number;
      height: number;
    };
    thumbnailOffset?: number;
    thumbnailLength?: number;
    thumbnailType?: number;
    app1Offset?: number;
  }

  interface ExifParser {
    parse(): ExifResult;
  }

  interface ExifParserFactory {
    create(buffer: Buffer): ExifParser;
  }

  const factory: ExifParserFactory;
  export default factory;
}
