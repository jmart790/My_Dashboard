import apiClient from '@/apiClient';

function getTimeOfDay(date, timezone) {
  if (date) {
    let time = new Date(date * 1000).toLocaleTimeString('en-US', { timeZone: timezone });
    let hour = time.split(' ')[0].split(':')[0];
    let ampm = time.split(' ')[1];
    return [hour, ampm];
  } else return '';
}

function formatPercent(percent) {
  return `${Math.round(percent * 100)}%`;
}

function getDay(date) {
  const days = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  if (date) {
    let day = new Date(date * 1000).getDay();
    return days[day];
  }
  return '';
}

const getDefaultState = () => ({
  weather: {},
  isLoading: false,
  error: null,
});

// Forecasts are cached for an hour per ~1km area (coordinates rounded to 0.01°), in
// localStorage so a refresh or another visit within the hour makes no request.
export const WEATHER_CACHE_KEY = 'myDashboard.weather.v1';
const WEATHER_TTL = 60 * 60 * 1000;
const areaKey = ({ lat, lon }) => `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;

function readWeatherCache() {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function cachedForecast(coordinates) {
  const hit = readWeatherCache()[areaKey(coordinates)];
  return hit && Date.now() - hit.at < WEATHER_TTL ? hit.data : null;
}

function cacheForecast(coordinates, data) {
  try {
    const now = Date.now();
    const cache = readWeatherCache();
    // drop expired areas so the cache stays as small as the places visited this hour
    Object.keys(cache).forEach((key) => {
      if (now - cache[key].at >= WEATHER_TTL) delete cache[key];
    });
    cache[areaKey(coordinates)] = { data, at: now };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked: it just refetches next time
  }
}

export default {
  namespaced: true,
  // function, not object: each store instance (and each test) gets fresh state
  state: getDefaultState,
  mutations: {
    SET_WEATHER(state, value) {
      state.weather = value;
    },
    SET_IS_LOADING(state, value) {
      state.isLoading = value;
    },
    SET_ERROR(state, value) {
      state.error = value;
    },
    RESET_DATA(state) {
      Object.assign(state, getDefaultState());
    },
  },
  getters: {
    error: (state) => state.error,
    isLoading: (state) => state.isLoading,
    weather: (state) => state.weather,
    hasWeatherData: ({ weather }) => !!Object.keys(weather).length,
    highAndLows({ weather }, { hasWeatherData }) {
      if (hasWeatherData) {
        let high = Math.round(weather.daily.data[0].temperatureHigh);
        let low = Math.round(weather.daily.data[0].temperatureLow);
        return `${high}° / ${low}°`;
      }
      return '';
    },
    hourlyForecast({ weather }, { hasWeatherData }) {
      if (hasWeatherData) {
        return weather.hourly.data.slice(0, 10).map((forecast) => {
          return {
            time: getTimeOfDay(forecast.time, weather.timezone),
            precipProbability: formatPercent(forecast.precipProbability),
            icon: forecast.icon,
            temperature: Math.round(forecast.temperature),
          };
        });
      }
      return [];
    },
    dailyForecast({ weather }, { hasWeatherData }) {
      if (hasWeatherData) {
        return weather.daily.data.map((forecast) => {
          return {
            time: getDay(forecast.time),
            icon: forecast.icon,
            precipProbability: formatPercent(forecast.precipProbability),
            high: Math.round(forecast.temperatureHigh),
            low: Math.round(forecast.temperatureLow),
            wind: forecast.windSpeed,
            humidity: forecast.humidity,
          };
        });
      }
      return [];
    },
    currentDetails({ weather }, { hasWeatherData }) {
      if (hasWeatherData) return { ...weather.daily.data[0], timezone: weather.timezone };
      return {};
    },
  },
  actions: {
    async getWeather({ commit }, coordinates) {
      commit('SET_ERROR', null);
      const cached = cachedForecast(coordinates);
      if (cached) {
        commit('SET_WEATHER', cached);
        return;
      }
      commit('SET_IS_LOADING', true);
      await apiClient
        .getWeather(coordinates)
        .then((data) => {
          commit('SET_WEATHER', data);
          cacheForecast(coordinates, data);
        })
        .catch((error) => commit('SET_ERROR', error));
      commit('SET_IS_LOADING', false);
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
