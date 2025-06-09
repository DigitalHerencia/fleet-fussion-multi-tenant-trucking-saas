import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts?(x)'],
    exclude: ['tests/**/*.spec.ts?(x)']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
