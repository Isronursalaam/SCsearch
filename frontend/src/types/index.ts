// ─── OSINT Tool Types ───

export interface OsintTool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'image-recon' | 'domain-ip' | 'email-username';
  categoryLabel: string;
  isFree: boolean;
  tags: string[];
}

// ─── Image Search Types ───

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

export interface ImageSearchResult {
  title: string;
  link: string;
  source: string;
  thumbnail: string | null;
  snippet: string | null;
}

export interface UploadResponse {
  success: boolean;
  mode: 'upload' | 'url';
  imageUrl: string;
  metadata: ImageMetadata | null;
  searchResults: ImageSearchResult[];
  error?: string;
}

export interface ToolsResponse {
  success: boolean;
  count: number;
  tools: OsintTool[];
}

// ─── Category Config ───

export type CategoryKey = 'all' | 'image-recon' | 'domain-ip' | 'email-username';

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { key: 'all', label: 'All Tools', icon: '◉', description: 'Browse all OSINT tools' },
  { key: 'image-recon', label: 'Image Recon', icon: '◎', description: 'Reverse image search & metadata analysis' },
  { key: 'domain-ip', label: 'Domain & IP', icon: '◈', description: 'WHOIS, DNS, GeoIP lookups' },
  { key: 'email-username', label: 'Email & Username', icon: '◇', description: 'Breach checks & social handle verification' },
];
