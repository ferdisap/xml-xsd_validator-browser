import { MapInputProvider } from "./provider/MapInputProvider";
import { findRequiredSchemas } from "./util/helper";
import {
  XmlDocument,
  XsdValidator as libxml2XsdValidator,
  XmlValidateError,
  ErrorDetail,
} from 'libxml2-wasm';

/**
 * to get xml text from url.
 * @param file url or xml contents
 * @returns xml text
 */
async function getXmlText(file: string): Promise<string> {
  if (isXmlLike(file)) {
    return Promise.resolve(file);
  } else {
    const fileurl = (new URL(file, window.location.href)).href;
    return fetch(fileurl).then(r => r.text())
  }
}

// function isRelativeUrl(str: string) {
//   if (typeof str !== 'string') {
//     return false; // Not a string, so not a URL
//   }
//   // Check if it starts with a protocol (http, https, //) or a common absolute path indicator
//   if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('//') || str.startsWith('/')) {
//     return false; // Likely an absolute URL or absolute path
//   }
//   // If it doesn't contain a colon (indicating a protocol) and doesn't start with a slash, it's likely relative
//   return !str.includes(':');
// }

function isXmlLike(file: string): boolean {
  if (typeof file !== 'string') {
    return false; // Not a string
  }
  // Check for common XML elements and structure
  return file.includes('<') && file.includes('>') &&
    (file.includes('<?xml') || file.includes('</'));
}

/**
 * logic validate xml toward xsd.
 * @param file url or xml contents
 * @param mainSchemaUrl url
 * @returns 
 */
export function validateXmlTowardXsd(file: string, mainSchemaUrl: string): Promise<null | XmlValidateError> {
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
        getXmlText(file)
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

/**
 * TBD
 * ini akan memvalidate xml berdasarkan namespace
 * xsi:schemaLocation may contain two xsd, eg. xsi:schemaLocation="namespace1 xsd1 namespace2 xsd2"
 */
export function validateXml(){

}