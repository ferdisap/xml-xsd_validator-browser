import { ValidationInfo } from "../types/types.js";
import { init_lib } from "./libxml2-wasm-wrapper.js";
import * as libxml2 from "libxml2-wasm";

type LibLoader = {
  libxml: any | null;
  initError: any | null;
};

/**
 * @deprecated
 * @returns
 */
export const loader: LibLoader = {
  libxml: null as any,
  initError: null as any,
};

/**
 * @deprecated
 * @returns
 */
export function libxml() {
  return loader.libxml
}

/**
 * @deprecated
 * @returns
 */
export async function ensureLibxml2Loaded() {
  return new Promise(async (resolve, reject) => {
    if (loader.libxml || loader.initError) return resolve([]);
    try {
      // const mod = await import("https://ferdisap.github.io/xml-xsd_validator-browser/libxml2-wasm/lib/index.mjs");
      loader.libxml = libxml2;
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

/**
 * @deprecated
 * @returns
 */
export function useLibXml2() {
  return {
    libxml, ensureLibxmlLoaded: ensureLibxml2Loaded
  }
}
