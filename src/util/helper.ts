/**
 * Rekursif mendeteksi semua dependency XSD dari schema utama,
 * handle xs:import, xs:include, dan xs:redefine
 * 
 * Tidak menggunakan async/await, seluruhnya Promise chaining.
 * Menangani error dengan console.error, tetap resolve agar tidak menghentikan chain.
 */
export async function findRequiredSchemas(
  mainSchemaUrl: string,
  visited = new Set<string>()
): Promise<{ filename: string; contents: string }[]> {
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
          return [{ filename: mainSchemaUrl, contents: text }, ...nestedSchemas];
        });
    })
    .catch((err) => {
      console.error("findRequiredSchemas error:", err);
      // Jangan throw lagi — tetap resolve agar proses tidak berhenti
      return [];
    });
}
