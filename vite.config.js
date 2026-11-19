import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ogImageHandler } from './server/ogImage.js';

// GET /api/og-image?url=... on the dev and preview servers (restaurant website photos).
// A static build has no server: the client falls back to dish photos when it 404s.
const ogImageApi = {
  name: 'og-image-api',
  configureServer(server) {
    server.middlewares.use('/api/og-image', ogImageHandler);
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/og-image', ogImageHandler);
  },
};

export default defineConfig({
  plugins: [ogImageApi, vue({ template: { transformAssetUrls: { InlineSvg: ['src'], 'inline-svg': ['src'] } } })],
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
});
