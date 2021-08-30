import apiClient from '@/apiClient';
import localNewsResponse from '@/test-responses/localNewsResponse';

const getDefaultState = () => ({
  news: {
    local: [],
    state: [],
    topHeadlines: [],
  },
  isLoading: false,
  error: null,
});

export default {
  namespaced: true,
  state: getDefaultState(),
  mutations: {
    SET_LOCAL_NEWS(state, value) {
      state.news.local = value;
    },
    SET_STATE_NEWS(state, value) {
      state.news.state = value;
    },
    SET_TOP_HEADLINES_NEWS(state, value) {
      state.news.topHeadlines = value;
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
    news: (state) => state.news,
  },
  actions: {
    async getLocalNews({ commit }, _payload) {
      commit('SET_IS_LOADING', true);
      commit('SET_LOCAL_NEWS', localNewsResponse);
      // await apiClient
      //   .getNewsByLocation(payload)
      //   .then((data) => commit('SET_LOCAL_NEWS', data.articles))
      //   .catch((error) => commit('SET_ERROR', error));
      commit('SET_IS_LOADING', false);
    },
    async getStateNews({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getNewsByLocation(payload)
        .then((data) => commit('SET_STATE_NEWS', data.articles))
        .catch((error) => commit('SET_ERROR', error));
      commit('SET_IS_LOADING', false);
    },
    async getTopNewsHeadlines({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getTopNewsHeadlines(payload)
        .then((data) => commit('SET_TOP_HEADLINES_NEWS', data.articles))
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
