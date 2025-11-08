import { ValidationInfo, WorkerBags } from "./types";

type LibLoader = {
  libxml: any | null,
  initError: any | null,
}

const loader:LibLoader = {
  libxml: null,
  initError: null,
}

function libxml(){
  return loader.libxml;
}

/**
 * To ensure that libxml2 has loaded, to let the worker can process.
 * @returns Promise array contains validation info or an error instance of XmlError or XmlValidateError owned by libxml2-wasm 
 */
export async function ensureLibxml2Loaded(): Promise<ValidationInfo[]> {
  return new Promise(async (resolve, reject) => {
    if ((loader).libxml || loader.initError) return resolve([]);
    try {
      // dynamic import to avoid bundler import shape issues
      const mod = await import("libxml2-wasm");
      (loader).libxml = mod;
      return resolve([]);
      // Note: libxml2.mjs already runs moduleLoader() at top-level (it awaits moduleLoader)
      // so simply importing gives us ready exports.
    } catch (e) {
      loader.initError = e;
      loader.initError.data = [{
        name: "LibInitError",
        type: "none",
        details: {
          message: loader.initError?.message || String(loader.initError),
          file: "",
          line: 1,
          col: 1,
        }
      }]
      return reject(loader.initError);
    }
  })
}

export function useLibXml2(){
  return {
    libxml, ensureLibxmlLoaded: ensureLibxml2Loaded
  }
}