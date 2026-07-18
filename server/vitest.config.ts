import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      MONGODB_URI: 'mongodb://localhost:27017/mock', // Will be overridden by mongodb-memory-server
      JWT_SECRET: 'mock_jwt_secret_must_be_at_least_32_characters_long',
      JWT_REFRESH_SECRET: 'mock_refresh_secret_must_be_at_least_32_characters_long',
      CLIENT_URL: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
    testTimeout: 20000,
    hookTimeout: 600000, // Allow up to 10 minutes for mongodb-memory-server to download its binary
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/**', 'dist/**', 'src/tests/**'],
    },
    fileParallelism: false,
  },
});
