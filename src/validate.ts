import { MapInputProvider } from "./provider/MapInputProvider";
import { findRequiredSchemas } from "./util/helper";
import {
  XmlDocument,
  XsdValidator as libxml2XsdValidator,
  XmlValidateError,
  ErrorDetail,
} from 'libxml2-wasm';

/**
 * logic validate xml toward xsd.
 * @param fileurl url
 * @param mainSchemaUrl url
 * @returns 
 */
export function validateXmlTowardXsd(fileurl: string, mainSchemaUrl: string): Promise<null | XmlValidateError> {
  return new Promise((resolve) => {
    // 1) kumpulkan semua XSD yang mungkin dibutuhkan (rekursif atau list manual)
    findRequiredSchemas(mainSchemaUrl)
      .then(schemas => {
        // 2) buat provider dan register
        const provider = new MapInputProvider(schemas);
        const ok = provider.register();

        if (!ok) {
          console.warn("Warning: xmlRegisterInputProvider returned false");
        }
        // for debugging. Log that provider matches expected names
        // console.log("Provider registered. Provider will answer for:", schemas.map(s => s.filename));

        // 3) load XML & main XSD doc (main xsd still parsed from string)
        fetch(fileurl).then(r => r.text())
          .then(async (xmlText) => {
            return fetch(mainSchemaUrl).then(r => r.text())
              .then(mainXsdText => {
                const xmlDoc = XmlDocument.fromString(xmlText);
                const xsdDoc = XmlDocument.fromString(mainXsdText);

                // 4) create validator fromDoc (parser may use our input provider callbacks)
                let validator;
                try {
                  validator = libxml2XsdValidator.fromDoc(xsdDoc);
                } catch (err) {
                  console.error("Failed to parse XSD:", err);
                  provider.cleanup();
                  return;
                }

                // 5) validate
                try {
                  validator.validate(xmlDoc);
                  resolve(null);
                  // console.log("XML valid ✅");
                } catch (err: any) {
                  const e = XmlValidateError.fromDetails([err as ErrorDetail]) as XmlValidateError;
                  resolve(e as XmlValidateError)
                  // console.error("Validation errors:", e.details);
                } finally {
                  // 6) cleanup provider when done
                  provider.cleanup();
                }
              })
          })
      })
  })
}