import { createStore } from 'vuex';
import apiClient from '@/apiClient';
import restaurants from '@/store/modules/restaurants';

vi.mock('@/apiClient', () => ({ default: { getRestaurants: vi.fn() } }));

// Wed 2026-11-18 15:00 UTC = 10am in New York
const NOW = new Date('2026-11-18T15:00:00Z');

const place = (id, name, cuisine, hours, distance) => ({
  id,
  name,
  cuisine,
  hours,
  distance,
  lat: 25.81,
  lon: -80.19,
  address: '',
  url: '',
});

const LIST = [
  place('n/1', 'Zeta Pizza', 'pizza', 'Mo-Fr 09:00-17:00', 0.1), // open
  place('n/2', 'Alpha Cuban', 'cuban', 'Mo-Fr 18:00-22:00', 0.2), // closed
  place('n/3', 'Mid Pizza', 'pizza', '', 0.3), // unknown
  place('n/4', 'Generic', 'restaurant', '24/7', 0.4), // open
];

function makeStore() {
  return createStore({
    modules: {
      restaurants,
      location: {
        namespaced: true,
        getters: { location: () => ({ timezone: 'America/New_York', lat: 25.81, lon: -80.19 }) },
      },
    },
  });
}

async function loaded() {
  const store = makeStore();
  apiClient.getRestaurants.mockResolvedValue(LIST);
  await store.dispatch('restaurants/getRestaurants', { lat: 25.81, lon: -80.19 });
  return store;
}

const ids = (list) => list.map((r) => r.id);

describe('restaurants store', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('computes open status per restaurant in the location timezone', async () => {
    const store = await loaded();
    expect(store.getters['restaurants/openStatus']).toEqual({
      'n/1': 'open',
      'n/2': 'closed',
      'n/3': 'unknown',
      'n/4': 'open',
    });
  });

  it('features an open restaurant after loading', async () => {
    for (let i = 0; i < 10; i++) {
      const store = await loaded();
      expect(['n/1', 'n/4']).toContain(store.getters['restaurants/featured'].id);
    }
  });

  it('features any restaurant when none are open', async () => {
    const store = makeStore();
    apiClient.getRestaurants.mockResolvedValue([LIST[1], LIST[2]]);
    await store.dispatch('restaurants/getRestaurants', { lat: 0, lon: 0 });
    expect(['n/2', 'n/3']).toContain(store.getters['restaurants/featured'].id);
  });

  it('sorts by name or keeps distance order', async () => {
    const store = await loaded();
    expect(ids(store.getters['restaurants/filteredRestaurants'])).toEqual(['n/1', 'n/2', 'n/3', 'n/4']);
    await store.dispatch('restaurants/setSort', 'name');
    expect(ids(store.getters['restaurants/filteredRestaurants'])).toEqual(['n/2', 'n/4', 'n/3', 'n/1']);
  });

  it('filters by cuisine', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setCuisine', 'pizza');
    expect(ids(store.getters['restaurants/filteredRestaurants'])).toEqual(['n/1', 'n/3']);
  });

  it('open-now hides closed and unknown hours', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setOpenNow', true);
    expect(ids(store.getters['restaurants/filteredRestaurants'])).toEqual(['n/1', 'n/4']);
  });

  it('lists cuisines by count, without the generic bucket', async () => {
    const store = await loaded();
    expect(store.getters['restaurants/cuisines']).toEqual([
      { name: 'pizza', count: 2 },
      { name: 'cuban', count: 1 },
    ]);
  });

  it('shuffle picks from the filtered list and avoids repeating', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setCuisine', 'pizza');
    await store.dispatch('restaurants/selectRestaurant', 'n/1');
    for (let i = 0; i < 5; i++) {
      await store.dispatch('restaurants/shuffleFeatured');
      expect(store.getters['restaurants/featured'].id).toBe('n/3');
      await store.dispatch('restaurants/selectRestaurant', 'n/1');
    }
  });

  it('shuffle clears the featured pick when filters match nothing', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setCuisine', 'cuban');
    await store.dispatch('restaurants/setOpenNow', true);
    await store.dispatch('restaurants/shuffleFeatured');
    expect(store.getters['restaurants/featured']).toBeNull();
  });

  it('resets filters when a new list loads', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setCuisine', 'pizza');
    await store.dispatch('restaurants/setOpenNow', true);
    await store.dispatch('restaurants/setSort', 'name');
    await store.dispatch('restaurants/getRestaurants', { lat: 0, lon: 0 });
    expect(store.getters['restaurants/cuisine']).toBeNull();
    expect(store.getters['restaurants/openNow']).toBe(false);
    expect(store.getters['restaurants/sort']).toBe('distance');
  });

  it('tracks the hovered restaurant and clears it on a new load', async () => {
    const store = await loaded();
    await store.dispatch('restaurants/setHovered', 'n/2');
    expect(store.getters['restaurants/hoveredId']).toBe('n/2');
    await store.dispatch('restaurants/setHovered', null);
    expect(store.getters['restaurants/hoveredId']).toBeNull();
    await store.dispatch('restaurants/setHovered', 'n/3');
    await store.dispatch('restaurants/getRestaurants', { lat: 0, lon: 0 });
    expect(store.getters['restaurants/hoveredId']).toBeNull();
  });

  it('records errors and stops loading', async () => {
    const store = makeStore();
    apiClient.getRestaurants.mockRejectedValue(new Error('down'));
    await store.dispatch('restaurants/getRestaurants', { lat: 0, lon: 0 });
    expect(store.getters['restaurants/error'].message).toBe('down');
    expect(store.getters['restaurants/isLoading']).toBe(false);
    expect(store.getters['restaurants/featured']).toBeNull();
  });
});
