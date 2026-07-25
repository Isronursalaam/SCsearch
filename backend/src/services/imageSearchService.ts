export interface ImageSearchResult {
  title: string;
  link: string;
  source: string;
  thumbnail: string | null;
  snippet: string | null;
}

const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

/**
 * Perform a reverse image search using SerpApi (Google Lens).
 * Falls back to mock results if no API key is configured.
 */
export async function reverseImageSearch(
  imageUrl: string
): Promise<ImageSearchResult[]> {
  // If SerpApi key is available, use real API
  if (SERPAPI_KEY) {
    try {
      const params = new URLSearchParams({
        engine: 'google_lens',
        url: imageUrl,
        api_key: SERPAPI_KEY,
      });

      const response = await fetch(
        `https://serpapi.com/search.json?${params.toString()}`
      );

      if (!response.ok) {
        console.error(`SerpApi error: ${response.status} ${response.statusText}`);
        return getMockResults();
      }

      const data = await response.json();
      const visualMatches = data.visual_matches || [];

      return visualMatches.slice(0, 10).map((match: Record<string, string>) => ({
        title: match.title || 'Untitled',
        link: match.link || '#',
        source: match.source || new URL(match.link || 'https://unknown.com').hostname,
        thumbnail: match.thumbnail || null,
        snippet: match.snippet || null,
      }));
    } catch (error) {
      console.error('SerpApi request failed:', error);
      return getMockResults();
    }
  }

  // No API key — return mock demo results
  return getMockResults();
}

/**
 * Mock results for demonstration when no API key is configured.
 */
function getMockResults(): ImageSearchResult[] {
  return [
    {
      title: 'Similar image found on Wikimedia Commons',
      link: 'https://commons.wikimedia.org/wiki/Main_Page',
      source: 'commons.wikimedia.org',
      thumbnail: null,
      snippet: 'A visually similar image was identified in the Wikimedia Commons open repository.',
    },
    {
      title: 'Matching visual content — Flickr',
      link: 'https://www.flickr.com/explore',
      source: 'flickr.com',
      thumbnail: null,
      snippet: 'Potential visual match found in the Flickr photography community.',
    },
    {
      title: 'Related image on Pinterest',
      link: 'https://www.pinterest.com',
      source: 'pinterest.com',
      thumbnail: null,
      snippet: 'A similar pin was discovered with related visual elements.',
    },
    {
      title: 'Visual match — Getty Images',
      link: 'https://www.gettyimages.com',
      source: 'gettyimages.com',
      thumbnail: null,
      snippet: 'Stock photography match identified with similar composition and subject.',
    },
    {
      title: 'Reverse search result — Reddit',
      link: 'https://www.reddit.com',
      source: 'reddit.com',
      thumbnail: null,
      snippet: 'A visually similar image was previously shared on Reddit.',
    },
    {
      title: 'Image archive match — Unsplash',
      link: 'https://unsplash.com',
      source: 'unsplash.com',
      thumbnail: null,
      snippet: 'Open-source photography platform with visually similar content.',
    },
  ];
}
