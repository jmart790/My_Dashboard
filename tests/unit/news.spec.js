// @vitest-environment node
import { searchNews, isPlaceQuery, newsKey } from '../../server/news.js';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

describe('server news search', () => {
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
    const answer = (status) => async () => ({ ok: false, status });
    expect((await searchNews('Portland', { key: 'k', fetchImpl: answer(403) })).status).toBe(403);
    expect((await searchNews('Portland', { key: 'k', fetchImpl: answer(500) })).status).toBe(502);
    const body = (await searchNews('Portland', { key: 'k', fetchImpl: answer(429) })).body;
    expect(JSON.stringify(body)).not.toContain('k"'); // the key is never echoed back
    expect((await searchNews('Portland', { key: 'k', fetchImpl: async () => { throw new Error('timeout'); } })).status).toBe(504);
  });
});
