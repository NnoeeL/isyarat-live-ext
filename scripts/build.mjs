import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

async function buildExtension() {
  // 1. Clean dist/
  fs.rmSync(DIST, { recursive: true, force: true });

  // 2. Build content script as a self-contained IIFE + copy public/ assets
  console.log('\n[build] 1/3 Bundling content script (IIFE) & copying public/...');
  await build({
    configFile: false,
    root: ROOT,
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: 'esbuild',
      rollupOptions: {
        input: path.join(ROOT, 'src/content/index.js'),
        output: {
          format: 'iife',
          entryFileNames: 'content.js',
          inlineDynamicImports: true,
        },
      },
    },
  });

  // 3. Build MV3 background service worker (ES module)
  console.log('\n[build] 2/3 Bundling background service worker...');
  await build({
    configFile: false,
    root: ROOT,
    publicDir: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: 'esbuild',
      rollupOptions: {
        input: path.join(ROOT, 'src/background/service-worker.js'),
        output: {
          format: 'es',
          entryFileNames: 'service-worker.js',
          inlineDynamicImports: true,
        },
      },
    },
  });

  // 4. Build popup script & copy popup.html to dist/popup.html
  console.log('\n[build] 3/4 Bundling popup UI...');
  await build({
    configFile: false,
    root: ROOT,
    publicDir: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: 'esbuild',
      rollupOptions: {
        input: path.join(ROOT, 'src/popup/popup.js'),
        output: {
          format: 'es',
          entryFileNames: 'popup.js',
          inlineDynamicImports: true,
        },
      },
    },
  });

  fs.copyFileSync(
    path.join(ROOT, 'src/popup/popup.html'),
    path.join(DIST, 'popup.html')
  );

  // 5. Build MV3 Offscreen AI Document (runs MediaPipe WASM outside host-page CSP)
  console.log('\n[build] 4/4 Bundling offscreen MediaPipe AI engine...');
  await build({
    configFile: false,
    root: ROOT,
    publicDir: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: 'esbuild',
      rollupOptions: {
        input: path.join(ROOT, 'src/offscreen/offscreen.js'),
        output: {
          format: 'es',
          entryFileNames: 'offscreen.js',
          inlineDynamicImports: true,
        },
      },
    },
  });

  fs.copyFileSync(
    path.join(ROOT, 'src/offscreen/offscreen.html'),
    path.join(DIST, 'offscreen.html')
  );

  console.log('\n[build] Done! Load unpacked extension from: dist/');
}

buildExtension().catch((err) => {
  console.error('[build] Failed:', err);
  process.exit(1);
});
