// jika pakai vite.test.config.js
import path from "path";
import { ignoreModuleImportPlugin } from "./esBuildIgnoreModuleImportPlugin.js";

/**
 * Custom plugin untuk menangani "?worker" import di Vite atau Esbuild.
 * Menjamin worker path tetap relatif (./file.js), bukan absolute (/file.js).
 */
export function workerPlugin() {
  return {
    name: "worker-loader",
    async transform(_, id) {
      if (!id.endsWith("?worker")) return;

      const realPath = id.replace(/\?worker$/, "");
      const workerOutDir = path.resolve("test/build");
      const workerFileName = path.basename(realPath).replace(/\.(ts|js)$/, ".js");
      const workerOutFile = path.join(workerOutDir, workerFileName);      
      
      const { build } = await import("esbuild");
      // 🧩 Bundle worker as standalone ESM
      await build({
        entryPoints: [realPath],
        outfile: workerOutFile,
        bundle: true,
        platform: "browser",
        format: "esm",
        target: "esnext",
        sourcemap: false,
        minify: false,
        plugins: [ignoreModuleImportPlugin()],
      });

      // 🧠 WorkerWrapper tetap menggunakan path relatif ("./..."), bukan "/..."
      return {
        code: `
          export default function WorkerWrapper() {
            return new Worker(new URL("./${workerFileName}", import.meta.url), { type: "module" });
          }
        `,
        map: null,
      };
    },
  };
}

// jika pakai built-test.js
// import path from "path";
// import { build } from "esbuild";
// import { ignoreModuleImportPlugin } from "./ignoreModuleImportPlugin.js";

// /**
//  * Custom plugin untuk menangani "?worker" import
//  * - Output tanpa hash
//  * - Disimpan langsung di test/build/
//  * - Mencegah Vite membuat versi assets/worker-hash.js
//  */
// export function workerPlugin() {
//   return {
//     name: "worker-loader",
//     setup(buildInstance) {
//       buildInstance.onResolve({ filter: /\?worker$/ }, args => {
//         const realPath = args.path.replace(/\?worker$/, "");
//         return {
//           path: path.resolve(args.resolveDir, realPath),
//           namespace: "worker",
//         };
//       });

//       buildInstance.onLoad({ filter: /.*/, namespace: "worker" }, async args => {
//         const workerSrcPath = args.path;
//         const workerOutDir = path.resolve("test/build");
//         const workerOutFile = path.join(workerOutDir, path.basename(workerSrcPath, ".ts") + ".js");

//         // 🧩 Build worker as ESM module
//         await build({
//           entryPoints: [workerSrcPath],
//           outfile: workerOutFile,
//           bundle: true,
//           platform: "browser",
//           format: "esm",                // ✅ make it ES module
//           target: "esnext",
//           sourcemap: false,
//           // external: ["libxml2-wasm", "module"], // ✅ same externals
//           // external: ["../../libxml2-wasm/lib/index.mjs"], // ✅ same externals
//           // external: ["../../libxml2-wasm/lib/index.mjs"], // ✅ same externals
//           // external: ["module"], // ✅ same externals
//           // treeShaking: false // karena side effect libxml2-wasm
//           plugins: [ignoreModuleImportPlugin()]
//         });

//         // 🔁 Replace ?worker import with Worker constructor
//         return {
//           contents: `
//             export default function WorkerWrapper() {
//               return new Worker(new URL("./${path.basename(workerOutFile)}", import.meta.url), { type: "module" });
//             }
//           `,
//           loader: "js",
//         };
//       });
//     },
//   };
// }
