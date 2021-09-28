import apiClient from '@/apiClient';

const getDefaultState = () => ({
  restaurants: [],
  featuredRestaurant: {},
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
    SET_FEAUTURED_RESTAURANT(state, value) {
      state.featuredRestaurant = value;
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
    featuredRestaurant: (state) => state.featuredRestaurant
  },
  actions: {
    async getRestaurants({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getRestaurants(payload)
        .then(({ results }) => commit('SET_RESTAURANTS', results.venues))
        .catch((error) => commit('SET_ERROR', error))
        .finally(() => commit('SET_IS_LOADING', false));
    },
    async getFeaturedRestaurant({ commit }, restaurantId) {
      commit('SET_IS_LOADING', true);
      const payload = {id: restaurantId };
      await apiClient
        .getFeaturedRestaurant(payload)
        .then((data) => commit('SET_FEATURED_RESTAURANT', data))
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
