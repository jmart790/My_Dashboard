// import apiClient from '@/apiClient';
import weatherResponse from '@/test-responses/weatherResponse.json';

function getTimeOfDay(date, timezone) {
  if (date) {
    let time = new Date(date * 1000).toLocaleTimeString("en-US", { timezone,});
    let hour = time.split(" ")[0].split(":")[0];
    let ampm = time.split(" ")[1];
    return [hour, ampm];
  } else return "";
}

function formatPercent(percent) {
  return `${Math.round(percent * 100)}%`;
}

function getDay(date) {
  const days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  if (date) {
    let day = new Date(date * 1000).getDay();
    return days[day];
  }
  return "";
}

const getDefaultState = () => {
  return {
    weather: {},
    isLoading: false,
    error: null,
  };
};

export const state = () => getDefaultState();

export const mutations = {
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
};
export const getters = {
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
  hourlyForecast({weather}, { hasWeatherData }) {
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
          humidity: forecast.humidity
        };
      });
    }
    return [];
  },
  currentDetails({ weather }, { hasWeatherData }) {
    if (hasWeatherData) return weather.daily.data[0]
    return {};
  }
};

export const actions = {
  // eslint-disable-next-line no-unused-vars
  async getWeather({ commit }, coordinates) {
    commit('SET_IS_LOADING', true);
    commit('SET_WEATHER', weatherResponse);
    // await apiClient
    //   .getWeather(coordinates)
    //   .then((data) => commit('SET_WEATHER', data))
    //   .catch((error) => commit('SET_ERROR', error));
    commit('SET_IS_LOADING', false);
  },
  resetState: {
    root: true,
    handler({ commit }) {
      commit('RESET_DATA');
    },
  },
};

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};