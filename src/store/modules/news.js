import apiClient from '@/apiClient';

const sections = () => ({ local: [], state: [], country: [] });
const flags = (value) => ({ local: value, state: value, country: value });

const getDefaultState = () => ({
  loadedFor: null, // 'edition id|place' the current news belongs to
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
    SET_LOADED_FOR(state, value) {
      state.loadedFor = value;
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
    async getNews({ commit, rootGetters }, { key, query }) {
      commit('SET_IS_LOADING', { key, value: true });
      commit('SET_ERROR', { key, value: false });
      const edition = rootGetters['edition/edition'];
      await apiClient
        .getNewsByLocation(query, { edition: edition && edition.id })
        .then((data) => commit('SET_NEWS', { key, value: filterArticles(data.articles) }))
        .catch(() => {
          commit('SET_ERROR', { key, value: true });
          commit('SET_LOADED_FOR', null); // let the next visit retry
        });
      commit('SET_IS_LOADING', { key, value: false });
    },
    /** All three sections for this place and edition; does nothing if they're already loaded. */
    loadEdition({ state, commit, dispatch, rootGetters }, { name, region, country }) {
      if (!name) return Promise.resolve();
      const key = `${rootGetters['edition/edition'].id}|${name}`;
      if (state.loadedFor === key) return Promise.resolve();
      commit('SET_LOADED_FOR', key);
      return Promise.all([
        dispatch('getNews', { key: 'local', query: name }),
        dispatch('getNews', { key: 'state', query: region }),
        dispatch('getNews', { key: 'country', query: country }),
      ]);
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
