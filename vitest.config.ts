import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@main': path.resolve(process.cwd(), 'src/main'),
      '@renderer': path.resolve(process.cwd(), 'src/renderer'),
      '@shared': path.resolve(process.cwd(), 'src/shared')
    }
  },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage'
    }
  }
});
