import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { transformSync } from './transformSync.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { compilerOptions: { nodeTransforms: [transformSync] } },
    }),
  ],
});
