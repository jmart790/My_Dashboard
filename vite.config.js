import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls: { InlineSvg: ['src'], 'inline-svg': ['src'] } } })],
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
