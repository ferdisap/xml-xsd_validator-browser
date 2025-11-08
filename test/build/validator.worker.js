// src/libxml/libxmlloader.ts
var loader = {
  libxml: null,
  // loadingPromise: null as Promise<void> | null,
  initError: null
};
function libxml() {
  return loader.libxml;
}
async function ensureLibxml2Loaded() {
  return new Promise(async (resolve, reject) => {
    if (loader.libxml || loader.initError) return resolve([]);
    try {
      const mod = await import("../../libxml2-wasm/lib/index.mjs");
      loader.libxml = mod;
      return resolve([]);
    } catch (e) {
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
function useLibXml2() {
  return {
    libxml,
    ensureLibxmlLoaded: ensureLibxml2Loaded
  };
}

// src/validateFormWell.ts
async function validateWellForm(xmlText) {
  const errorBags = [];
  const { libxml: libxml2, ensureLibxmlLoaded } = useLibXml2();
  return ensureLibxmlLoaded().then(() => {
    libxml2().XmlDocument.fromString(xmlText);
    return Promise.resolve([]);
  }).catch((err) => {
    if (err.details) {
      const detail = err.details || {};
      errorBags.push({
        name: "XMLParseError",
        type: "form",
        detail: {
          message: detail.message || err.message || "Invalid XML format",
          file: detail.file || "",
          line: detail.line?.toString() || 1,
          col: detail.col?.toString() || 1
        }
      });
    } else {
      if (err.data) errorBags.push(...err.data);
      errorBags.push({
        name: "UnknownError",
        type: "form",
        detail: {
          message: err?.message || String(err),
          file: "",
          line: 1,
          col: 1
        }
      });
    }
    return Promise.reject(errorBags);
  });
}

// src/provider/MapInputProvider.ts
async function createMapInputProvider(map) {
  const { libxml: libxml2, ensureLibxmlLoaded } = useLibXml2();
  await ensureLibxmlLoaded();
  const xmlRegisterInputProvider = libxml2().xmlRegisterInputProvider;
  const xmlCleanupInputProvider = libxml2().xmlCleanupInputProvider;
  const store = /* @__PURE__ */ new Map();
  const handles = /* @__PURE__ */ new Map();
  let nextFd = 1;
  const toUint8 = (s) => new TextEncoder().encode(s);
  const normalizeKey = (k) => {
    if (!k) return k;
    try {
      const u = new URL(k);
      return u.href;
    } catch {
      return k;
    }
  };
  const basename = (path) => {
    try {
      const u = new URL(path);
      return u.pathname.split("/").pop() || path;
    } catch {
      const parts = path.split("/");
      return parts[parts.length - 1] || path;
    }
  };
  if (map instanceof Map) {
    for (const [k, v] of map.entries()) store.set(normalizeKey(k), toUint8(v));
  } else {
    for (const { filename, contents } of map)
      store.set(normalizeKey(filename), toUint8(contents));
  }
  for (const key of Array.from(store.keys())) {
    const base = basename(key);
    if (!store.has(base)) {
      store.set(base, store.get(key));
    }
  }
  const match = (filename) => {
    if (!filename) return false;
    const n = normalizeKey(filename);
    if (store.has(n)) return true;
    const base = basename(n);
    if (store.has(base)) return true;
    for (const k of store.keys()) {
      if (n.endsWith(k) || k.endsWith(n)) return true;
    }
    return false;
  };
  const open = (filename) => {
    const n = normalizeKey(filename);
    let data = store.get(n);
    if (!data) {
      const base = basename(n);
      data = store.get(base);
    }
    if (!data) {
      for (const [k, v] of store.entries()) {
        if (n.endsWith(k) || k.endsWith(n)) {
          data = v;
          break;
        }
      }
    }
    if (!data) return void 0;
    const fd = nextFd++;
    handles.set(fd, { pos: 0, data });
    return fd;
  };
  const read = (fd, buf) => {
    const h = handles.get(fd);
    if (!h) return -1;
    const remaining = h.data.length - h.pos;
    if (remaining <= 0) return 0;
    const toCopy = Math.min(buf.byteLength, remaining);
    buf.set(h.data.subarray(h.pos, h.pos + toCopy), 0);
    h.pos += toCopy;
    return toCopy;
  };
  const close = (fd) => handles.delete(fd);
  const register = () => {
    return xmlRegisterInputProvider({
      match,
      open,
      read,
      close
    });
  };
  const cleanup = () => {
    xmlCleanupInputProvider();
  };
  return {
    match,
    open,
    read,
    close,
    register,
    cleanup
  };
}

// src/util/helper.ts
async function findRequiredSchemas(mainSchemaUrl, visited = /* @__PURE__ */ new Set()) {
  if (visited.has(mainSchemaUrl)) {
    return Promise.resolve([]);
  }
  visited.add(mainSchemaUrl);
  return fetch(mainSchemaUrl).then((res) => {
    if (!res.ok) throw new Error(`Gagal fetch schema: ${mainSchemaUrl}`);
    return res.text();
  }).then(async (text) => {
    const regex = /<[a-zA-Z]{2}:(?:import|include|redefine)[^>]*schemaLocation="([^"]+)"/g;
    const matches = Array.from(text.matchAll(regex));
    const base = new URL(mainSchemaUrl);
    const nestedUrls = [];
    for (const match of matches) {
      try {
        const resolved = new URL(match[1], base).href;
        if (!visited.has(resolved)) nestedUrls.push(resolved);
      } catch (e) {
        console.warn("URL tidak valid:", match[1]);
      }
    }
    return Promise.all(
      nestedUrls.map((url) => findRequiredSchemas(url, visited))
    ).then((nestedSchemasArrays) => {
      const nestedSchemas = nestedSchemasArrays.flat();
      return Promise.resolve([{ filename: mainSchemaUrl, contents: text }, ...nestedSchemas]);
    });
  }).catch((err) => {
    console.error("findRequiredSchemas error:", err);
    return Promise.reject([]);
  });
}
function extractSchemaLocation(xmlText) {
  const noNsMatch = xmlText.match(
    /\b[a-zA-Z0-9]+:noNamespaceSchemaLocation\s*=\s*["']([^"']+)["']/i
  );
  if (noNsMatch) return noNsMatch[1];
  const schemaLocMatch = xmlText.match(
    /\bxsi:schemaLocation\s*=\s*["']([^"']+)["']/i
  );
  if (schemaLocMatch) {
    const parts = schemaLocMatch[1].trim().split(/\s+/);
    const urls = parts.filter((p) => /^https?:\/\/|\.xsd$/i.test(p));
    return urls[0] || null;
  }
  return null;
}
function isXmlLike(file) {
  if (typeof file !== "string") {
    return false;
  }
  return file.includes("<") && file.includes(">") && (file.includes("<?xml") || file.includes("</"));
}
async function getXmlText(file) {
  if (isXmlLike(file)) {
    return Promise.resolve(file);
  } else {
    const fileurl = new URL(file, window.location.href).href;
    return fetch(fileurl).then((r) => r.text());
  }
}

// src/validateTowardXsd.ts
async function validateXmlTowardXsd(file, mainSchemaUrl = null, stopOnFailure = true) {
  const { libxml: libxml2, ensureLibxmlLoaded } = useLibXml2();
  let provider = null;
  const bags = [];
  await ensureLibxmlLoaded();
  let xmlText;
  try {
    xmlText = await getXmlText(file);
  } catch {
    console.warn("Warning: Failed to fetch xml content");
    bags.push({
      name: "FetchError",
      type: "xsd",
      detail: {
        message: "Failed to fetch xml content",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }
  mainSchemaUrl = mainSchemaUrl ?? extractSchemaLocation(xmlText);
  if (!mainSchemaUrl) {
    console.warn("Warning: Failed to fetch xml content");
    bags.push({
      name: "FetchError",
      type: "xsd",
      detail: {
        message: "Failed to get schema location",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }
  let schemas = null;
  try {
    schemas = await findRequiredSchemas(mainSchemaUrl);
  } catch (error) {
    console.warn("Warning: Failed to find required schemas");
    bags.push({
      name: "FetchError",
      type: "xsd",
      detail: {
        message: "Failed to find required schemas",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }
  try {
    provider = await createMapInputProvider(schemas);
    provider.register();
  } catch (error) {
    console.warn("Warning: xmlRegisterInputProvider returned false");
    bags.push({
      name: "RegisteringProviderError",
      type: "xsd",
      detail: {
        message: "Failed to create/register provider",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }
  const mainXsdText = schemas[0].contents;
  let xmlDoc;
  let xsdDoc;
  try {
    xmlDoc = libxml2().XmlDocument.fromString(xmlText);
    xsdDoc = libxml2().XmlDocument.fromString(mainXsdText);
  } catch (error) {
    console.warn("Warning: XML and XSD Document fail to parsed");
    bags.push({
      name: "XMLParseError",
      type: "xsd",
      detail: {
        message: "Failed to create instance of Xml and Xsd document",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }
  let validator;
  try {
    validator = libxml2().XsdValidator.fromDoc(xsdDoc);
  } catch (error) {
    console.warn("Warning: Failed to create Xsd validator");
    bags.push({
      name: "XSDValidatorParseError",
      type: "xsd",
      detail: {
        message: "Failed to create Xsd validator",
        col: 1,
        line: 1,
        file: ""
      }
    });
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }
  try {
    validator.validate(xmlDoc);
  } catch (error) {
    for (const d of error.details) {
      bags.push({
        name: "XMLValidateError",
        type: "xsd",
        detail: {
          message: d.message || "XSD Validation failed",
          file: d.file || "",
          line: d.line || 1,
          col: d.col || 1
        }
      });
    }
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }
  provider?.cleanup();
  return Promise.reject(bags);
}

// src/worker/validator.worker.ts
async function validating(xmlText, mainSchemaUrl = null, stopOnFailure = true) {
  return Promise.all([
    validateWellForm(xmlText),
    validateXmlTowardXsd(xmlText, mainSchemaUrl, stopOnFailure)
  ]).then(() => Promise.resolve([])).catch((bags) => Promise.reject(bags));
}
async function run(xmlText, mainSchemaUrl = null, stopOnFailure = true, duration = 3e3) {
  const timer = setTimeout(() => {
    Promise.reject([
      {
        name: "ParseTimeout",
        type: "form",
        details: {
          message: "Parsing timeout or worker unresponsive",
          file: "",
          line: 1,
          col: 1
        }
      }
    ]);
  }, duration);
  return validating(xmlText, mainSchemaUrl, stopOnFailure).then((data) => {
    clearTimeout(timer);
    return Promise.resolve(data);
  }).catch((bags) => {
    clearTimeout(timer);
    return Promise.reject(bags);
  });
}
self.onmessage = (e) => {
  const { id, payload } = e.data;
  const { xmlText, mainSchemaUrl, stopOnFailure, duration } = payload;
  const errorBags = [];
  run(xmlText, mainSchemaUrl, stopOnFailure, duration).then((i) => {
    errorBags.push(...i);
    const response = {
      id,
      status: true,
      bags: errorBags
    };
    self.postMessage(response);
  }).catch((e2) => {
    errorBags.push(...e2);
    const response = {
      id,
      status: false,
      bags: errorBags
    };
    self.postMessage(response);
  });
};
