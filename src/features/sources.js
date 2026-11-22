// Feeds for the Front Page's lower band. All free and keyless; all cached in
// localStorage through the same helper the Media page uses.
import { cached } from '@/media/cache';
import { rng, shuffle } from '@/seeded';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const round = (n) => Number(n).toFixed(2);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
}

/** Open-Meteo air quality + UV now. */
export function fetchAirQuality({ lat, lon }) {
  return cached(`aq|${round(lat)},${round(lon)}`, HOUR, async () => {
    const data = await getJson(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,uv_index&timezone=auto`
    );
    return { aqi: data.current.us_aqi, uv: data.current.uv_index };
  });
}

/** EPA category for a US AQI value. */
export function aqiLabel(aqi) {
  if (aqi == null) return '';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for some';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very unhealthy';
  return 'Hazardous';
}

/**
 * Wikipedia articles near a point: the 20 nearest, each with a short extract and a
 * thumbnail when there is one. Cached a week; the daily pick happens in pickAround.
 */
export function fetchNearby({ lat, lon }) {
  return cached(`around|${round(lat)},${round(lon)}`, 7 * DAY, async () => {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'geosearch',
      ggscoord: `${lat}|${lon}`,
      ggsradius: '10000',
      ggslimit: '20',
      prop: 'extracts|pageimages|coordinates',
      exintro: '1',
      explaintext: '1',
      exsentences: '2',
      exlimit: '20',
      piprop: 'thumbnail',
      pithumbsize: '240',
      format: 'json',
      origin: '*',
    });
    const data = await getJson(`https://en.wikipedia.org/w/api.php?${params}`);
    return Object.values((data.query && data.query.pages) || {})
      .filter((p) => p.extract && !/^List of /.test(p.title))
      .map((p) => ({
        id: p.pageid,
        title: p.title,
        extract: p.extract,
        thumb: p.thumbnail && p.thumbnail.source,
        link: `https://en.wikipedia.org/?curid=${p.pageid}`,
      }));
  });
}

/** Today's three: shuffled by date, places with pictures first. */
export function pickAround(places, day, count = 3) {
  const order = shuffle(places, rng(`around|${day}`));
  return [...order.filter((p) => p.thumb), ...order.filter((p) => !p.thumb)].slice(0, count);
}

const PAGE_ONE = 'number_page:0000000001';
async function frontPages(date, state) {
  const facet = state ? `${PAGE_ONE}|location_state:${state.toLowerCase()}` : PAGE_ONE;
  const url = `https://www.loc.gov/collections/chronicling-america/?dates=${date}&dl=page&fa=${encodeURIComponent(facet)}&fo=json&c=40&at=results`;
  const { results = [] } = await getJson(url);
  return results.filter((r) => Array.isArray(r.image_url) && r.image_url.some((u) => u.includes('/iiif/')));
}

/**
 * A front page from 100 years ago today (Library of Congress, Chronicling America):
 * from the reader's state if one survives, else from anywhere in the US.
 * @param {string} day the paper's date, YYYY-MM-DD
 * @param {string} state full state name, e.g. 'Oregon'
 */
export function fetchYearsAgo(day, state) {
  const [y, m, d] = day.split('-');
  const then = `${Number(y) - 100}-${m}-${d}`;
  return cached(`yearsago|${then}|${state || ''}`, DAY, async () => {
    let pages = state ? await frontPages(then, state) : [];
    const local = pages.length > 0;
    if (!local) pages = await frontPages(then);
    if (!pages.length) return null;
    const page = shuffle(pages, rng(`yearsago|${then}`))[0];
    const iiif = page.image_url.find((u) => u.includes('/iiif/')).split('#')[0];
    // "Image 1 of The Oregon daily journal (Portland, Or.), November 21, 1925"
    const title = page.title.replace(/^Image \d+ of /, '').replace(/,\s*\(.*$/, '');
    const paper = title.replace(/,\s*[A-Z][a-z]+ \d+, \d{4}$/, '');
    return {
      date: then,
      paper,
      local,
      image: iiif.replace(/\/full\/pct:[\d.]+\//, '/full/pct:25/'),
      link: page.url,
    };
  });
}

// Lead images that aren't a picture of the place
const NOT_A_VIEW = /(map|locator|location|seal|flag|logo|coat[_ ]of[_ ]arms|\.svg)/i;

/**
 * A photo of the town: the lead image of its Wikipedia article ("Portland, Oregon",
 * else just "Portland"). Cached a month; null when there's no usable picture.
 * @returns {Promise<{ src: string, file: string, page: string } | null>}
 */
export function fetchCityPhoto({ name, region }) {
  return cached(`cityphoto|${name}|${region}`, 30 * DAY, async () => {
    for (const title of [`${name}, ${region}`, name]) {
      const params = new URLSearchParams({
        action: 'query',
        titles: title,
        prop: 'pageimages',
        piprop: 'thumbnail|name',
        pithumbsize: '1400',
        redirects: '1',
        format: 'json',
        origin: '*',
      });
      const data = await getJson(`https://en.wikipedia.org/w/api.php?${params}`);
      const page = Object.values((data.query && data.query.pages) || {})[0];
      if (page && page.thumbnail && page.pageimage && !NOT_A_VIEW.test(page.pageimage)) {
        return {
          src: page.thumbnail.source,
          file: `https://commons.wikimedia.org/wiki/File:${page.pageimage}`,
          page: page.title,
        };
      }
    }
    return null;
  });
}
