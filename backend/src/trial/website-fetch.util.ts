import { lookup } from 'dns/promises';

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BYTES = 500_000;
const MAX_TEXT_SAMPLE = 3_000;

export interface WebsiteText {
  title: string;
  description: string;
  textSample: string;
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('::ffff:')) return isPrivateIpv4(lower.slice('::ffff:'.length));
  return false;
}

async function assertPublicHostname(hostname: string): Promise<void> {
  const { address, family } = await lookup(hostname);
  const isPrivate = family === 6 ? isPrivateIpv6(address) : isPrivateIpv4(address);
  if (isPrivate) {
    throw new Error(`Refusing to fetch private/internal address for host "${hostname}"`);
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let received = 0;
  let out = '';
  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    out += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return out;
}

// Best-effort homepage fetch for industry detection. Never throws — any
// failure (unreachable, blocked, non-HTML, private-IP target) resolves to
// null so callers can fall back to domain-name-only classification.
export async function fetchWebsiteText(domain: string): Promise<WebsiteText | null> {
  const url = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    await assertPublicHostname(parsed.hostname);

    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
      headers: { 'User-Agent': 'GeoBaseTrialBot/1.0' },
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) return null;

    // Re-check the final (post-redirect) host in case a redirect chain
    // pointed at an internal address.
    await assertPublicHostname(new URL(res.url).hostname);

    const html = await readCapped(res, MAX_BYTES);
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() || '';
    const description =
      /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i.exec(html)?.[1]?.trim() || '';
    const textSample = stripTags(html).slice(0, MAX_TEXT_SAMPLE);

    return { title, description, textSample };
  } catch {
    return null;
  }
}
