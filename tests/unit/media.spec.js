import { topTonight, chartItem, gamesFrom, stripHtml } from '@/media/sources';
import { localTeams, milesBetween, TEAMS } from '@/media/teams';
import { cached, MEDIA_CACHE_KEY } from '@/media/cache';

const episode = (id, airtime, showId, weight, rating = 5) => ({
  id,
  airtime,
  name: `Ep ${id}`,
  season: 1,
  number: id,
  summary: '<p>Tonight &amp; more</p>',
  show: { id: showId, name: `Show ${showId}`, weight, rating: { average: rating }, network: { name: 'NBC' }, genres: [], image: null, url: 'u' },
});

describe('topTonight', () => {
  it('ranks primetime shows by popularity, then rating, one row per show', () => {
    const shows = topTonight([
      episode(1, '18:30', 1, 100), // before primetime
      episode(2, '21:00', 2, 90),
      episode(3, '20:30', 3, 95, 6),
      episode(4, '20:00', 4, 95, 8),
      episode(5, '20:00', 2, 90), // same show earlier tonight: keep this airing
      episode(6, '23:00', 5, 99), // after primetime
    ]);
    expect(shows.map((s) => [s.rank, s.id, s.time])).toEqual([
      [1, 4, '20:00'],
      [2, 3, '20:30'],
      [3, 2, '20:00'],
    ]);
    expect(shows[0]).toMatchObject({ title: 'Show 4', code: 'S1 E4', summary: 'Tonight & more', network: 'NBC' });
  });

  it('keeps only the top 10', () => {
    const many = Array.from({ length: 15 }, (_, i) => episode(i, '20:00', i, i));
    expect(topTonight(many).map((s) => s.id)).toEqual([14, 13, 12, 11, 10, 9, 8, 7, 6, 5]);
  });
});

describe('stripHtml', () => {
  it('removes tags and decodes common entities', () => {
    expect(stripHtml('<b>Tom&#39;s</b> &quot;show&quot;')).toBe('Tom\'s "show"');
    expect(stripHtml(null)).toBe('');
  });
});

describe('chartItem', () => {
  const entry = {
    'im:name': { label: 'The Odyssey (2026)' },
    'im:artist': { label: 'Christopher Nolan' },
    'im:image': [{ label: 'https://x/a/40x60bb.png' }, { label: 'https://x/a/113x170bb.png' }],
    category: { attributes: { label: 'Action' } },
    'im:releaseDate': { attributes: { label: 'July 17, 2026' } },
    summary: { label: 'Homer, on screen.' },
    link: [
      { attributes: { rel: 'alternate', href: 'https://itunes/movie' } },
      { attributes: { rel: 'enclosure', type: 'audio/x-m4a', href: 'https://preview.m4a' } },
    ],
    id: { label: 'https://itunes/id', attributes: { 'im:id': '42' } },
  };

  it('normalizes an iTunes RSS entry', () => {
    expect(chartItem(entry, 1, '200x300')).toMatchObject({
      rank: 1,
      id: '42',
      title: 'The Odyssey',
      artist: 'Christopher Nolan',
      genre: 'Action',
      released: 'July 17, 2026',
      image: 'https://x/a/200x300bb.png',
      url: 'https://itunes/movie',
      preview: 'https://preview.m4a',
    });
  });

  it('handles a single link object (albums) and no preview', () => {
    const album = { ...entry, link: { attributes: { rel: 'alternate', href: 'https://music/album' } } };
    expect(chartItem(album, 2, '120x120')).toMatchObject({ url: 'https://music/album', preview: null });
  });
});

describe('localTeams', () => {
  it('maps every team to a known metro', () => {
    expect(TEAMS.filter((t) => !t.coords)).toEqual([]);
  });

  it('picks teams within 150 miles, nearest first', () => {
    const { teams, nearby } = localTeams({ lat: '25.81', lon: '-80.19' }); // Miami
    expect(nearby).toBe(true);
    expect(teams[0].metro).toBe('MIA');
    expect(teams.every((t) => t.miles <= 150)).toBe(true);
  });

  it('falls back to the nearest metro when nothing is close', () => {
    const { teams, nearby } = localTeams({ lat: 44.08, lon: -103.23 }); // Rapid City, SD
    expect(nearby).toBe(false);
    expect(new Set(teams.map((t) => t.metro)).size).toBe(1);
    expect(teams.length).toBeGreaterThan(0);
  });

  it('measures distance in miles', () => {
    expect(Math.round(milesBetween([40.71, -74.01], [34.05, -118.24]))).toBeGreaterThan(2400);
  });
});

describe('gamesFrom', () => {
  const now = Date.parse('2026-11-20T12:00Z');
  const event = (id, date, state) => ({
    id,
    date,
    competitions: [
      {
        status: { type: { state, shortDetail: state === 'post' ? 'Final' : '7:00 PM' } },
        venue: { fullName: 'Arena', address: { city: 'Miami' } },
        broadcasts: [{ media: { shortName: 'ESPN' } }],
        competitors: [
          { homeAway: 'home', winner: true, score: { displayValue: '110' }, team: { abbreviation: 'MIA', displayName: 'Miami Heat', logos: [{ href: 'l' }] }, record: [{ type: 'total', displayValue: '9-5' }] },
          { homeAway: 'away', score: { displayValue: '99' }, team: { abbreviation: 'BOS', displayName: 'Boston Celtics' } },
        ],
      },
    ],
  });

  it('keeps the last 3 days and the next 7, marking local teams', () => {
    const games = gamesFrom(
      [event('1', '2026-11-10T00:00Z', 'post'), event('2', '2026-11-19T00:00Z', 'post'), event('3', '2026-11-25T00:00Z', 'pre'), event('4', '2026-12-05T00:00Z', 'pre')],
      'basketball/nba',
      new Set(['basketball/nba|MIA']),
      now
    );
    expect(games.map((g) => g.id)).toEqual(['basketball/nba|2', 'basketball/nba|3']);
    expect(games[0]).toMatchObject({
      league: 'NBA',
      detail: 'Final',
      broadcast: 'ESPN',
      home: { abbr: 'MIA', score: '110', winner: true, local: true, record: '9-5' },
      away: { abbr: 'BOS', local: false },
    });
  });
});

describe('cached', () => {
  beforeEach(() => localStorage.removeItem(MEDIA_CACHE_KEY));

  it('loads once while fresh, again once stale', async () => {
    const load = vi.fn(async () => 'data');
    expect(await cached('k', 1000, load)).toBe('data');
    expect(await cached('k', 1000, load)).toBe('data');
    expect(load).toHaveBeenCalledTimes(1);
    expect(await cached('k', -1, load)).toBe('data');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
