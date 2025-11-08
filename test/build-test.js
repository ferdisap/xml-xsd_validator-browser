import { build } from "esbuild";
import path from "path";

const config = {
  entryPoints: ["test/test.ts"],
  outfile: "test/build/test.bundle.js",
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

// 🚫 Jangan bundle modul ini (biarkan import-nya tetap)
// config.external = ["libxml2-wasm", "module"];
config.external = ["module"];

// 📦 Plugin: handle ?worker imports
const workerPlugin = {
  name: "worker-loader",
  setup(buildInstance) {
    buildInstance.onResolve({ filter: /\?worker$/ }, args => {
      const realPath = args.path.replace(/\?worker$/, "");
      return {
        path: path.resolve(args.resolveDir, realPath),
        namespace: "worker",
      };
    });

    buildInstance.onLoad({ filter: /.*/, namespace: "worker" }, async args => {
      const workerSrcPath = args.path;
      const workerOutDir = path.resolve("test/build");
      const workerOutFile = path.join(workerOutDir, path.basename(workerSrcPath, ".ts") + ".js");

      // 🧩 Build worker as ESM module
      await build({
        entryPoints: [workerSrcPath],
        outfile: workerOutFile,
        bundle: true,
        platform: "browser",
        format: "esm",                // ✅ make it ES module
        target: "esnext",
        sourcemap: false,
        // external: ["libxml2-wasm", "module"], // ✅ same externals
        external: ["module"], // ✅ same externals
      });

      // 🔁 Replace ?worker import with Worker constructor
      return {
        contents: `
          export default function WorkerWrapper() {
            return new Worker(new URL("./${path.basename(workerOutFile)}", import.meta.url), { type: "module" });
          }
        `,
        loader: "js",
      };
    });
  },
};

// 🧱 Apply plugin
config.plugins = [workerPlugin];

// ✅ Ensure output is also ESM & browser-compatible
config.platform = "browser";
config.format = "esm";
config.target = "esnext";

await build(config);

console.log(`✅ Build selesai: ${config.outfile}`);
