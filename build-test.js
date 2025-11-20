import { build } from "esbuild";
import path from "path";
import { ignoreModuleImportPlugin } from "./src/plugins/esBuildIgnoreModuleImportPlugin.js";
import { workerPlugin } from "./src/plugins/viteWorkerPlugin.js";

const config = {
  entryPoints: ["test/test.ts"],
  outfile: "test/build/test.js",
  bundle: true,
  platform: "browser",
  target: "esnext",
  sourcemap: true,
  format: "esm",
  tsconfig: "tsconfig.json",
  alias: {
    "@": "./src"
  },
  define: {
    "process.env.NODE_ENV": "\"development\""
  }
}

// 🧠 Helper: resolve alias absolute path
if (config.alias) {
  config.alias = Object.fromEntries(
    Object.entries(config.alias).map(([key, value]) => [key, path.resolve(value)])
  );
}

// 🧱 Apply plugin
config.plugins = [workerPlugin(), ignoreModuleImportPlugin()];

// ✅ Ensure output is also ESM & browser-compatible
config.platform = "browser";
config.format = "esm";
config.target = "esnext";

await build(config);

console.log(`✅ Build selesai: ${config.outfile}`);
