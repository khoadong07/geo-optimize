import { NextRequest, NextResponse } from 'next/server';

export const GEO_LANG_COOKIE = 'geobase-geo-lang';

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

async function detectLangFromIp(ip: string | null): Promise<'en' | 'vi'> {
  if (!ip || isPrivateIp(ip)) return 'vi';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`https://ipwho.is/${ip}?fields=country_code`, { signal: controller.signal });
    if (!res.ok) return 'vi';
    const data = (await res.json()) as { country_code?: string };
    return data.country_code?.toUpperCase() === 'VN' ? 'vi' : 'en';
  } catch {
    return 'vi';
  } finally {
    clearTimeout(timeout);
  }
}

// Sets a one-time "detected" language cookie from the visitor's IP, so the
// marketing site defaults to Vietnamese for Vietnam-based visitors and
// English for everyone else. Only runs once per visitor — an explicit
// language-toggle choice (stored in localStorage, see i18n.tsx) always wins
// over this, and re-detecting on every request would add latency for nothing.
export async function middleware(request: NextRequest) {
  if (request.cookies.has(GEO_LANG_COOKIE)) {
    return NextResponse.next();
  }

  const lang = await detectLangFromIp(getClientIp(request));
  const response = NextResponse.next();
  response.cookies.set(GEO_LANG_COOKIE, lang, { maxAge: 60 * 60 * 24 * 30, path: '/' });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|uploads|favicon.ico).*)'],
};
