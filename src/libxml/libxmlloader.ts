import { ValidationInfo } from "../types";

import { init_lib } from "./libxml2-wasm-wrapper";

type LibLoader = {
  libxml: any | null;
  initError: any | null;
  // loadingPromise?: Promise<void>;
};

export const loader:LibLoader = {
  libxml: null as any,
  // loadingPromise: null as Promise<void> | null,
  initError: null as any,
};

export function libxml() {
  return loader.libxml
}

export async function ensureLibxml2Loaded() {
  return new Promise(async (resolve, reject) => {
    if (loader.libxml || loader.initError) return resolve([]);
    try {
      // globalThis.process = undefined;
      const mod = await import("../../libxml2-wasm/lib/index.mjs");
      loader.libxml = mod; 
      // loader.libxml = await mod(); 
      // console.log(loader.libxml)
      return resolve([]);
    }
    catch (e) {
      loader.initError = e;
      loader.initError.data = [{
        name: "LibInitError",
        type: "none",
        details: {
          message: loader.initError?.message || String(loader.initError),
          file: "",
          line: 1,
          col: 1
        }
      }];
      return reject(loader.initError);
    }
  });
}
// export async function ensureLibxml2Loaded() {
//   if (loader.libxml || loader.initError) return;
//   if (loader.loadingPromise) return loader.loadingPromise;

//   loader.loadingPromise = (async () => {
//     try {
//       const instance = await init_lib(); // <— ini penting
//       loader.libxml = instance;          // <— simpan hasil inisialisasi
//       // console.log("[libxml2] loaded:", Object.keys(instance));
//     } catch (e) {
//       console.error("[libxml2] init error:", e);
//       loader.initError = e;
//       loader.initError.data = [
//         {
//           name: "LibInitError",
//           type: "none",
//           details: {
//             message: loader.initError?.message || String(loader.initError),
//             file: "",
//             line: 1,
//             col: 1,
//           },
//         },
//       ];
//       throw e;
//     }
//   })();

//   await loader.loadingPromise;
// }



/**
 * Ensure libxml2-wasm is initialized before use.
 * Adds timeout protection in worker context to avoid infinite pending state.
 */
// export async function ensureLibxml2Loaded(): Promise<ValidationInfo[]> {
//   if (loader.libxml || loader.initError) return [];

//   if (loader.loadingPromise) {
//     await loader.loadingPromise;
//     return [];
//   }

//   loader.loadingPromise = (async () => {
//     try {
//       console.log("[worker] ensureLibxml2Loaded: init_lib() start");

//       // Tambahkan timeout (misalnya 5 detik)
//       const timeout = new Promise<never>((_, reject) =>
//         setTimeout(() => reject(new Error("libxml2 init timeout")), 5000)
//       );

//       await Promise.race([init_lib(), timeout]);

//       console.log("[worker] ensureLibxml2Loaded: init_lib() done");

//       loader.libxml = lib_exports;

//       console.log(loader.libxml ? 'fufu' : 'fafa', loader.libxml)
//     } catch (e) {
//       loader.initError = e;
//       loader.initError.data = [
//         {
//           name: "LibInitError",
//           type: "none",
//           details: {
//             message: loader.initError?.message || String(loader.initError),
//             file: "",
//             line: 1,
//             col: 1,
//           },
//         },
//       ];
//       throw e;
//     }
//   })();

//   try {
//     await loader.loadingPromise;
//     return [];
//   } finally {
//     delete loader.loadingPromise;
//   }
// }



export function useLibXml2() {
  return {
    libxml, ensureLibxmlLoaded: ensureLibxml2Loaded
  }
}

// import { ValidationInfo, WorkerBags } from "./types";

// type LibLoader = {
//   libxml: any | null,
//   initError: any | null,
// }

// const loader:LibLoader = {
//   libxml: null,
//   initError: null,
// }

// function libxml(){
//   return loader.libxml;
// }

// /**
//  * To ensure that libxml2 has loaded, to let the worker can process.
//  * @returns Promise array contains validation info or an error instance of XmlError or XmlValidateError owned by libxml2-wasm
//  */
// export async function ensureLibxml2Loaded(): Promise<ValidationInfo[]> {
//   return new Promise(async (resolve, reject) => {
//     if ((loader).libxml || loader.initError) return resolve([]);
//     try {
//       // dynamic import to avoid bundler import shape issues
//       const mod = await import("libxml2-wasm");
//       (loader).libxml = mod;
//       return resolve([]);
//       // Note: libxml2.mjs already runs moduleLoader() at top-level (it awaits moduleLoader)
//       // so simply importing gives us ready exports.
//     } catch (e) {
//       loader.initError = e;
//       loader.initError.data = [{
//         name: "LibInitError",
//         type: "none",
//         details: {
//           message: loader.initError?.message || String(loader.initError),
//           file: "",
//           line: 1,
//           col: 1,
//         }
//       }]
//       return reject(loader.initError);
//     }
//   })
// }

// export function useLibXml2(){
//   return {
//     libxml, ensureLibxmlLoaded: ensureLibxml2Loaded
//   }
// }