import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  cacheDir: "../node_modules/.vite/json-eye-demo",
  build: { emptyOutDir: true },
  plugins: [react({
    jsxImportSource: "@emotion/react",
    babel: { plugins: ["@emotion/babel-plugin"] },
  })],
});
