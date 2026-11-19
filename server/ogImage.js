// Finds a restaurant website's share image (og:image / twitter:image).
// Runs on the server because browsers can't read other sites' HTML (CORS).
// Plain Node: used by the Vite plugin in vite.config.js, portable to a serverless function.
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 512 * 1024; // the <head> is near the top; never read whole pages
const TIMEOUT_MS = 6000;

// ---- SSRF guard: this endpoint fetches URLs it's given, so it must never reach
// private networks (your router, cloud metadata at 169.254.169.254, localhost...).

function ipv4ToInt(ip) {
  return ip.split('.').reduce((n, part) => n * 256 + Number(part), 0);
}

const PRIVATE_V4 = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8],
  ['169.254.0.0', 16], // link-local, cloud metadata
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4], // multicast and reserved above
].map(([base, bits]) => [ipv4ToInt(base), bits]);

export function isPrivateAddress(ip) {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip); // IPv4 wrapped in IPv6
  if (mapped) return isPrivateAddress(mapped[1]);
  if (isIP(ip) === 4) {
    const n = ipv4ToInt(ip);
    return PRIVATE_V4.some(([base, bits]) => Math.floor(n / 2 ** (32 - bits)) === Math.floor(base / 2 ** (32 - bits)));
  }
  const v6 = ip.toLowerCase();
  return (
    v6 === '::' ||
    v6 === '::1' ||
    /^f[cd]/.test(v6) || // unique local fc00::/7
    /^fe[89ab]/.test(v6) // link-local fe80::/10
  );
}

async function isSafeUrl(url, lookup) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') return false;
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
  // ponytail: DNS is checked here and resolved again by fetch, so a host that changes
  // its answer in between (DNS rebinding) could slip through. Fine for a local dev
  // server; pin the checked IP with a custom undici dispatcher before exposing this publicly.
}

// ---- HTML parsing

// Share images that are clearly not food: logos, review badges, theme screenshots.
const NOT_FOOD = /(logo|badge|favicon|icon|screenshot|placeholder|default[-_]?share)|\.svg(\?|$)/i;
// Menu-hosting services whose share image is the same generic banner for every restaurant.
const GENERIC_HOSTS = /(^|\.)singleplatform\.com$/i;

export function isLikelyLogo(url) {
  if (NOT_FOOD.test(url)) return true;
  try {
    return GENERIC_HOSTS.test(new URL(url).hostname);
  } catch {
    return true;
  }
}

const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x2F;/gi, '/');

function metaContent(html, key) {
  const k = key.replace(':', '\\:');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${k}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m) return decodeEntities(m[1].trim());
  }
  return null;
}

/** @returns an absolute https image URL, or null */
export function extractOgImage(html, pageUrl) {
  const raw =
    metaContent(html, 'og:image:secure_url') || metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw, pageUrl);
  } catch {
    return null;
  }
  if (url.protocol === 'http:') url.protocol = 'https:'; // avoid mixed content; the img falls back if it fails
  if (url.protocol !== 'https:') return null;
  return isLikelyLogo(url.href) ? null : url.href;
}

async function readHead(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = '';
  let bytes = 0;
  while (bytes < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break; // meta tags live in <head>
  }
  reader.cancel().catch(() => {});
  return html;
}

/**
 * @param {string} pageUrl the restaurant's website
 * @param {{ fetchImpl?: typeof fetch, lookup?: Function }} deps injectable for tests
 * @returns {Promise<string|null>} never throws
 */
export async function findOgImage(pageUrl, { fetchImpl = fetch, lookup = dnsLookup } = {}) {
  let url = pageUrl;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isSafeUrl(url, lookup))) return null;
      // manual redirects: each hop gets the same safety check
      const response = await fetchImpl(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; MyDashboard/1.0)', accept: 'text/html' },
      });
      if (response.status >= 300 && response.status < 400) {
        const next = response.headers.get('location');
        if (!next) return null;
        url = new URL(next, url).href;
        continue;
      }
      if (!response.ok) return null;
      if (!(response.headers.get('content-type') || '').includes('text/html')) return null;
      return extractOgImage(await readHead(response), url);
    }
  } catch {
    // timeouts, TLS errors, resets: no image
  }
  return null;
}

// ---- HTTP handler with an in-memory cache

const DAY = 24 * 60 * 60 * 1000;
const cache = new Map(); // page URL -> { image, expires }

/** Connect-style middleware for GET /api/og-image?url=... -> { image } */
export async function ogImageHandler(req, res) {
  const target = new URL(req.url, 'http://localhost').searchParams.get('url');
  res.setHeader('content-type', 'application/json');
  if (!target || target.length > 2048) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'url query parameter required' }));
    return;
  }
  let hit = cache.get(target);
  if (!hit || hit.expires < Date.now()) {
    const image = await findOgImage(target);
    // misses are re-checked sooner: sites add share images
    hit = { image, expires: Date.now() + (image ? 7 * DAY : DAY) };
    cache.set(target, hit);
    // ponytail: unbounded in-memory cache; fine for a dev server, use an LRU or KV store if deployed
  }
  // the client caches in localStorage; a browser HTTP cache on top would hide server-side fixes
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify({ image: hit.image }));
}
