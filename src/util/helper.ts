import { ParseOption } from "libxml2-wasm";
import { DtdLocation, IValidateEntityNotationOption, ParsedNotation, Schema } from "../types/types.js";
import { baseUri } from "../validate.js";

/**
 * Gabungkan array `Schema` berdasarkan nama file (basename).
 * - File dengan basename sama digabung.
 * - Filename yang lebih lengkap (lebih panjang / punya path) dipertahankan.
 * - Properti kosong diisi dari item lain.
 */
export function mergeByBasenameKeepFullPath(
  existingArr: Schema[],
  newItems: Schema[]
): Schema[] {
  const combined = [...existingArr, ...newItems];
  const map: Record<string, Schema> = Object.create(null);

  const basename = (filename: string): string => filename.split("/").pop() || filename;

  const isEmpty = (v: unknown): boolean =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "");

  for (const item of combined) {
    const key = basename(item.filename);

    if (!map[key]) {
      // Clone untuk menghindari mutasi input
      map[key] = { ...item };
      continue;
    }

    const current = map[key];

    // 🔹 Pilih filename yang lebih panjang (punya path)
    if (item.filename.length > current.filename.length) {
      current.filename = item.filename;
    }

    // 🔹 Gabungkan properti (isi hanya jika kosong)
    for (const [k, v] of Object.entries(item) as [keyof Schema, Schema[keyof Schema]][]) {
      if (k === "filename") continue;

      if (isEmpty(current[k]) && !isEmpty(v)) {
        current[k] = v!;
      }
    }
  }

  return Object.values(map);
}

/**
 * Rekursif mendeteksi semua dependency XSD dari schema utama,
 * handle xs:import, xs:include, dan xs:redefine
 *
 * Tidak menggunakan async/await, seluruhnya Promise chaining.
 * Menangani error dengan console.error, tetap resolve agar tidak menghentikan chain.
 * array index 0 adalah mainSchemaUrl
 */
export async function findRequiredSchemas(
  mainSchemaUrl: string,
  visited = new Set<string>()
): Promise<Schema[]> {
  try {
    mainSchemaUrl = resolveUriToBase(mainSchemaUrl);
  } catch (err) {
    console.error("schema-url-not-well-formed:", err);
    return Promise.reject([]);
  }
  if (visited.has(mainSchemaUrl)) {
    return Promise.resolve([]);
  }
  visited.add(mainSchemaUrl);
  return fetch(mainSchemaUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Gagal fetch schema: ${mainSchemaUrl}`);
      return res.text();
    })
    .then(async (text) => {
      const regex = /<[a-zA-Z]{2}:(?:import|include|redefine)[^>]*schemaLocation="([^"]+)"/g;
      const matches = Array.from(text.matchAll(regex));

      const nestedUrls: string[] = [];
      for (const match of matches) {
        try {
          const resolved = resolveUri(match[1], mainSchemaUrl)
          if (!visited.has(resolved)) nestedUrls.push(resolved);
        } catch (e) {
          console.warn("URL tidak valid:", match[1]);
        }
      }

      return Promise.all(
        nestedUrls.map((url) => findRequiredSchemas(url, visited))
      )
        .then((nestedSchemasArrays) => {
          const nestedSchemas = nestedSchemasArrays.flat();
          return Promise.resolve([{ filename: mainSchemaUrl, contents: text }, ...nestedSchemas]);
        });
    })
    .catch((err) => {
      console.error("findRequiredSchemas error:", err);
      // Jangan throw lagi — tetap resolve agar proses tidak berhenti
      return Promise.reject([]);
    });
}

/**
 * Ambil URL schema dari atribut `xsi:noNamespaceSchemaLocation`
 * atau `xsi:schemaLocation`.
 */
export function detectSchemaLocation(xmlText: string): Schema[] {
  // Cari noNamespaceSchemaLocation
  const noNsMatch = xmlText.match(
    /\b[a-zA-Z0-9]+:noNamespaceSchemaLocation\s*=\s*["']([^"']+)["']/i
  );
  if (noNsMatch) return [{ filename: noNsMatch[1], contents: "" }];

  // Cari schemaLocation (bisa punya banyak pasangan namespace + URL)
  const schemaLocMatch = xmlText.match(
    /\b[a-zA-Z0-9]+:schemaLocation\s*=\s*["']([^"']+)["']/i
  );

  if (schemaLocMatch) {
    // schemaLocation bisa berisi banyak pasangan:
    // "ns1 url1 ns2 url2 ..." → ambil semua URL yang kelihatan valid
    const parts = schemaLocMatch[1].trim().split(/\s+/);
    const urls = parts.filter(p => /^https?:\/\/|\.xsd$/i.test(p));

    const schemaLocations: Schema[] = [];
    for (let i = 0; i < urls.length; i += 2) {
      schemaLocations.push({
        namespace: urls[i],
        filename: urls[i + 1],
        contents: "",
      } as Schema);
    }

    return schemaLocations;
    // return urls[0] || null;
  }

  // Tidak ditemukan
  return [];
}

/**
 * to check wheter the param is xml text or url
 * @param file url or xml text file
 * @returns
 */
export function isXmlLike(file: string): boolean {
  if (typeof file !== 'string') {
    return false; // Not a string
  }
  // Check for common XML elements and structure
  return file.includes('<') && file.includes('>') &&
    (file.includes('<?xml') || file.includes('</'));
}

/**
 * resolve relative uri to base uri jika
 * @param uri
 * @returns
 */
export function resolveUriToBase(uri: string) {
  return (new URL(uri, baseUri(null))).href;
}

/**
 * resolve relative uri to base uri
 * Menggabungkan base URL (file induk) dengan path relatif.
 * Jika childUrl sudah absolute, langsung dikembalikan.
 */
export function resolveUri(uri: string, baseUri: string): string {
  try {
    // Jika uri sudah absolute URL
    new URL(uri);
    return uri;
  } catch {
    // not absolute → continue
  }

  try {
    const base = new URL(baseUri);
    return new URL(uri, base).toString();
  } catch {
    // fallback manual (jika base bukan URL)
  }

  // fallback: file path berdasarkan folder parent
  if (baseUri.includes("/")) {
    const baseDir = baseUri.substring(0, baseUri.lastIndexOf("/") + 1);
    return baseDir + uri;
  }

  return uri;
}

/**
 * to get xml text from url.
 * @param file url or xml contents
 * @returns xml text
 */
export async function getSchemaText(file: string): Promise<string> {
  if (isXmlLike(file)) {
    return Promise.resolve(file);
  } else {
    const fileurl = (new URL(file, baseUri(null))).href;
    return fetch(fileurl).then(r => r.text())
  }
}

/**
 * Mendeteksi DTD (SYSTEM, PUBLIC, internal subset) dari XML.
 * Mendukung multiline dan kombinasi PUBLIC+SYSTEM.
 */
export function detectDtdLocation(xmlText: string): DtdLocation {
  const doctypeRegex =
    /<!DOCTYPE\s+([a-zA-Z0-9:_-]+)\s*((?:PUBLIC\s+"[^"]+"\s+"[^"]+")|(?:PUBLIC\s+"[^"]+")|(?:SYSTEM\s+"[^"]+")|)\s*(?:\[(.*?)\])?\s*>/is;

  const match = doctypeRegex.exec(xmlText);

  if (!match) {
    return {
      type: "none",
      publicId: null,
      systemId: null,
      internalSubset: null,
      rootName: null,
    };
  }

  const rootName = match[1] || null;
  const externalDecl = match[2] || "";
  const internalSubset = match[3] ? match[3].trim() : null;

  let publicId: string | null = null;
  let systemId: string | null = null;

  // DETEKSI PUBLIC + SYSTEM
  const publicFull = /PUBLIC\s+"([^"]+)"\s+"([^"]+)"/i.exec(externalDecl);
  if (publicFull) {
    publicId = publicFull[1];
    systemId = publicFull[2];
    return {
      type: "public+external",
      publicId,
      systemId,
      internalSubset,
      rootName,
    };
  }

  // DETEKSI PUBLIC (hanya publicId saja)
  const publicOnly = /PUBLIC\s+"([^"]+)"/i.exec(externalDecl);
  if (publicOnly) {
    publicId = publicOnly[1];
    systemId = null;
    return {
      type: "public",
      publicId,
      systemId,
      internalSubset,
      rootName,
    };
  }

  // DETEKSI SYSTEM
  const systemOnly = /SYSTEM\s+"([^"]+)"/i.exec(externalDecl);
  if (systemOnly) {
    systemId = systemOnly[1];
    return {
      type: "external",
      publicId: null,
      systemId,
      internalSubset,
      rootName,
    };
  }

  // Jika tidak ada PUBLIC/SYSTEM tetapi ada internal subset
  if (internalSubset) {
    return {
      type: "internal",
      publicId: null,
      systemId: null,
      internalSubset,
      rootName,
    };
  }

  // fallback
  return {
    type: "none",
    publicId: null,
    systemId: null,
    internalSubset: null,
    rootName,
  };
}

/**
 * Mencari semua DTD yang dibutuhkan oleh DTD utama,
 * termasuk nested ENTITY SYSTEM, ENTITY % param, NOTATION SYSTEM/PUBLIC.
 *
 * Mirip findRequiredSchemas untuk XSD.
 */
export async function findRequiredDtds(
  mainDtdUrl: string,
  visited = new Set<string>()
): Promise<Schema[]> {
  try {
    mainDtdUrl = resolveUriToBase(mainDtdUrl);
  } catch (err) {
    console.error("dtd-url-not-well-formed:", err);
    return Promise.reject([]);
  }

  if (visited.has(mainDtdUrl)) {
    return Promise.resolve([]);
  }
  visited.add(mainDtdUrl);

  return fetch(mainDtdUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Gagal fetch DTD: ${mainDtdUrl}`);
      return res.text();
    })
    .then(async (text) => {
      const nestedUrls: string[] = [];

      // DETEKSI ENTITY SYSTEM "xxx.dtd" dan parameter entity %name SYSTEM...
      const entityRegex =
        /<!ENTITY\s+(?:%?\s*\w+)\s+SYSTEM\s+"([^"]+)"/gi;

      for (const m of text.matchAll(entityRegex)) {
        try {
          const resolved = resolveUri(m[1], mainDtdUrl);
          if (!visited.has(resolved)) nestedUrls.push(resolved);
        } catch (e) {
          console.warn("DTD entity URL tidak valid:", m[1]);
        }
      }

      // DETEKSI NOTATION SYSTEM/PUBLIC
      const notationRegex =
        /<!NOTATION\s+\w+\s+(?:SYSTEM\s+"([^"]+)"|PUBLIC\s+"[^"]+"\s+"([^"]+)")/gi;

      for (const m of text.matchAll(notationRegex)) {
        const sys = m[1] || m[2];
        if (sys) {
          try {
            const resolved = resolveUri(sys, mainDtdUrl);
            if (!visited.has(resolved)) nestedUrls.push(resolved);
          } catch (e) {
            console.warn("DTD notation URL tidak valid:", sys);
          }
        }
      }

      // RECURSIVE load nested DTDs
      return Promise.all(
        nestedUrls.map((url) => findRequiredDtds(url, visited))
      )
        .then((nested) => {
          const extra = nested.flat();
          return Promise.resolve([
            { filename: mainDtdUrl, contents: text },
            ...extra,
          ]);
        });
    })
    .catch((err) => {
      console.error("findRequiredDtds error:", err);
      return Promise.reject([]);
    });
}

export function constructEntityNotationValidationOption(
  allowedNotation: ParsedNotation[],
  entityValidNotation = true,
  notationValidName = true,
  notationValidPublicId = true,
): IValidateEntityNotationOption {
  return {
    entity: {
      validNotation: entityValidNotation
    },
    notations: {
      allowedNotation,
      name: notationValidName,
      publicId: notationValidPublicId
    }
  }
}

// /**
//  * Build bitmask for libxml2 ParseOptions
//  *
//  * @param opts Configuration flags
//  */
// export function buildXmlParseOptions(opts: {
//   dtd?: boolean;
//   expandEntities?: true;
//   validateDtd?: false;
//   noNetwork?: false;
// } = {}) {
//   let option = ParseOption.XML_PARSE_DEFAULT;

//   if (opts.dtd) {
//     option |= ParseOption.XML_PARSE_DTDLOAD;    // load internal / external DTD
//   }

//   if (opts.expandEntities) {
//     option |= ParseOption.XML_PARSE_NOENT;      // expand &ENTITY;
//   }

//   if (opts.validateDtd) {
//     option |= ParseOption.XML_PARSE_DTDVALID;   // optional: validate using DTD
//   }

//   if (opts.noNetwork) {
//     option |= ParseOption.XML_PARSE_NONET;      // avoid fetching external URLs
//   }

//   return option;
// }
