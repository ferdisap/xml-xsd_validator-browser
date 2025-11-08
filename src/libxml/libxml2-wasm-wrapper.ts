/**
 * @deprecated
 */
// Pastikan path sesuai hasil bundling (bisa absolute dari node_modules)
// import * as libExports from "../../node_modules/libxml2-wasm/lib/index.mjs";

// /**
//  * Initialize libxml2-wasm module.
//  * Handles both old and new export formats (with or without default export).
//  */
// export async function init_lib(): Promise<typeof libExports> {
//   // 🔹 Access dynamically to avoid esbuild static warning
//   const maybeDefault = Reflect.get(libExports as any, "default");
//   if (typeof maybeDefault === "function") {
//     try {
//       await maybeDefault();
//     } catch (err) {
//       console.error("[libxml2-wasm-wrapper] init_lib() failed:", err);
//       throw err;
//     }
//   }
//   return libExports;
// }

// /** Export the wasm bindings */
// export const lib_exports = libExports;

// import * as raw from "../../node_modules/libxml2-wasm/lib/libxml2raw.mjs";

// export type LibXml2 = any;
// const modAny = raw as unknown as Record<string, any>;

// export async function init_lib(timeoutMs = 10000): Promise<LibXml2> {
//   if (typeof (globalThis as any).Module === "undefined") {
//     (globalThis as any).Module = (globalThis as any).Module || {};
//   }

//   const maybeDefault = Reflect.get(modAny, "default");

//   if (typeof maybeDefault === "function") {
//     try {
//       const result = await Promise.race([
//         maybeDefault(), // ⬅️ jalankan inisialisasi Emscripten
//         new Promise<never>((_, reject) =>
//           setTimeout(() => reject(new Error("libxml2 init timeout")), timeoutMs)
//         ),
//       ]);

//       // 💡 result adalah instance yang punya semua class seperti XmlError, XmlDocument, dll
//       return result;
//     } catch (err) {
//       console.error("[libxml2-wrapper] init_lib failed:", err);
//       throw err;
//     }
//   }

//   // fallback kalau tidak ada default (jarang terjadi)
//   return modAny;
// }

// export const lib_exports = modAny;
// export default init_lib;

// import * as raw from "../../node_modules/libxml2-wasm/lib/libxml2raw.mjs";
import * as raw from "../../node_modules/libxml2-wasm/lib/index.mjs";

export type LibXml2 = any;
const modAny = raw as unknown as Record<string, any>;

export async function init_lib(timeoutMs = 10000): Promise<LibXml2> {
  const maybeDefault = Reflect.get(modAny, "default");

  if (typeof maybeDefault === "function") {
    const result = await Promise.race([
      maybeDefault(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("libxml2 init timeout")), timeoutMs)
      ),
    ]);
    return result; // ⬅️ gunakan hasil inisialisasi
  }

  // fallback: kalau tidak ada default (jarang terjadi)
  return modAny;
}

export const lib_exports = modAny;
export default init_lib;
