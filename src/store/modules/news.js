import apiClient from '@/apiClient';

const getDefaultState = () => ({
  news: {
    local: [],
    state: [],
    country: [],
  },
  error: {
    local: false,
    state: false,
    country: false,
  },
  isLoading: false,
});

function filterArticles(articles) {
  if (articles.length < 1) return [];
  const articlesWithContent = articles.filter(
    (article) => article.media && article.clean_url && article.title && article.summary
  );
  const seen = new Set();
  const articlesWithoutDupes = articlesWithContent.filter((article) => {
    const duplicate = seen.has(article.title);
    seen.add(article.title);
    return !duplicate;
  });
  return articlesWithoutDupes;
}

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
    SET_COUNTRY_NEWS(state, value) {
      state.news.country = value;
    },
    SET_IS_LOADING(state, value) {
      state.isLoading = value;
    },
    SET_ERROR(state, { key, error }) {
      state[key] = error;
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
    async getLocalNews({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getNewsByLocation(payload)
        .then((data) => commit('SET_LOCAL_NEWS', filterArticles(data.articles)))
        .catch(({ response }) => commit('SET_ERROR', { response, errorType: 'local' }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      commit('SET_ERROR', { key: 'local', error: false });
      commit('SET_IS_LOADING', false);
    },
    async getStateNews({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getNewsByLocation(payload)
        .then((data) => commit('SET_STATE_NEWS', filterArticles(data.articles)))
        .catch(({ response }) => commit('SET_ERROR', { response, errorType: 'state' }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      commit('SET_ERROR', { key: 'state', error: false });
      commit('SET_IS_LOADING', false);
    },
    async getCountryNews({ commit }, payload) {
      commit('SET_IS_LOADING', true);
      await apiClient
        .getNewsByLocation(payload)
        .then((data) => commit('SET_COUNTRY_NEWS', filterArticles(data.articles)))
        .catch(({ response }) => commit('SET_ERROR', { response, errorType: 'country' }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      commit('SET_ERROR', { key: 'country', error: false });
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
