import OpeningHours from 'opening_hours';

// opening_hours evaluates a Date by its local fields (getHours, getDay...).
// Build a Date whose local fields equal the wall-clock time in `timeZone`,
// so a Denver restaurant is checked against Denver time wherever the viewer is.
function wallClock(now, timeZone) {
  if (!timeZone) return now;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value])
  );
  return new Date(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
}

// Parsing is the slow part; the same strings repeat across renders.
// ponytail: unbounded cache, fine for a 40-item list per search; add an LRU if it grows.
const cache = new Map();

function parse(hours, lat, lon) {
  const key = `${hours}|${lat}|${lon}`;
  if (!cache.has(key)) {
    let parsed;
    try {
      // lat/lon/country let the library resolve sunrise/sunset and US public holidays (PH)
      parsed = new OpeningHours(hours, { lat, lon, address: { country_code: 'us' } });
    } catch {
      parsed = null; // unparseable OSM hours are "unknown", not an error
    }
    cache.set(key, parsed);
  }
  return cache.get(key);
}

/**
 * @param {string} hours OSM opening_hours value, e.g. "Mo-Fr 09:00-17:00"
 * @param {{ timezone?: string|null, lat?: number, lon?: number }} place
 * @param {Date} now
 * @returns {true|false|null} null when the hours are missing, unparseable, or unknown right now
 */
export function isOpenNow(hours, { timezone = null, lat = 0, lon = 0 } = {}, now = new Date()) {
  if (!hours) return null;
  const parsed = parse(hours, lat, lon);
  if (!parsed) return null;
  const local = wallClock(now, timezone);
  if (parsed.getUnknown(local)) return null;
  return parsed.getState(local);
}
