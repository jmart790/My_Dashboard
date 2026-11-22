// The paper's clock. Two editions a day, by the reader's local time:
// the Morning Edition goes to press at 5 AM, the Evening Edition at 4 PM.
// Before 5 AM it is still the previous day's Evening Edition.

export const MORNING_HOUR = 5;
export const EVENING_HOUR = 16;

/** Wall-clock parts of `date` in `timeZone` (falls back to the browser's zone). */
export function localParts(date, timeZone) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timeZone || undefined }).formatToParts(date);
  } catch {
    parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date); // unknown zone name
  }
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

const iso = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

function previousDay(parts) {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * The edition on sale at `date`.
 * @returns {{ id: string, date: string, evening: boolean, name: string, press: string }}
 *   id is unique per edition (e.g. '2026-11-21-pm'); date is the paper's date.
 */
export function editionFor(date = new Date(), timeZone) {
  const now = localParts(date, timeZone);
  let day = now;
  let evening;
  if (now.hour < MORNING_HOUR) {
    day = previousDay(now);
    evening = true;
  } else {
    evening = now.hour >= EVENING_HOUR;
  }
  const paperDate = iso(day);
  return {
    id: `${paperDate}-${evening ? 'pm' : 'am'}`,
    date: paperDate,
    evening,
    name: evening ? 'Evening Edition' : 'Morning Edition',
    press: evening ? '4 PM' : '5 AM',
  };
}

/**
 * How yellowed the paper looks, 0 (fresh at 5 AM) to 1 (late night).
 * ponytail: linear ramp; swap for a curve if the evening shift reads too sudden.
 */
export function paperAge(date = new Date(), timeZone) {
  const { hour, minute } = localParts(date, timeZone);
  const sinceDawn = (hour - MORNING_HOUR + 24) % 24 + minute / 60; // 0 at 5 AM
  return Math.min(1, sinceDawn / 18); // full by 11 PM, stays until 5 AM
}
