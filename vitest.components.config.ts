import { defineConfig } from "vitest/config";
import path from "path";

// Runs the React component tests, which the default config excludes.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    globals: true,
    include: ["src/components/**/*.test.tsx"],
    exclude: ["node_modules/**"],
  },
  resolve: {
    alias: [
      { find: /^@\/src\/(.*)/, replacement: path.resolve(__dirname, "./src/$1") },
      { find: /^@\/components\/(.*)/, replacement: path.resolve(__dirname, "./src/components/$1") },
      { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, "./src/lib/$1") },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, "./$1") },
    ],
  },
});
