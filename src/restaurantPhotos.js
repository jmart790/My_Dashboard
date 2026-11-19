import axios from 'axios';
import { dishPhotoFor } from '@/dishPhotos';

// Picks a photo for a restaurant, best source first:
//   1. its own OSM `image` tag (rare, but it's really them)
//   2. its website's share image, via our /api/og-image server endpoint
//   3. a TheMealDB dish for its cuisine, captioned "Example dish: ..."
// null means none of them: the caller shows the illustration.
// Results are cached per restaurant in localStorage, so the list and popup don't
// re-ask the server for places this browser has already seen.

export const PHOTO_CACHE_KEY = 'myDashboard.photos.v2';
const DAY = 24 * 60 * 60 * 1000;
const TTL = { hit: 7 * DAY, miss: DAY }; // misses retry sooner: sites add images
const MAX_ENTRIES = 400; // ~10 areas of 40 places; oldest are dropped first

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCache(id, photo) {
  try {
    const cache = readCache();
    cache[id] = { photo, at: Date.now() };
    const ids = Object.keys(cache);
    if (ids.length > MAX_ENTRIES) {
      ids
        .sort((a, b) => cache[a].at - cache[b].at)
        .slice(0, ids.length - MAX_ENTRIES)
        .forEach((old) => delete cache[old]);
    }
    localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked: photos still work, just uncached
  }
}

function websiteImage(website) {
  return axios
    // v: early versions of the endpoint let browsers HTTP-cache answers for a day;
    // a new query string skips those stale entries
    .get('/api/og-image', { params: { url: website, v: 2 } })
    .then(({ data }) => data.image || null)
    .catch(() => null); // no server (static build) or fetch failed: next source
}

async function resolve(restaurant, skip) {
  if (restaurant.image && !skip.includes('osm')) {
    return { url: restaurant.image, caption: null, source: 'osm' };
  }
  if (restaurant.website && !skip.includes('website')) {
    const url = await websiteImage(restaurant.website);
    if (url) return { url, caption: null, source: 'website' };
  }
  if (!skip.includes('dish')) {
    const dish = await dishPhotoFor(restaurant.cuisine);
    if (dish) return { ...dish, source: 'dish' };
  }
  return null;
}

const inflight = new Map(); // id -> Promise, so the list and popup share one lookup

/**
 * @param {{ id: string, image?: string, website?: string, cuisine?: string }} restaurant
 * @param {{ skip?: Array<'osm'|'website'|'dish'> }} options sources whose image failed to load
 * @returns {Promise<{ url: string, caption: string|null, source: string } | null>}
 */
export function photoFor(restaurant, { skip = [] } = {}) {
  const entry = readCache()[restaurant.id];
  if (entry) {
    const fresh = Date.now() - entry.at < (entry.photo ? TTL.hit : TTL.miss);
    const usable = !entry.photo || !skip.includes(entry.photo.source);
    if (fresh && usable) return Promise.resolve(entry.photo);
  }
  const key = `${restaurant.id}|${skip.join(',')}`;
  if (!inflight.has(key)) {
    inflight.set(
      key,
      resolve(restaurant, skip)
        .then((photo) => {
          writeCache(restaurant.id, photo);
          return photo;
        })
        .finally(() => inflight.delete(key))
    );
  }
  return inflight.get(key);
}
