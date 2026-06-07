import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Builds the service worker (public/sw.ts → dist/sw.js) as a separate bundle
 * after the main app build completes, avoiding Vite's multi-page mode issues
 * that occur when mixing .ts and .html entries in rollupOptions.input.
 */
function swBuildPlugin(): Plugin {
  return {
    name: 'sw-build',
    apply: 'build',
    async closeBundle() {
      const { build } = await import('vite');
      await build({
        configFile: false,
        root: __dirname,
        logLevel: 'warn',
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: path.resolve(__dirname, 'public/sw.ts'),
            formats: ['es'],
            fileName: () => 'sw.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), swBuildPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});