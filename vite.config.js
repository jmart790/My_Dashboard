import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ogImageResult } from './server/ogImage.js';
import { searchNews, newsKey } from './server/news.js';
import { toConnect } from './server/http.js';

// The app's two server endpoints, served by the dev and preview servers here and by
// Netlify Functions in production (netlify/functions), from the same code in server/.
//   GET /api/news?q=...      news search (keeps the GNews key off the client)
//   GET /api/og-image?url=... a restaurant website's share photo
function apiPlugin(env) {
  const mount = (server) => {
    server.middlewares.use('/api/news', toConnect((p) => searchNews(p.get('q'), { key: newsKey(env) })));
    server.middlewares.use('/api/og-image', toConnect((p) => ogImageResult(p.get('url'))));
  };
  return { name: 'iherald-api', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig(({ mode }) => {
  // all of .env.local, including non-VITE_ names: these stay on the server
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [apiPlugin(env), vue({ template: { transformAssetUrls: { InlineSvg: ['src'], 'inline-svg': ['src'] } } })],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
      preprocessorOptions: {
        // variables only; global rules are imported once in main.js
        scss: { additionalData: `@use "@/assets/scss/vars" as *;\n` },
      },
    },
    test: { environment: 'jsdom', globals: true },
  };
});
