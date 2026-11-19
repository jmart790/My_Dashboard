import apiClient from '@/apiClient';

const sections = () => ({ local: [], state: [], country: [] });
const flags = (value) => ({ local: value, state: value, country: value });

const getDefaultState = () => ({
  news: sections(),
  error: flags(false),
  isLoading: flags(false),
});

function filterArticles(articles) {
  const seen = new Set();
  return articles.filter((article) => {
    if (!(article.media && article.title && article.summary)) return false;
    const duplicate = seen.has(article.title);
    seen.add(article.title);
    return !duplicate;
  });
}

export default {
  namespaced: true,
  state: getDefaultState(),
  mutations: {
    SET_NEWS(state, { key, value }) {
      state.news[key] = value;
    },
    SET_IS_LOADING(state, { key, value }) {
      state.isLoading[key] = value;
    },
    SET_ERROR(state, { key, value }) {
      state.error[key] = value;
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
    /** key is local | state | country, query is the place name to search */
    async getNews({ commit }, { key, query }) {
      commit('SET_IS_LOADING', { key, value: true });
      commit('SET_ERROR', { key, value: false });
      await apiClient
        .getNewsByLocation(query)
        .then((data) => commit('SET_NEWS', { key, value: filterArticles(data.articles) }))
        .catch(() => commit('SET_ERROR', { key, value: true }));
      commit('SET_IS_LOADING', { key, value: false });
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
