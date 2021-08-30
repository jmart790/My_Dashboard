// import apiClient from '@/apiClient';
import locationResponse from '@/test-responses/locationResponse';

const getDefaultState = () => {
  return {
    location: {
      country: "",
      localtime: "",
      name: '',
      region: '',
      lat: '',
      lon: ''
    },
    zipcode: '',
    isLoading: false,
    error: null,
  };

};

export const state = () => getDefaultState();

export const mutations = {
  SET_LOCATION(state, value) {
    state.location = value;
  },
  SET_ZIPCODE(state, value) {
    state.zipcode = value;
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
  weather: (state) => state.weather,
  location: (state) => state.location,
  coordinates: ({ location }) => ({lat: location.lat, lon: location.lon }),
  cityState: ({ location }) => `${location.name}, ${location.region}`,
  zipcode: (state) => state.zipcode,
};

export const actions = {
  // eslint-disable-next-line no-unused-vars
  async getLocation({ commit }, zipcode) {
    commit('SET_IS_LOADING', true);
    commit('SET_LOCATION', locationResponse.location)
    // await apiClient
    //   .getLocation(zipcode)
    //   .then((data) => commit('SET_LOCATION', data.location))
    //   .catch((error) => commit('SET_ERROR', error));
    commit('SET_IS_LOADING', false);
  },
  setZipcode({ commit }, value) {
    commit('SET_ZIPCODE', value)
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