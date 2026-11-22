import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite configuration for Isyarat-Live Chrome Extension (Manifest V3).
 *
 * Note: Chrome MV3 content scripts do not support top-level ES module imports
 * without dynamic loader shims, so `scripts/build.mjs` invokes Vite per target
 * (content as self-contained IIFE, service-worker as ES module, popup as HTML app).
 * This default config builds the content script bundle when running `vite build`.
 */
export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.js'),
      },
      output: {
        format: 'iife',
        entryFileNames: 'content.js',
        inlineDynamicImports: true,
      },
    },
  },
});
