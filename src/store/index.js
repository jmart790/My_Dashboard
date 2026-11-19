import { createStore } from 'vuex';

// module name = file name; modules must export default
const files = import.meta.glob('./modules/*.js', { eager: true, import: 'default' });
const modules = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.match(/([^/]+)\.js$/)[1], mod])
);

export default createStore({ modules, strict: import.meta.env.DEV });
