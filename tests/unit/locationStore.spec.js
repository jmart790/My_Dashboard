import { createStore } from 'vuex';
import apiClient from '@/apiClient';
import location, { STORAGE_KEY, DEFAULT_LOCATION } from '@/store/modules/location';

vi.mock('@/apiClient', () => ({ default: { getLocation: vi.fn(), reverseGeocode: vi.fn() } }));

const MIAMI = { name: 'Miami', region: 'Florida', country: 'United States', lat: 25.8, lon: -80.1, timezone: 'America/New_York' };
const DENVER = { name: 'Denver', region: 'Colorado', country: 'United States', lat: 39.7, lon: -105.0, timezone: 'America/Denver' };

const makeStore = () => createStore({ modules: { location } });
const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY));

// navigator.geolocation stand-ins
const grant = (lat, lon) => ({
  getCurrentPosition: (ok) => ok({ coords: { latitude: lat, longitude: lon } }),
});
const deny = () => ({
  getCurrentPosition: (_ok, fail) => fail({ code: 1, PERMISSION_DENIED: 1, message: 'denied' }),
});

describe('location store', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('saves a zip search so it survives a refresh', async () => {
    apiClient.getLocation.mockResolvedValue({ location: MIAMI });
    const store = makeStore();
    await store.dispatch('location/getLocation', '33137');
    expect(saved()).toEqual({ location: MIAMI, source: 'zip' });
    expect(store.getters['location/source']).toBe('zip');
  });

  it('restores the saved location on init without asking for GPS or refetching', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ location: DENVER, source: 'gps' }));
    const geolocation = { getCurrentPosition: vi.fn() };
    vi.stubGlobal('navigator', { geolocation });
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DENVER);
    expect(store.getters['location/source']).toBe('gps');
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(apiClient.getLocation).not.toHaveBeenCalled();
  });

  it('locateMe reverse-geocodes the device position and saves it', async () => {
    vi.stubGlobal('navigator', { geolocation: grant(39.7, -105.0) });
    apiClient.reverseGeocode.mockResolvedValue({ location: DENVER });
    const store = makeStore();
    await store.dispatch('location/locateMe');
    expect(apiClient.reverseGeocode).toHaveBeenCalledWith({ lat: 39.7, lon: -105.0 });
    expect(store.getters['location/location']).toEqual(DENVER);
    expect(saved()).toEqual({ location: DENVER, source: 'gps' });
    expect(store.getters['location/locating']).toBe(false);
  });

  it('locateMe keeps the current location and explains when permission is denied', async () => {
    apiClient.getLocation.mockResolvedValue({ location: MIAMI });
    const store = makeStore();
    await store.dispatch('location/getLocation', '33137');
    vi.stubGlobal('navigator', { geolocation: deny() });
    await expect(store.dispatch('location/locateMe')).rejects.toBeTruthy();
    expect(store.getters['location/location']).toEqual(MIAMI);
    expect(store.getters['location/geoError']).toMatch(/blocked/i);
    expect(store.getters['location/locating']).toBe(false);
  });

  // navigator stand-in with a Permissions API answer for geolocation
  const withPermission = (state, geolocation) => ({
    geolocation,
    permissions: { query: async () => ({ state }) },
  });

  it('first visit shows the built-in default at once, with no prompt and no lookup', async () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', withPermission('prompt', { getCurrentPosition }));
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DEFAULT_LOCATION);
    expect(getCurrentPosition).not.toHaveBeenCalled(); // never prompts on load
    expect(apiClient.getLocation).not.toHaveBeenCalled();
    // not the reader's choice: not saved
    expect(saved()).toBeNull();
    expect(store.getters['location/source']).toBeNull();
  });

  it('first visit uses the device location when the site is already allowed', async () => {
    vi.stubGlobal('navigator', withPermission('granted', grant(39.7, -105.0)));
    apiClient.reverseGeocode.mockResolvedValue({ location: DENVER });
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DENVER);
    expect(store.getters['location/source']).toBe('gps');
  });

  it('keeps the default quietly if an allowed device lookup fails', async () => {
    vi.stubGlobal('navigator', withPermission('granted', deny()));
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DEFAULT_LOCATION);
    expect(store.getters['location/geoError']).toBeNull();
  });

  it('ignores corrupt saved data', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    vi.stubGlobal('navigator', {});
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DEFAULT_LOCATION);
  });
});
