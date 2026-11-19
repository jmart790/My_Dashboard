import apiClient from '@/apiClient';

const getDefaultState = () => ({
  restaurants: [],
  isLoading: false,
  error: null,
});

export default {
  namespaced: true,
  state: getDefaultState(),
  mutations: {
    SET_RESTAURANTS(state, value) {
      state.restaurants = value;
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
    restaurants: (state) => state.restaurants,
  },
  actions: {
    async getRestaurants({ commit }, coordinates) {
      commit('SET_IS_LOADING', true);
      commit('SET_ERROR', null);
      await apiClient
        .getRestaurants(coordinates)
        .then((venues) => commit('SET_RESTAURANTS', venues))
        .catch((error) => commit('SET_ERROR', error))
        .finally(() => commit('SET_IS_LOADING', false));
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
