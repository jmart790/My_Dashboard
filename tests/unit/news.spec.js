// @vitest-environment node
import { searchNews, isPlaceQuery, newsKey, clearNewsCache, NEWS_TTL_MS, REFUSED_TTL_MS } from '../../server/news.js';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

describe('server news search', () => {
  beforeEach(() => clearNewsCache());
  it('only accepts place names', () => {
    expect(isPlaceQuery('Portland')).toBe(true);
    expect(isPlaceQuery("Coeur d'Alene")).toBe(true);
    expect(isPlaceQuery('Saint-Lô')).toBe(true);
    expect(isPlaceQuery('')).toBe(false);
    expect(isPlaceQuery('a'.repeat(81))).toBe(false);
    expect(isPlaceQuery('Portland" OR crypto')).toBe(false);
    expect(isPlaceQuery(null)).toBe(false);
  });

  it('reads the key from the server environment', () => {
    expect(newsKey({ GNEWS_API_KEY: 'a', VITE_GNEWS_API_KEY: 'b' })).toBe('a');
    expect(newsKey({ VITE_GNEWS_API_KEY: 'b' })).toBe('b');
    expect(newsKey({})).toBe('');
  });

  it('calls GNews with the key and the quoted place, and returns the articles', async () => {
    const fetchImpl = vi.fn(async () => ok({ articles: [{ title: 'x' }] }));
    expect(await searchNews('Portland', { key: 'k', fetchImpl })).toEqual({ status: 200, body: { articles: [{ title: 'x' }] } });
    const url = new URL(fetchImpl.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://gnews.io/api/v4/search');
    expect(url.searchParams.get('q')).toBe('"Portland"');
    expect(url.searchParams.get('apikey')).toBe('k');
  });

  it('refuses bad queries and a missing key without calling GNews', async () => {
    const fetchImpl = vi.fn();
    expect((await searchNews('drop table', { key: '', fetchImpl })).status).toBe(500);
    expect((await searchNews('<script>', { key: 'k', fetchImpl })).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('passes quota and rate-limit answers through, and never throws', async () => {
    const ask = (fetchImpl) => {
      clearNewsCache(); // each case is a fresh ask, not the remembered answer
      return searchNews('Portland', { key: 'k', fetchImpl });
    };
    const answer = (status) => async () => ({ ok: false, status });
    expect((await ask(answer(403))).status).toBe(403);
    expect((await ask(answer(500))).status).toBe(502);
    const body = (await ask(answer(429))).body;
    expect(JSON.stringify(body)).not.toContain('k"'); // the key is never echoed back
    expect((await ask(async () => { throw new Error('timeout'); })).status).toBe(504);
  });
});

describe('server news cache', () => {
  const ok = (body) => ({ ok: true, status: 200, json: async () => body });
  beforeEach(() => {
    clearNewsCache();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('answers the same place from memory for 15 minutes', async () => {
    const fetchImpl = vi.fn(async () => ok({ articles: [{ title: 'x' }] }));
    await searchNews('Portland', { key: 'k', fetchImpl });
    await searchNews('Portland', { key: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await searchNews('Oregon', { key: 'k', fetchImpl }); // another place is its own entry
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(NEWS_TTL_MS + 1);
    await searchNews('Portland', { key: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('remembers "quota used up" for 10 minutes instead of asking again', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 403 }));
    expect((await searchNews('Portland', { key: 'k', fetchImpl })).status).toBe(403);
    expect((await searchNews('Portland', { key: 'k', fetchImpl })).status).toBe(403);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(REFUSED_TTL_MS + 1);
    await searchNews('Portland', { key: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not cache other failures', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 500 }));
    await searchNews('Portland', { key: 'k', fetchImpl });
    await searchNews('Portland', { key: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('Netlify adapter caching headers', () => {
  it('lets the CDN keep good answers and refusals, but not other errors', async () => {
    const { toNetlify } = await import('../../server/http.js');
    const header = async (status) =>
      (await toNetlify(async () => ({ status, body: {} }), { cdnSeconds: 900, refusedCdnSeconds: 600 })(new Request('https://x/api/news?q=a')))
        .headers.get('netlify-cdn-cache-control');
    expect(await header(200)).toBe('public, durable, s-maxage=900');
    expect(await header(403)).toBe('public, durable, s-maxage=600');
    expect(await header(429)).toBe('public, durable, s-maxage=600');
    expect(await header(502)).toBeNull();
  });
});
