import { createStore } from 'vuex';
import apiClient from '@/apiClient';
import location, { STORAGE_KEY } from '@/store/modules/location';

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

  it('first visit uses the device location', async () => {
    vi.stubGlobal('navigator', { geolocation: grant(39.7, -105.0) });
    apiClient.reverseGeocode.mockResolvedValue({ location: DENVER });
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(DENVER);
    expect(apiClient.getLocation).not.toHaveBeenCalled();
  });

  it('first visit falls back to the default zip when location is unavailable', async () => {
    vi.stubGlobal('navigator', { geolocation: deny() });
    apiClient.getLocation.mockResolvedValue({ location: MIAMI });
    const store = makeStore();
    await store.dispatch('location/init');
    expect(apiClient.getLocation).toHaveBeenCalledWith('33137');
    expect(store.getters['location/location']).toEqual(MIAMI);
    // a first-visit fallback is not an error the user asked about
    expect(store.getters['location/geoError']).toBeNull();
    // and not a choice: not saved, so the next visit tries the device location again
    expect(saved()).toBeNull();
    expect(store.getters['location/source']).toBeNull();
  });

  it('ignores corrupt saved data', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    vi.stubGlobal('navigator', {});
    apiClient.getLocation.mockResolvedValue({ location: MIAMI });
    const store = makeStore();
    await store.dispatch('location/init');
    expect(store.getters['location/location']).toEqual(MIAMI);
  });
});
