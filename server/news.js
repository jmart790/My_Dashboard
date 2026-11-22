// News search, run on the server so the GNews key never reaches the browser.
// Used by the Vite dev/preview servers (vite.config.js) and the Netlify Function.

const GNEWS_SEARCH = 'https://gnews.io/api/v4/search';

/** The key from the server's environment (GNEWS_API_KEY; the old VITE_ name still works locally). */
export const newsKey = (env = process.env) => env.GNEWS_API_KEY || env.VITE_GNEWS_API_KEY || '';

/**
 * Only place names: the endpoint is public, so it shouldn't be a free general-purpose
 * search for anyone's quota-burning queries.
 */
export const isPlaceQuery = (q) =>
  typeof q === 'string' && q.length > 0 && q.length <= 80 && /^[\p{L}\p{N} .,'’&()-]+$/u.test(q);

/**
 * @param {string} q a city, state or country name
 * @returns {Promise<{ status: number, body: object }>} never throws
 */
export async function searchNews(q, { key = newsKey(), fetchImpl = fetch } = {}) {
  if (!isPlaceQuery(q)) return { status: 400, body: { error: 'q must be a place name' } };
  if (!key) return { status: 500, body: { error: 'GNEWS_API_KEY is not set on the server' } };
  const params = new URLSearchParams({ q: `"${q}"`, lang: 'en', country: 'us', max: '10', sortby: 'publishedAt', apikey: key });
  try {
    const res = await fetchImpl(`${GNEWS_SEARCH}?${params}`, { signal: AbortSignal.timeout(8000) });
    // keep GNews's quota (403) and rate-limit (429) answers; anything else is a bad gateway
    if (!res.ok) return { status: [403, 429].includes(res.status) ? res.status : 502, body: { error: `news wire answered ${res.status}` } };
    const data = await res.json();
    return { status: 200, body: { articles: data.articles || [] } };
  } catch {
    return { status: 504, body: { error: 'news wire timed out' } };
  }
}
