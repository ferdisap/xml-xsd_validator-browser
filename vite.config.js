import { defineConfig } from "vite";
import path from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Example alias for 'src' directory
    },
  },
  worker: {
    format: 'es', // Ensures the worker is built as an ES module
    // plugins: [ /* worker-specific plugins */ ]
  },
});