// Finds a restaurant website's share image (og:image / twitter:image).
// Runs on the server because browsers can't read other sites' HTML (CORS).
// Plain Node: used by the Vite plugin in vite.config.js, portable to a serverless function.
import { lookup as dnsLookup } from 'node:dns/promises';
import { lookup as dnsLookupCallback } from 'node:dns';
import { isIP } from 'node:net';
import http from 'node:http';
import https from 'node:https';
import { Readable } from 'node:stream';

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
  // The connection itself re-checks the address it actually dials (guardedLookup below),
  // so a host that changes its DNS answer after this check (rebinding) still can't reach
  // a private network.
}

/**
 * dns.lookup for http(s).get that refuses private addresses at connect time: the
 * address checked is the address dialed.
 */
export function guardedLookup(hostname, options, callback) {
  dnsLookupCallback(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
      return callback(new Error(`refusing private address for ${hostname}`));
    }
    if (options && options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

/** A minimal fetch (status, headers.get, body stream) that connects through guardedLookup. */
export function pinnedFetch(url, { signal, headers } = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const client = target.protocol === 'https:' ? https : http;
    const req = client.get(target, { headers, signal, lookup: guardedLookup }, (res) => {
      resolve({
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 300,
        headers: {
          get: (name) => {
            const value = res.headers[name.toLowerCase()];
            return Array.isArray(value) ? value.join(', ') : value ?? null;
          },
        },
        body: Readable.toWeb(res),
      });
    });
    req.on('error', reject);
  });
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
export async function findOgImage(pageUrl, { fetchImpl = pinnedFetch, lookup = dnsLookup } = {}) {
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

/**
 * GET /api/og-image?url=... -> { image }. Shared by the Vite servers and the Netlify Function.
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function ogImageResult(target) {
  if (!target || target.length > 2048) return { status: 400, body: { error: 'url query parameter required' } };
  let hit = cache.get(target);
  if (!hit || hit.expires < Date.now()) {
    const image = await findOgImage(target);
    // misses are re-checked sooner: sites add share images
    hit = { image, expires: Date.now() + (image ? 7 * DAY : DAY) };
    if (cache.size > 2000) cache.clear(); // ponytail: crude cap; the client caches too, and the CDN caches the response
    cache.set(target, hit);
  }
  return { status: 200, body: { image: hit.image } };
}
