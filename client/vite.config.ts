import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// @ts-ignore
export default defineConfig({
  plugins: [
    // React Compiler (formerly React Forget) automatically optimizes rendering
    // and memoization — eliminates the need for manual useMemo/useCallback.
    react({
      // @ts-expect-error - Vite plugin types mismatch with Babel in newer versions
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    // TailwindCSS v4 Vite plugin — no tailwind.config.ts needed
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Proxy /api requests to Express in development — avoids CORS in dev
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Warn on chunks > 500kB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split vendor code for better long-term caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
        } as any,
      },
    },
  },

  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/**', 'dist/**', 'test/**'],
    },
  },
});
