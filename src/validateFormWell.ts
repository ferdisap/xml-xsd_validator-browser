import { useLibXml2 } from "./libxmlloader";
import { WorkerBags } from "./types";

/**
 * ✅ Validasi XML hanya untuk memastikan well-formed
 * - Menggunakan libxml2-wasm (WASM, aman di Worker)
 * - Output sesuai struktur ValidationErrorInfo
 */
export async function validateWellForm(xmlText: string): Promise<WorkerBags> {
  const errorBags: WorkerBags = [];
  const { libxml,  ensureLibxmlLoaded } = useLibXml2();
  return ensureLibxmlLoaded()
    .then(() => {
      libxml().XmlDocument.fromString(xmlText);
      return Promise.resolve([]);
    })
    .catch((err:any) => {
      // to check wheer err is instance of XMlParseError. Use attribute details because class instance cannot used in worker
      if (err.details) {
        const detail = (err as any).details || {};
        errorBags.push({
          name: "XMLParseError",
          type: "form",
          detail: {
            message: detail.message || err.message || "Invalid XML format",
            file: detail.file || "",
            line: detail.line?.toString() || 1,
            col: detail.col?.toString() || 1,
          },
        });
      } else {
        if(err.data) errorBags.push(...err.data);
        errorBags.push({
          name: "UnknownError",
          type: "form",
          detail: {
            message: err?.message || String(err),
            file: "",
            line: 1,
            col: 1,
          },
        });
      }
      return Promise.reject(errorBags)
    })
}