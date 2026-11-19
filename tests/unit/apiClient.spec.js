import axios from 'axios';
import apiClient from '@/apiClient';

vi.mock('axios');

describe('apiClient adapters', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('getLocation reshapes Zippopotam and adds the timezone from Open-Meteo', async () => {
    axios.get.mockImplementation((url) =>
      url.includes('zippopotam')
        ? Promise.resolve({
            data: {
              country: 'United States',
              places: [{ 'place name': 'Miami', state: 'Florida', latitude: '25.8', longitude: '-80.1' }],
            },
          })
        : Promise.resolve({ data: { timezone: 'America/New_York' } })
    );
    expect(await apiClient.getLocation('33137')).toEqual({
      location: {
        name: 'Miami',
        region: 'Florida',
        country: 'United States',
        lat: 25.8,
        lon: -80.1,
        timezone: 'America/New_York',
      },
    });
    expect(axios.get).toHaveBeenLastCalledWith('https://api.open-meteo.com/v1/forecast', {
      params: { latitude: 25.8, longitude: -80.1, timezone: 'auto' },
    });
  });

  it('getLocation still resolves with timezone null when Open-Meteo fails', async () => {
    axios.get.mockImplementation((url) =>
      url.includes('zippopotam')
        ? Promise.resolve({
            data: {
              country: 'United States',
              places: [{ 'place name': 'Miami', state: 'Florida', latitude: '25.8', longitude: '-80.1' }],
            },
          })
        : Promise.reject(new Error('timeout'))
    );
    const { location } = await apiClient.getLocation('33137');
    expect(location.timezone).toBeNull();
    expect(location.name).toBe('Miami');
  });

  it('getWeather maps Open-Meteo + NWS into the Dark Sky shape', async () => {
    axios.get.mockImplementation((url) =>
      url.includes('weather.gov')
        ? Promise.resolve({ data: { features: [{ properties: { event: 'Flood Watch' } }] } })
        : Promise.resolve({
            data: {
              timezone: 'America/New_York',
              current: {
                temperature_2m: 77.4,
                weather_code: 95,
                wind_speed_10m: 8.6,
                is_day: 0,
                precipitation_probability: 40,
                visibility: 16093.4,
              },
              daily: {
                time: [100],
                weather_code: [2],
                temperature_2m_max: [80],
                temperature_2m_min: [70],
                precipitation_probability_max: [55],
                wind_speed_10m_max: [12],
                relative_humidity_2m_mean: [87],
                sunrise: [50],
                sunset: [90],
              },
              hourly: { time: [100], weather_code: [0], is_day: [0], temperature_2m: [75], precipitation_probability: [5] },
            },
          })
    );

    const w = await apiClient.getWeather({ lat: 25.8, lon: -80.1 });
    expect(w.alerts).toEqual([{ title: 'Flood Watch' }]);
    expect(w.currently).toMatchObject({ icon: 'storm', summary: 'Thunderstorms', windSpeed: 9, precipProbability: 0.4 });
    expect(w.daily.data[0]).toMatchObject({
      icon: 'partly-cloudy-day',
      temperatureHigh: 80,
      humidity: 0.87,
      sunriseTime: 50,
      visibility: 10,
    });
    expect(w.hourly.data[0]).toMatchObject({ icon: 'clear-night', precipProbability: 0.05 });
  });

  it('getAlerts returns [] instead of throwing outside the US', async () => {
    axios.get.mockRejectedValue(new Error('404'));
    expect(await apiClient.getAlerts({ lat: 51.5, lon: -0.1 })).toEqual([]);
  });

  it('getRestaurants drops unnamed places and sorts nearest first', async () => {
    axios.get.mockResolvedValue({
      data: [
        { name: 'Far', osm_type: 'node', osm_id: 1, lat: '25.83', lon: '-80.19', extratags: { cuisine: 'cuban;american' } },
        { name: '', osm_type: 'node', osm_id: 2, lat: '25.81', lon: '-80.19' },
        { name: 'Near', osm_type: 'way', osm_id: 3, lat: '25.8157', lon: '-80.19', address: { house_number: '1', road: 'Main St' } },
      ],
    });
    const list = await apiClient.getRestaurants({ lat: 25.8156, lon: -80.1897 });
    expect(list.map((r) => r.name)).toEqual(['Near', 'Far']);
    expect(list[0]).toMatchObject({ address: '1 Main St', url: 'https://www.openstreetmap.org/way/3' });
    expect(list[1].cuisine).toBe('cuban');
    expect(list[0]).toMatchObject({ lat: 25.8157, lon: -80.19 });
  });

  it('getNewsByLocation maps GNews articles and caches per query', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', 'test-key');
    axios.get.mockResolvedValue({
      data: {
        articles: [
          {
            id: 'a1',
            title: 'Headline',
            description: null,
            url: 'https://x.com/a',
            image: 'https://x.com/a.jpg',
            publishedAt: '2026-11-18T12:00:00Z',
            source: { name: 'X News' },
          },
        ],
      },
    });
    const first = await apiClient.getNewsByLocation('Miami');
    expect(first.articles[0]).toMatchObject({
      _id: 'a1',
      media: 'https://x.com/a.jpg',
      link: 'https://x.com/a',
      summary: 'X News · Nov 18',
    });
    await apiClient.getNewsByLocation('Miami');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('getNewsByLocation fails clearly without an API key', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', '');
    await expect(apiClient.getNewsByLocation('Miami')).rejects.toThrow('VITE_GNEWS_API_KEY');
  });
});
