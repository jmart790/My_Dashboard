// Feeds for the Arts & Entertainment page. All free, keyless and CORS-enabled:
// TVMaze (TV), Apple's iTunes charts (movies, songs, albums), Open Library (books),
// ESPN's public site API (local teams' games). Each fetcher returns plain objects.
import { cached } from '@/media/cache';
import { localTeams } from '@/media/teams';

const HOUR = 60 * 60 * 1000;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).host}`);
  return response.json();
}

export const stripHtml = (html) =>
  (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();

/** 'YYYY-MM-DD' for today where the reader is. */
export function localDate(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timeZone || undefined }).format(now);
}

// ---- Television

const PRIME = { from: '19:00', to: '23:00' };
const TOP = 10;

/**
 * TVMaze's schedule -> tonight's 10 most popular primetime shows, ranked by
 * TVMaze's popularity score ("weight"), ties broken by viewer rating.
 */
export function topTonight(episodes) {
  const shows = new Map(); // one row per show, at its first airing tonight
  for (const ep of episodes) {
    if (ep.airtime < PRIME.from || ep.airtime >= PRIME.to) continue;
    const prev = shows.get(ep.show.id);
    if (prev && prev.time <= ep.airtime) continue;
    shows.set(ep.show.id, {
      id: ep.show.id,
      title: ep.show.name,
      time: ep.airtime,
      network: (ep.show.network || ep.show.webChannel || {}).name || '',
      episode: ep.name,
      // daily shows number seasons by year ("S2026 E232"): only real seasons get a code
      code: ep.season && ep.season < 1900 && ep.number ? `S${ep.season} E${ep.number}` : '',
      runtime: ep.runtime || ep.show.runtime || null,
      genres: ep.show.genres || [],
      image: ep.show.image ? ep.show.image.medium : null,
      summary: stripHtml(ep.summary) || stripHtml(ep.show.summary),
      url: ep.show.url,
      weight: ep.show.weight || 0,
      rating: (ep.show.rating && ep.show.rating.average) || 0,
    });
  }
  return [...shows.values()]
    .sort((a, b) => b.weight - a.weight || b.rating - a.rating)
    .slice(0, TOP)
    .map((show, i) => ({ ...show, rank: i + 1 }));
}

export function fetchTv(timeZone) {
  const date = localDate(timeZone);
  return cached(`tv-top|${date}`, 6 * HOUR, async () =>
    topTonight(await getJson(`https://api.tvmaze.com/schedule?country=US&date=${date}`))
  );
}

// ---- Apple charts (movies, songs, albums)

const label = (field) => (field && field.label) || '';
const links = (entry) => [].concat(entry.link || []).map((l) => l.attributes || {});
// the feed's artwork URLs end in a size, e.g. .../40x60bb.png; ask for a bigger one
const artwork = (entry, size) => {
  const images = entry['im:image'] || [];
  return images.length ? images[images.length - 1].label.replace(/\/\d+x\d+bb\./, `/${size}bb.`) : null;
};

/** One iTunes RSS entry -> a chart row. */
export function chartItem(entry, rank, size) {
  const name = label(entry['im:name']);
  return {
    rank,
    id: entry.id.attributes['im:id'],
    title: name.replace(/\s+\(\d{4}\)$/, ''), // movies carry "(2026)"; the date is shown separately
    artist: label(entry['im:artist']),
    genre: (entry.category && entry.category.attributes.label) || '',
    released: (entry['im:releaseDate'] && entry['im:releaseDate'].attributes.label) || '',
    summary: label(entry.summary),
    tracks: Number(label(entry['im:itemCount'])) || null,
    image: artwork(entry, size),
    url: (links(entry).find((l) => l.rel === 'alternate') || {}).href || entry.id.label,
    preview: (links(entry).find((l) => l.rel === 'enclosure' && /^audio/.test(l.type)) || {}).href || null,
  };
}

function appleChart(feed, size) {
  return cached(`apple|${feed}`, 6 * HOUR, async () => {
    const data = await getJson(`https://itunes.apple.com/us/rss/${feed}/limit=10/json`);
    return [].concat(data.feed.entry || []).map((entry, i) => chartItem(entry, i + 1, size));
  });
}

export const fetchMovies = () => appleChart('topmovies', '200x300');
export const fetchSongs = () => appleChart('topsongs', '120x120');
export const fetchAlbums = () => appleChart('topalbums', '120x120');

// ---- Books

export function fetchBooks() {
  return cached('books|trending', 6 * HOUR, async () => {
    const { works } = await getJson('https://openlibrary.org/trending/daily.json?limit=8');
    return works.map((work, i) => ({
      rank: i + 1,
      key: work.key,
      title: work.title,
      author: (work.author_name || []).join(', '),
      year: work.first_publish_year || null,
      editions: work.edition_count || null,
      image: work.cover_i ? `https://covers.openlibrary.org/b/id/${work.cover_i}-M.jpg` : null,
      url: `https://openlibrary.org${work.key}`,
    }));
  });
}

/** A book's blurb, fetched when the reader opens it. */
export async function fetchBookDescription(key) {
  const work = await getJson(`https://openlibrary.org${key}.json`);
  const text = typeof work.description === 'string' ? work.description : (work.description || {}).value;
  // Open Library blurbs often trail off into markdown source lists: keep the prose
  return (text || '').split(/\n-{3,}|\n\s*\(\[source\]/)[0].trim();
}

// ---- Local sports

const LEAGUE_NAMES = {
  'football/nfl': 'NFL',
  'basketball/nba': 'NBA',
  'baseball/mlb': 'MLB',
  'hockey/nhl': 'NHL',
  'soccer/usa.1': 'MLS',
};
const DAY = 24 * HOUR;
const WINDOW = { back: 3 * DAY, ahead: 7 * DAY }; // recent results and the week ahead

function side(competitor, localKeys, league) {
  const team = competitor.team;
  const score = competitor.score;
  return {
    abbr: team.abbreviation,
    name: team.shortDisplayName || team.displayName,
    fullName: team.displayName,
    logo: (team.logos && team.logos[0] && team.logos[0].href) || team.logo || null,
    score: score && typeof score === 'object' ? score.displayValue : score ?? null,
    winner: Boolean(competitor.winner),
    record: ((competitor.record || []).find((r) => r.type === 'total') || {}).displayValue || '',
    local: localKeys.has(`${league}|${team.abbreviation}`),
  };
}

/** ESPN team-schedule events -> games inside the window, for one league. */
export function gamesFrom(events, league, localKeys, now = Date.now()) {
  return events
    .filter((event) => {
      const t = Date.parse(event.date);
      return t >= now - WINDOW.back && t <= now + WINDOW.ahead;
    })
    .map((event) => {
      const competition = event.competitions[0];
      const status = competition.status.type;
      const home = competition.competitors.find((c) => c.homeAway === 'home');
      const away = competition.competitors.find((c) => c.homeAway === 'away');
      return {
        id: `${league}|${event.id}`,
        league: LEAGUE_NAMES[league],
        date: event.date,
        state: status.state, // pre | in | post
        detail: status.shortDetail,
        home: side(home, localKeys, league),
        away: side(away, localKeys, league),
        venue: competition.venue ? competition.venue.fullName : '',
        city: competition.venue && competition.venue.address ? competition.venue.address.city : '',
        broadcast: (competition.broadcasts || [])
          .map((b) => (b.media && b.media.shortName) || (b.names || []).join(', '))
          .filter(Boolean)
          .join(', '),
      };
    });
}

export function fetchLocalSports(coordinates) {
  const { teams, nearby } = localTeams(coordinates);
  const localKeys = new Set(teams.map((t) => `${t.league}|${t.abbr}`));
  const key = `sports|${[...localKeys].join(',')}`;
  // an empty week is re-checked within a minute: a blip from ESPN shouldn't blank the column for 10
  const ttl = (data) => (data.games.length ? 10 * 60 * 1000 : 60 * 1000);
  return cached(key, ttl, async () => {
    const schedules = await Promise.allSettled(
      teams.map((t) =>
        getJson(`https://site.api.espn.com/apis/site/v2/sports/${t.league}/teams/${t.id}/schedule`).then(
          (data) => gamesFrom(data.events || [], t.league, localKeys)
        )
      )
    );
    if (schedules.every((s) => s.status === 'rejected')) throw schedules[0].reason;
    const games = new Map(); // two local teams playing each other is one game
    schedules.forEach((s) => s.status === 'fulfilled' && s.value.forEach((g) => games.set(g.id, g)));
    return {
      nearby,
      teams: teams.map((t) => ({ league: LEAGUE_NAMES[t.league], abbr: t.abbr, miles: Math.round(t.miles) })),
      games: [...games.values()].sort((a, b) => a.date.localeCompare(b.date)),
    };
  });
}
