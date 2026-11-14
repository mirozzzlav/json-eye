import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({
    jsxImportSource: "@emotion/react",
    babel: { plugins: ["@emotion/babel-plugin"] },
  })],
  build: {
    lib: { entry: "src/index.js", formats: ["es"], fileName: "json-eye" },
    rollupOptions: {
      external: (id) => /^(react|react-dom|@emotion\/react)(\/|$)/.test(id),
    },
  },
});
