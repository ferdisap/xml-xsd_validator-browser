// =========================
// src/index.ts
// =========================

// Re-export semua yang ingin diekspos dari library
export { createMapInputProvider } from './provider/MapInputProvider';
export { findRequiredSchemas, extractSchemaLocation, getXmlText, isXmlLike } from './util/helper';

// Jika kamu ingin mengekspor juga fungsionalitas validate secara langsung
export { validateXml, useWorker, baseUri } from './validate';
export { validateWellForm } from "./validateFormWell"
export { validateXmlTowardXsd } from "./validateTowardXsd"

// Jika ingin custom dengan libXml2
export { ensureLibxml2Loaded, useLibXml2 } from "./libxml/libxmlloader";

export * from "./types/types";

// untuk plugins vite
export * from "./plugins/viteWorkerPlugin";
export * from "./plugins/esBuildIgnoreModuleImportPlugin";
