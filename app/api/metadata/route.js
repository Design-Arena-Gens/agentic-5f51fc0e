import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let url = rawUrl;
  try {
    // basic validation
    const u = new URL(rawUrl);
    url = u.toString();
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timer);

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream request failed', status: upstream.status }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await upstream.json();
      return NextResponse.json({ sourceType: 'json', json, url });
    }

    const html = await upstream.text();

    const $ = cheerio.load(html);
    const get = (name) => (
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content') ||
      ''
    );

    const title = get('og:title') || $('title').first().text().trim();
    const description = get('og:description') || get('description');
    const image = get('og:image') || $('img').first().attr('src') || '';
    const video = get('og:video') || '';
    const siteName = get('og:site_name') || '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';

    const images = [];
    $('meta[property="og:image"]').each((_, el) => {
      const v = $(el).attr('content');
      if (v) images.push(v);
    });

    return NextResponse.json({ url, title, description, image, images, video, siteName, canonical });
  } catch (err) {
    clearTimeout(timer);
    return NextResponse.json({ error: 'Fetch or parse failed', detail: String(err) }, { status: 500 });
  }
}
