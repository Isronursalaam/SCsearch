import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let url = '';
    let fileName = 'Uploaded Image';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      url = body.url;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      if (file) {
        fileName = file.name;
        url = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500';
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'upload',
      imageUrl: url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500',
      metadata: {
        fileName,
        fileSize: '1.2 MB',
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        resolution: '1920 × 1080',
        camera: 'Canon EOS R5',
        lens: 'RF 24-70mm F2.8L',
        dateTaken: new Date().toISOString(),
        gps: { latitude: -6.2088, longitude: 106.8456 },
        orientation: 1,
      },
      searchResults: [
        { title: 'Similar visual match on Wikimedia Commons', source: 'commons.wikimedia.org', link: 'https://commons.wikimedia.org', snippet: 'Visual match identified in open repository.' },
        { title: 'Flickr photography archive match', source: 'flickr.com', link: 'https://flickr.com', snippet: 'Similar photography match in archive.' },
        { title: 'Unsplash open source match', source: 'unsplash.com', link: 'https://unsplash.com', snippet: 'Open photography match.' },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
