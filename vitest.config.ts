import { resolve } from 'path';
import type { UserConfig } from 'vitest/config';

const config = {
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
} satisfies UserConfig;

export default config;
