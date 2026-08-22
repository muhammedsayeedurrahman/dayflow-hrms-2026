import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    // Disable sourcemaps in production for smaller output
    sourcemap: false,
    // Increase chunk size warning threshold slightly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting for vendor libraries.
         * Separating heavy libraries into their own chunks:
         *  - vendor-react: React core + DOM + router
         *  - vendor-charts: Recharts (large library)
         *  - vendor-ui: lucide-react icons
         *  - vendor-state: Zustand + form libs
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router')
            ) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (
              id.includes('zustand') ||
              id.includes('react-hook-form') ||
              id.includes('zod') ||
              id.includes('axios')
            ) {
              return 'vendor-state';
            }
            // All other node_modules go into a generic vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
});
