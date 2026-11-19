import apiClient from '@/apiClient';

// The chosen location (zip search or device GPS) is saved so a refresh, or any
// other page, starts from it instead of the default.
export const STORAGE_KEY = 'myDashboard.location.v1';
const DEFAULT_ZIP = '33137'; // used only when there's no saved location and no GPS

const emptyLocation = () => ({
  country: '',
  name: '',
  region: '',
  lat: '',
  lon: '',
  timezone: null,
  zip: '', // shown in the search bar; '' when a device location has no postcode
});

// Storage can be blocked (private mode, site data off) or hold junk: never let it break the app.
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.location && saved.location.name) return saved;
  } catch {
    // unreadable: behave as a first visit
  }
  return null;
}

function save(location, source) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ location, source }));
  } catch {
    // storage full or blocked: the location still works for this visit
  }
}

const GEO_ERRORS = {
  1: 'Location is blocked. Allow it in your browser settings, or search a zip code.',
  2: "Couldn't find your location. Try a zip code.",
  3: 'Finding your location took too long. Try again or use a zip code.',
};

function currentPosition() {
  return new Promise((resolve, reject) => {
    const geo = typeof navigator !== 'undefined' && navigator.geolocation;
    if (!geo) {
      reject(new Error("This browser can't share your location. Search a zip code instead."));
      return;
    }
    geo.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      (error) => reject(new Error(GEO_ERRORS[error.code] || GEO_ERRORS[2])),
      // a fix from the last 10 minutes is fine for weather, news and nearby food
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

const getDefaultState = () => {
  const saved = loadSaved();
  return {
    location: saved ? saved.location : emptyLocation(),
    source: saved ? saved.source : null, // 'zip' | 'gps' | null
    zipcode: '',
    isLoading: false,
    locating: false,
    geoError: null,
    error: null,
  };
};

export default {
  namespaced: true,
  // function, not object: each store instance (and each test) gets fresh state
  state: getDefaultState,
  mutations: {
    SET_LOCATION(state, value) {
      state.location = value;
    },
    SET_SOURCE(state, value) {
      state.source = value;
    },
    SET_ZIPCODE(state, value) {
      state.zipcode = value;
    },
    SET_IS_LOADING(state, value) {
      state.isLoading = value;
    },
    SET_LOCATING(state, value) {
      state.locating = value;
    },
    SET_GEO_ERROR(state, value) {
      state.geoError = value;
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
    location: (state) => state.location,
    source: (state) => state.source,
    locating: (state) => state.locating,
    geoError: (state) => state.geoError,
    coordinates: ({ location }) => ({ lat: location.lat, lon: location.lon }),
    cityState: ({ location }) => [location.name, location.region].filter(Boolean).join(', '),
    zipcode: (state) => state.zipcode,
    currentZip: ({ location }) => location.zip || '',
  },
  actions: {
    /** App start: use the saved location, else the device's, else the default zip. */
    async init({ state, commit, dispatch }) {
      if (state.location.name) return; // restored from storage by the state initializer
      try {
        await dispatch('locateMe');
      } catch {
        commit('SET_GEO_ERROR', null); // not asked for, so not an error to show
        // Not saved: the default isn't the user's choice, so the next visit tries the
        // device location again (browsers don't re-prompt after a denial).
        await dispatch('getLocation', { zipcode: DEFAULT_ZIP, remember: false });
      }
    },
    /** @param payload a zip string, or { zipcode, remember } (remember defaults to true) */
    async getLocation({ commit }, payload) {
      const { zipcode, remember = true } =
        typeof payload === 'string' ? { zipcode: payload } : payload;
      commit('SET_IS_LOADING', true);
      commit('SET_ERROR', null);
      commit('SET_GEO_ERROR', null);
      await apiClient
        .getLocation(zipcode)
        .then(({ location }) => {
          commit('SET_LOCATION', location);
          commit('SET_SOURCE', remember ? 'zip' : null);
          if (remember) save(location, 'zip');
        })
        .catch((error) => commit('SET_ERROR', error));
      commit('SET_IS_LOADING', false);
    },
    /** Device location. Rejects (after setting geoError) so callers can fall back. */
    async locateMe({ commit }) {
      commit('SET_LOCATING', true);
      commit('SET_IS_LOADING', true);
      commit('SET_GEO_ERROR', null);
      try {
        const coords = await currentPosition();
        const { location } = await apiClient.reverseGeocode(coords).catch(() => {
          throw new Error("Couldn't look up that location. Try a zip code.");
        });
        commit('SET_LOCATION', location);
        commit('SET_SOURCE', 'gps');
        save(location, 'gps');
      } catch (error) {
        commit('SET_GEO_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOCATING', false);
        commit('SET_IS_LOADING', false);
      }
    },
    setZipcode({ commit }, value) {
      commit('SET_ZIPCODE', value);
    },
    resetState: {
      root: true,
      handler({ commit }) {
        commit('RESET_DATA');
      },
    },
  },
};
