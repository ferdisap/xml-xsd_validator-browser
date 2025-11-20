// =========================
// src/index.ts
// =========================

// Re-export semua yang ingin diekspos dari library
export { createMapInputProvider } from './provider/MapInputProvider.js';
export { findRequiredSchemas, detectSchemaLocation, findRequiredDtds, getSchemaText, isXmlLike, resolveUri, constructEntityNotationValidationOption } from './util/helper.js';

// Jika kamu ingin mengekspor juga fungsionalitas validate secara langsung
export {
  useWorker,
  baseUri,
  validateXml,
  getS1000dDocParseOption,
  getS1000dAllowedNotation,
  XmlDocumentParseOption,
  XmlEntityNotationOption
} from './validate.js';
export { validateWellForm } from "./validateFormWell.js"
export { validateXmlTowardXsd } from "./validateTowardXsd.js"
export { validateEntityNotation } from "./validateDtd.js"

// Jika ingin custom dengan libXml2
export { ensureLibxml2Loaded, useLibXml2 } from "./libxml/libxmlloader.js";

export { ParseOption } from "libxml2-wasm";

export * from "./types/types.js";

// untuk plugins vite
export * from "./plugins/viteWorkerPlugin.js";
export * from "./plugins/esBuildIgnoreModuleImportPlugin.js";
