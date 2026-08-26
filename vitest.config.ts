import { defineConfig } from 'vitest/config';

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret-for-testing';
process.env.NODE_ENV = 'test';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
  },
});