// localStorage cache for the Media page's feeds: one entry per key, each with its own TTL.
// Charts and listings change slowly, so a refresh or a second visit makes no request.

export const MEDIA_CACHE_KEY = 'myDashboard.media.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(MEDIA_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * @param {string} key unique per feed and its inputs (e.g. 'tv|2026-11-20')
 * @param {number | ((data: any) => number)} ttl milliseconds an answer stays fresh,
 *   or a function of the answer (e.g. shorter for an empty one)
 * @param {() => Promise<any>} load fetches the data when there's no fresh copy
 */
export async function cached(key, ttl, load) {
  const hit = readAll()[key];
  const ttlFor = (data) => (typeof ttl === 'function' ? ttl(data) : ttl);
  if (hit && Date.now() - hit.at < ttlFor(hit.data)) return hit.data;
  const data = await load();
  try {
    const now = Date.now();
    const all = readAll();
    // ponytail: entries expire by age only; a dropped feed's last entry lingers until it's overwritten
    Object.keys(all).forEach((k) => {
      if (now - all[k].at > 7 * 24 * 60 * 60 * 1000) delete all[k];
    });
    all[key] = { data, at: now };
    localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(all));
  } catch {
    // storage full or blocked: it just refetches next time
  }
  return data;
}
