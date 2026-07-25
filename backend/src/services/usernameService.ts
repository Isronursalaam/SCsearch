export interface PlatformResult {
  platform: string;
  url: string;
  status: 'found' | 'not_found' | 'error';
  responseTime: number;
  icon: string;
}

interface PlatformConfig {
  name: string;
  urlTemplate: string;
  icon: string;
}

const PLATFORMS: PlatformConfig[] = [
  { name: 'GitHub', urlTemplate: 'https://github.com/{username}', icon: '🐙' },
  { name: 'Reddit', urlTemplate: 'https://www.reddit.com/user/{username}', icon: '🔴' },
  { name: 'GitLab', urlTemplate: 'https://gitlab.com/{username}', icon: '🦊' },
  { name: 'Dev.to', urlTemplate: 'https://dev.to/{username}', icon: '👩‍💻' },
  { name: 'Medium', urlTemplate: 'https://medium.com/@{username}', icon: '📝' },
  { name: 'Pinterest', urlTemplate: 'https://www.pinterest.com/{username}/', icon: '📌' },
  { name: 'Twitch', urlTemplate: 'https://www.twitch.tv/{username}', icon: '🎮' },
  { name: 'Steam', urlTemplate: 'https://steamcommunity.com/id/{username}', icon: '🎯' },
  { name: 'X (Twitter)', urlTemplate: 'https://x.com/{username}', icon: '𝕏' },
  { name: 'Instagram', urlTemplate: 'https://www.instagram.com/{username}/', icon: '📸' },
  { name: 'TikTok', urlTemplate: 'https://www.tiktok.com/@{username}', icon: '🎵' },
  { name: 'YouTube', urlTemplate: 'https://www.youtube.com/@{username}', icon: '▶️' },
  { name: 'Spotify', urlTemplate: 'https://open.spotify.com/user/{username}', icon: '🎧' },
  { name: 'Keybase', urlTemplate: 'https://keybase.io/{username}', icon: '🔑' },
  { name: 'Patreon', urlTemplate: 'https://www.patreon.com/{username}', icon: '🎨' },
  { name: 'About.me', urlTemplate: 'https://about.me/{username}', icon: '👤' },
  { name: 'Gravatar', urlTemplate: 'https://en.gravatar.com/{username}', icon: '🌐' },
  { name: 'Flickr', urlTemplate: 'https://www.flickr.com/people/{username}/', icon: '📷' },
  { name: 'Vimeo', urlTemplate: 'https://vimeo.com/{username}', icon: '🎬' },
  { name: 'SoundCloud', urlTemplate: 'https://soundcloud.com/{username}', icon: '🔊' },
];

/**
 * Check a single platform for a username.
 */
async function checkPlatform(
  platform: PlatformConfig,
  username: string
): Promise<PlatformResult> {
  const url = platform.urlTemplate.replace('{username}', encodeURIComponent(username));
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'manual',
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    // Consider 200 as "found", 404 as "not found"
    // 3xx redirects can mean the profile doesn't exist (redirect to login/home)
    if (response.status >= 200 && response.status < 300) {
      return { platform: platform.name, url, status: 'found', responseTime, icon: platform.icon };
    } else if (response.status === 404) {
      return { platform: platform.name, url, status: 'not_found', responseTime, icon: platform.icon };
    } else if (response.status >= 300 && response.status < 400) {
      // Redirect — could mean profile exists or not; mark as found for manual check
      return { platform: platform.name, url, status: 'found', responseTime, icon: platform.icon };
    } else {
      return { platform: platform.name, url, status: 'not_found', responseTime, icon: platform.icon };
    }
  } catch {
    const responseTime = Date.now() - startTime;
    return { platform: platform.name, url, status: 'error', responseTime, icon: platform.icon };
  }
}

/**
 * Search for a username across all configured platforms.
 */
export async function searchUsername(username: string): Promise<PlatformResult[]> {
  const results = await Promise.allSettled(
    PLATFORMS.map((platform) => checkPlatform(platform, username))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      platform: 'Unknown',
      url: '',
      status: 'error' as const,
      responseTime: 0,
      icon: '❓',
    };
  });
}
