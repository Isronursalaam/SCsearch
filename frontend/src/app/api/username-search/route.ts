import { NextResponse } from 'next/server';

// ─── Username Search ───

const PLATFORMS = [
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

async function checkPlatform(platform: typeof PLATFORMS[0], username: string) {
  const url = platform.urlTemplate.replace('{username}', encodeURIComponent(username));
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'manual',
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    if (response.status >= 200 && response.status < 400) {
      return { platform: platform.name, url, status: 'found' as const, responseTime, icon: platform.icon };
    } else {
      return { platform: platform.name, url, status: 'not_found' as const, responseTime, icon: platform.icon };
    }
  } catch {
    const responseTime = Date.now() - startTime;
    return { platform: platform.name, url, status: 'error' as const, responseTime, icon: platform.icon };
  }
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Valid username required.' }, { status: 400 });
    }

    const sanitized = username.trim().replace(/[^a-zA-Z0-9._-]/g, '');
    const results = await Promise.all(PLATFORMS.map((p) => checkPlatform(p, sanitized)));

    const found = results.filter((r) => r.status === 'found').length;
    const notFound = results.filter((r) => r.status === 'not_found').length;
    const errors = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      username: sanitized,
      summary: { total: results.length, found, notFound, errors },
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
