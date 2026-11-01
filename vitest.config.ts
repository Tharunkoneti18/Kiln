import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts', 'src/lib/**/*.test.ts'],
    exclude: ['career-os-frontend/**', 'node_modules/**', 'src/components/**/*.test.tsx'],
  },
  resolve: {
    alias: [
      { find: /^@\/src\/(.*)/, replacement: path.resolve(__dirname, './src/$1') },
      { find: /^@\/components\/(.*)/, replacement: path.resolve(__dirname, './src/components/$1') },
      { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, './src/lib/$1') },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, './$1') },
    ],
  },
});
