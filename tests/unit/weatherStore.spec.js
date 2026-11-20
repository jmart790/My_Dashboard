import { createStore } from 'vuex';
import apiClient from '@/apiClient';
import weather, { WEATHER_CACHE_KEY } from '@/store/modules/weather';

vi.mock('@/apiClient', () => ({ default: { getWeather: vi.fn() } }));

const FORECAST = { timezone: 'America/New_York', currently: { temperature: 74 }, daily: { data: [] }, hourly: { data: [] }, alerts: [] };
const MIAMI = { lat: 25.8156, lon: -80.1897 };
const HOUR = 60 * 60 * 1000;
const makeStore = () => createStore({ modules: { weather } });

describe('weather store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-19T15:00:00Z'));
  });
  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('fetches and stores the forecast', async () => {
    apiClient.getWeather.mockResolvedValue(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    expect(store.getters['weather/weather']).toEqual(FORECAST);
    expect(store.getters['weather/isLoading']).toBe(false);
  });

  it('reuses a forecast under an hour old, even after a refresh', async () => {
    apiClient.getWeather.mockResolvedValue(FORECAST);
    await makeStore().dispatch('weather/getWeather', MIAMI);
    vi.setSystemTime(Date.now() + 59 * 60 * 1000);
    const afterRefresh = makeStore(); // new store = page reload; cache lives in localStorage
    await afterRefresh.dispatch('weather/getWeather', MIAMI);
    expect(apiClient.getWeather).toHaveBeenCalledTimes(1);
    expect(afterRefresh.getters['weather/weather']).toEqual(FORECAST);
  });

  it('refetches once the cached forecast is an hour old', async () => {
    apiClient.getWeather.mockResolvedValue(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    vi.setSystemTime(Date.now() + HOUR + 1);
    await store.dispatch('weather/getWeather', MIAMI);
    expect(apiClient.getWeather).toHaveBeenCalledTimes(2);
  });

  it('treats nearby coordinates (same ~1km area) as the same place', async () => {
    apiClient.getWeather.mockResolvedValue(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    await store.dispatch('weather/getWeather', { lat: 25.8161, lon: -80.1893 });
    expect(apiClient.getWeather).toHaveBeenCalledTimes(1);
  });

  it('fetches separately for a different place', async () => {
    apiClient.getWeather.mockResolvedValue(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    await store.dispatch('weather/getWeather', { lat: 39.7392, lon: -104.9903 });
    expect(apiClient.getWeather).toHaveBeenCalledTimes(2);
    expect(Object.keys(JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)))).toHaveLength(2);
  });

  it('does not cache failures', async () => {
    apiClient.getWeather.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    expect(store.getters['weather/error'].message).toBe('down');
    await store.dispatch('weather/getWeather', MIAMI);
    expect(store.getters['weather/error']).toBeNull();
    expect(store.getters['weather/weather']).toEqual(FORECAST);
  });

  it('works when storage is unavailable', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    apiClient.getWeather.mockResolvedValue(FORECAST);
    const store = makeStore();
    await store.dispatch('weather/getWeather', MIAMI);
    expect(store.getters['weather/weather']).toEqual(FORECAST);
    getItem.mockRestore();
  });
});
