import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCityPhoto } from '@/features/sources';

const page = (title, pageimage) => ({
  ok: true,
  json: async () => ({ query: { pages: { 1: { title, pageimage, thumbnail: pageimage && { source: `https://img/${pageimage}` } } } } }),
});

describe('fetchCityPhoto', () => {
  beforeEach(() => localStorage.clear());

  it('uses the "City, State" article lead image', async () => {
    global.fetch = vi.fn().mockResolvedValue(page('Portland, Oregon', 'Portland_Aerial.jpg'));
    expect(await fetchCityPhoto({ name: 'Portland', region: 'Oregon' })).toEqual({
      src: 'https://img/Portland_Aerial.jpg',
      file: 'https://commons.wikimedia.org/wiki/File:Portland_Aerial.jpg',
      page: 'Portland, Oregon',
    });
    expect(fetch.mock.calls[0][0]).toContain('titles=Portland%2C+Oregon');
  });

  it('skips maps and seals, then tries the bare name, then gives up', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce(page('Tiny, Oregon', 'Tiny_Oregon_location_map.svg'))
      .mockResolvedValueOnce(page('Tiny', 'Seal_of_Tiny.png'));
    expect(await fetchCityPhoto({ name: 'Tiny', region: 'Oregon' })).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
