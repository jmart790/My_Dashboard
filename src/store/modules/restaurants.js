import apiClient from '@/apiClient';
import { isOpenNow } from '@/openingHours';

const getDefaultFilters = () => ({
  sort: 'distance', // 'distance' | 'name'
  openNow: false,
  cuisine: null,
});

const getDefaultState = () => ({
  restaurants: [], // nearest first, as returned by apiClient
  isLoading: false,
  error: null,
  featuredId: null,
  ...getDefaultFilters(),
});

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

export default {
  namespaced: true,
  // function, not object: each store instance (and each test) gets fresh state
  state: getDefaultState,
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
    SET_SORT(state, value) {
      state.sort = value;
    },
    SET_OPEN_NOW(state, value) {
      state.openNow = value;
    },
    SET_CUISINE(state, value) {
      state.cuisine = value;
    },
    CLEAR_FILTERS(state) {
      Object.assign(state, getDefaultFilters());
    },
    SET_FEATURED_ID(state, value) {
      state.featuredId = value;
    },
    RESET_DATA(state) {
      Object.assign(state, getDefaultState());
    },
  },
  getters: {
    restaurants: (state) => state.restaurants,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    sort: (state) => state.sort,
    openNow: (state) => state.openNow,
    cuisine: (state) => state.cuisine,
    // ponytail: cached until the list or location changes, so status can go stale
    // on a page left open for hours; add a minute ticker in state if that matters.
    openStatus(state, _getters, _rootState, rootGetters) {
      const { timezone } = rootGetters['location/location'];
      const now = new Date();
      const label = { true: 'open', false: 'closed', null: 'unknown' };
      return Object.fromEntries(
        state.restaurants.map((r) => [r.id, label[isOpenNow(r.hours, { timezone, lat: r.lat, lon: r.lon }, now)]])
      );
    },
    filteredRestaurants(state, getters) {
      let list = state.restaurants;
      if (state.cuisine) list = list.filter((r) => r.cuisine === state.cuisine);
      if (state.openNow) list = list.filter((r) => getters.openStatus[r.id] === 'open');
      if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      return list;
    },
    cuisines(state) {
      const counts = {};
      state.restaurants.forEach(({ cuisine }) => {
        if (cuisine !== 'restaurant') counts[cuisine] = (counts[cuisine] || 0) + 1;
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));
    },
    // looked up in the full list so a filter change never leaves a dangling id
    featured: (state) => state.restaurants.find((r) => r.id === state.featuredId) || null,
  },
  actions: {
    async getRestaurants({ commit, dispatch }, coordinates) {
      commit('SET_IS_LOADING', true);
      commit('SET_ERROR', null);
      commit('CLEAR_FILTERS');
      commit('SET_FEATURED_ID', null);
      try {
        commit('SET_RESTAURANTS', await apiClient.getRestaurants(coordinates));
        dispatch('pickInitialFeatured');
      } catch (error) {
        commit('SET_RESTAURANTS', []);
        commit('SET_ERROR', error);
      } finally {
        commit('SET_IS_LOADING', false);
      }
    },
    pickInitialFeatured({ state, getters, commit }) {
      const open = state.restaurants.filter((r) => getters.openStatus[r.id] === 'open');
      const pool = open.length ? open : state.restaurants;
      commit('SET_FEATURED_ID', pool.length ? pickRandom(pool).id : null);
    },
    shuffleFeatured({ state, getters, commit }) {
      const list = getters.filteredRestaurants;
      const pool = list.length > 1 ? list.filter((r) => r.id !== state.featuredId) : list;
      commit('SET_FEATURED_ID', pool.length ? pickRandom(pool).id : null);
    },
    selectRestaurant({ commit }, id) {
      commit('SET_FEATURED_ID', id);
    },
    setSort({ commit }, value) {
      commit('SET_SORT', value);
    },
    setOpenNow({ commit }, value) {
      commit('SET_OPEN_NOW', value);
    },
    setCuisine({ commit }, value) {
      commit('SET_CUISINE', value);
    },
    clearFilters({ commit }) {
      commit('CLEAR_FILTERS');
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
