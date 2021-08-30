import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// extracts js files inside modules
const requireModule = require.context("./modules", false, /\.js$/);
const modules = {}

requireModule.keys().forEach(fileName => {
	const moduleName = fileName.replace(/(\.\/|\.js)/g, "")
	// modules must be export default
	modules[moduleName] = requireModule(fileName).default;
});

export default new Vuex.Store({
  nameSpaced: true,
  modules,
  strict: process.env.NODE_ENV !== "production"
});
