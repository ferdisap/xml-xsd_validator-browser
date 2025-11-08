/**
 * Rekursif mendeteksi semua dependency XSD dari schema utama,
 * handle xs:import, xs:include, dan xs:redefine
 * 
 * Tidak menggunakan async/await, seluruhnya Promise chaining.
 * Menangani error dengan console.error, tetap resolve agar tidak menghentikan chain.
 * array index 0 adalah mainSchemaUrl
 */

import { Schema } from "../types";

export async function findRequiredSchemas(
  mainSchemaUrl: string,
  visited = new Set<string>()
): Promise<Schema[]> {
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
      const base = new URL(mainSchemaUrl);

      const nestedUrls: string[] = [];
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
export function extractSchemaLocation(xmlText: string): string | null {
  // Cari noNamespaceSchemaLocation
  const noNsMatch = xmlText.match(
    /\b[a-zA-Z0-9]+:noNamespaceSchemaLocation\s*=\s*["']([^"']+)["']/i
  );
  if (noNsMatch) return noNsMatch[1];

  // Cari schemaLocation (bisa punya banyak pasangan namespace + URL)
  const schemaLocMatch = xmlText.match(
    /\bxsi:schemaLocation\s*=\s*["']([^"']+)["']/i
  );

  if (schemaLocMatch) {
    // schemaLocation bisa berisi banyak pasangan:
    // "ns1 url1 ns2 url2 ..." → ambil semua URL yang kelihatan valid
    const parts = schemaLocMatch[1].trim().split(/\s+/);
    const urls = parts.filter(p => /^https?:\/\/|\.xsd$/i.test(p));
    return urls[0] || null;
  }

  // Tidak ditemukan
  return null;
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
 * to get xml text from url.
 * @param file url or xml contents
 * @returns xml text
 */
export async function getXmlText(file: string): Promise<string> {
  if (isXmlLike(file)) {
    return Promise.resolve(file);
  } else {
    const fileurl = (new URL(file, window.location.href)).href;
    return fetch(fileurl).then(r => r.text())
  }
}

