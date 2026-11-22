import axios from 'axios';

// All sources are free and keyless. Adapters below reshape each response into
// what the stores/components already expect, so the UI didn't need a rewrite.

// WMO weather code -> [icon file in assets/icons/weather, summary]
function describeWeather(code, isDay = 1) {
  const clear = isDay ? 'clear-day' : 'clear-night';
  const partly = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  if (code === 0) return [clear, 'Clear'];
  if (code === 1) return [clear, 'Mostly Clear'];
  if (code === 2) return [partly, 'Partly Cloudy'];
  if (code === 3) return ['cloudy', 'Overcast'];
  if (code === 45 || code === 48) return ['fog', 'Foggy'];
  if (code === 56 || code === 57 || code === 66 || code === 67) return ['sleet', 'Freezing Rain'];
  if (code >= 51 && code <= 55) return ['drizzle', 'Drizzle'];
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return ['rain', 'Rain'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', 'Snow'];
  if (code >= 95) return ['storm', 'Thunderstorms'];
  return ['cloudy', 'Cloudy'];
}

const pct = (n) => (n ?? 0) / 100;

// OSM `image` tags are often wiki or Flickr pages, which an <img> can't show
const isDirectImage = (url = '') =>
  /^https:\/\/\S+\.(jpe?g|png|webp)(\?\S*)?$/i.test(url) && !url.includes('/wiki/');

// Haversine distance in miles
function milesBetween(lat1, lon1, lat2, lon2) {
  const rad = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(a));
}

// GNews free plan: 100 requests/day, 3 per News page load. Cache in sessionStorage so
// dev reloads and tab-hopping don't burn the quota.
// ponytail: per-tab cache; move to localStorage if the daily cap still bites.
const NEWS_TTL = 30 * 60 * 1000;
// Free plan also rejects bursts (~1 req/s), so space GNews calls out.
let gnewsQueue = Promise.resolve();
function throttled(fetcher) {
  const run = gnewsQueue.then(fetcher);
  gnewsQueue = run.catch(() => {}).then(() => new Promise((r) => setTimeout(r, 1100)));
  return run;
}

function cached(key, fetcher) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key));
    if (hit && Date.now() - hit.at < NEWS_TTL) return Promise.resolve(hit.data);
  } catch {
    // storage blocked or bad JSON: just fetch
  }
  return fetcher().then((data) => {
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
    } catch {
      // storage full or blocked: skip caching
    }
    return data;
  });
}

// The paper's news is set once per edition (5 AM, 4 PM) and kept until the next one,
// so the stories don't shift under the reader and GNews stays well inside its cap.
const EDITION_NEWS_KEY = 'myDashboard.news.v1';
async function editionCached(edition, query, fetcher) {
  let store = null;
  try {
    store = JSON.parse(localStorage.getItem(EDITION_NEWS_KEY));
  } catch {
    // unreadable: start fresh
  }
  if (!store || store.edition !== edition) store = { edition, entries: {} };
  if (store.entries[query]) return store.entries[query];
  const data = await fetcher();
  store.entries[query] = data;
  try {
    localStorage.setItem(EDITION_NEWS_KEY, JSON.stringify(store));
  } catch {
    // storage full or blocked: refetches next visit
  }
  return data;
}

// Zippopotam and Nominatim have no timezone; Open-Meteo resolves it from coordinates.
// Optional: "open now" falls back to the browser's timezone without it.
function timezoneFor(lat, lon) {
  return axios
    .get('https://api.open-meteo.com/v1/forecast', {
      params: { latitude: lat, longitude: lon, timezone: 'auto' },
    })
    .then(({ data }) => data.timezone)
    .catch(() => null);
}

export default {
  /** @param zipcode 5 digit US zip -> { location } */
  async getLocation(zipcode) {
    const { data } = await axios.get(`https://api.zippopotam.us/us/${zipcode}`);
    const place = data.places[0];
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);
    return {
      location: {
        name: place['place name'],
        region: place.state,
        country: data.country,
        lat,
        lon,
        timezone: await timezoneFor(lat, lon),
        zip: zipcode,
      },
    };
  },

  /** Device coordinates -> { location } via OSM Nominatim reverse geocoding */
  async reverseGeocode({ lat, lon }) {
    const [{ data }, timezone] = await Promise.all([
      axios.get('https://nominatim.openstreetmap.org/reverse', {
        // zoom 18 (address level) is the only level that includes the postcode
        params: { lat, lon, format: 'jsonv2', zoom: 18, addressdetails: 1 },
      }),
      timezoneFor(lat, lon),
    ]);
    const a = data.address || {};
    return {
      location: {
        // rural spots (campgrounds, parks) often have no city: use the village, else county
        name: a.city || a.town || a.village || a.hamlet || a.county || 'Current location',
        region: a.state || '',
        country: a.country || '',
        lat,
        lon,
        timezone,
        zip: (/^\d{5}/.exec(a.postcode || '') || [''])[0], // "86023-1234" -> "86023"
      },
    };
  },

  /** Open-Meteo forecast + NWS alerts, shaped like the old Dark Sky response */
  async getWeather({ lat, lon }) {
    const [{ data: w }, alerts] = await Promise.all([
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,weather_code,wind_speed_10m,is_day,precipitation_probability,visibility',
          hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
          daily:
            'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max,relative_humidity_2m_mean',
          temperature_unit: 'fahrenheit',
          wind_speed_unit: 'mph',
          timezone: 'auto',
          timeformat: 'unixtime',
          forecast_days: 7,
          forecast_hours: 10,
        },
      }),
      this.getAlerts({ lat, lon }),
    ]);

    const c = w.current;
    const [icon, summary] = describeWeather(c.weather_code, c.is_day);
    const d = w.daily;
    const h = w.hourly;

    return {
      timezone: w.timezone,
      elevation: w.elevation, // meters
      alerts,
      currently: {
        icon,
        summary,
        temperature: c.temperature_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        precipProbability: pct(c.precipitation_probability),
      },
      daily: {
        data: d.time.map((time, i) => {
          const [dayIcon, daySummary] = describeWeather(d.weather_code[i]);
          return {
            time,
            icon: dayIcon,
            summary: daySummary,
            temperatureHigh: d.temperature_2m_max[i],
            temperatureLow: d.temperature_2m_min[i],
            precipProbability: pct(d.precipitation_probability_max[i]),
            windSpeed: d.wind_speed_10m_max[i],
            humidity: pct(d.relative_humidity_2m_mean[i]),
            sunriseTime: d.sunrise[i],
            sunsetTime: d.sunset[i],
            visibility: i === 0 ? Math.round(c.visibility / 1609.34) : null, // m -> mi
          };
        }),
      },
      hourly: {
        data: h.time.map((time, i) => ({
          time,
          icon: describeWeather(h.weather_code[i], h.is_day[i])[0],
          temperature: h.temperature_2m[i],
          precipProbability: pct(h.precipitation_probability[i]),
        })),
      },
    };
  },

  /** Active National Weather Service alerts (US only). Never throws. */
  async getAlerts({ lat, lon }) {
    try {
      const { data } = await axios.get('https://api.weather.gov/alerts/active', {
        params: { point: `${lat.toFixed(4)},${lon.toFixed(4)}` },
      });
      return data.features.map((f) => ({ title: f.properties.event, id: f.properties.id, headline: f.properties.headline }));
    } catch {
      return [];
    }
  },

  /**
   * GNews search -> { articles } in the old free-news shape.
   * @param {{ edition?: string, fresh?: boolean }} [opts] edition: keep the answer for that
   *   edition id; fresh: skip every cache (the EXTRA check)
   */
  async getNewsByLocation(query, { edition, fresh } = {}) {
    const apikey = import.meta.env.VITE_GNEWS_API_KEY;
    if (!apikey) throw new Error('Missing VITE_GNEWS_API_KEY in .env.local');
    const load = async () => {
      const { data } = await throttled(() => axios.get('https://gnews.io/api/v4/search', {
        params: { q: `"${query}"`, lang: 'en', country: 'us', max: 10, sortby: 'publishedAt', apikey },
      }));
      return data.articles;
    };
    let articles;
    if (fresh) articles = await load();
    else if (edition) articles = await editionCached(edition, query, load);
    else articles = await cached(`gnews:${query}`, load);
    return {
      articles: articles.map((a) => ({
        _id: a.id || a.url,
        title: a.title,
        summary: a.description || `${a.source.name} · ${new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        media: a.image,
        clean_url: a.source.name,
        link: a.url,
      })),
    };
  },

  /** OpenStreetMap restaurants (via Nominatim) within ~1.4mi, nearest first */
  async getRestaurants({ lat, lon }) {
    const d = 0.02; // degrees, roughly a 1.4mi box
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        amenity: 'restaurant',
        format: 'jsonv2',
        viewbox: [lon - d, lat + d, lon + d, lat - d].join(','),
        bounded: 1,
        limit: 40, // ponytail: Nominatim caps at 40 per request; paginate if the list needs more
        extratags: 1,
        addressdetails: 1,
      },
    });
    return data
      .filter((place) => place.name)
      .map((place) => {
        const t = place.extratags || {};
        const a = place.address || {};
        return {
          id: `${place.osm_type}/${place.osm_id}`,
          name: place.name,
          cuisine: (t.cuisine || 'restaurant').split(';')[0].replace(/_/g, ' '),
          address: [a.house_number, a.road].filter(Boolean).join(' '),
          hours: t.opening_hours || '',
          lat: Number(place.lat),
          lon: Number(place.lon),
          distance: milesBetween(lat, lon, Number(place.lat), Number(place.lon)),
          url: t.website || `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`,
          website: t.website || null, // the photo pipeline reads its share image
          // rare in OSM; only direct image links render (not Commons/Flickr pages)
          image: isDirectImage(t.image) ? t.image : null,
        };
      })
      .sort((x, y) => x.distance - y.distance);
  },
};
