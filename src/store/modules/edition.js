import { editionFor, paperAge } from '@/edition';

// The current time, ticked by AppLayout, so everything that depends on the
// edition (masthead, news cache, arrival animation, paper tint) updates together.
export default {
  namespaced: true,
  state: () => ({ now: Date.now() }),
  mutations: {
    TICK(state) {
      state.now = Date.now();
    },
  },
  getters: {
    edition: (state, _g, rootState) => editionFor(new Date(state.now), rootState.location.location.timezone),
    age: (state, _g, rootState) => paperAge(new Date(state.now), rootState.location.location.timezone),
  },
};
