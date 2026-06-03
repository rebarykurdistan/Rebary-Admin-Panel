const R2_BASE = 'https://pub-881a1c06b6ba43b398a94343f2256cbb.r2.dev/jsfiles/services/categories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  // Sanitize: no path traversal, letters/digits/hyphens/underscores only
  if (!file || !/^[\w\-]+$/.test(file)) {
    return new Response('Bad request', { status: 400 });
  }

  try {
    const res = await fetch(`${R2_BASE}/${file}.json`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return new Response('Not found', { status: res.status });

    const data = await res.text();
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return new Response('Upstream error', { status: 502 });
  }
}
