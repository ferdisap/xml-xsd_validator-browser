import { ErrorDetail, XsdValidator } from "libxml2-wasm";
import { createMapInputProvider } from "./provider/MapInputProvider";
import { MapInputProvider, Schema, WorkerBags } from "./types";
import { extractSchemaLocation, findRequiredSchemas, getXmlText } from "./util/helper";
import { useLibXml2 } from "./libxmlloader";

/**
 * logic validate xml toward xsd.
 * @param file url or xml contents
 * @param mainSchemaUrl url
 * @returns 
 */
export async function validateXmlTowardXsd(file: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true): Promise<WorkerBags> {
  const { libxml, ensureLibxmlLoaded } = useLibXml2();
  let provider: MapInputProvider | null = null;
  const bags: WorkerBags = [];

  // 0) ensure libxml
  await ensureLibxmlLoaded();
  // 1). Load xmlText
  let xmlText: string;
  try {
    xmlText = await getXmlText(file)
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
    })
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }
  mainSchemaUrl = mainSchemaUrl ?? extractSchemaLocation(xmlText!);
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
    })
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }

  // 2). Load required schema
  let schemas: Schema[] | null = null
  try {
    schemas = await findRequiredSchemas(mainSchemaUrl!)
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
    })
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }

  // 3) create provider
  try {
    provider = await createMapInputProvider(schemas!);
    provider!.register();
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
    })
    if (stopOnFailure) {
      return Promise.reject(bags);
    }
  }


  // 4) load XML & main XSD doc (main xsd still parsed from string)
  const mainXsdText = schemas![0].contents;
  let xmlDoc: any;
  let xsdDoc: any;
  try {
    xmlDoc = libxml().XmlDocument.fromString(xmlText!);
    xsdDoc = libxml().XmlDocument.fromString(mainXsdText);
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
    })
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }

  // 5) create validator
  let validator: any;
  try {
    validator = libxml().XsdValidator.fromDoc(xsdDoc!);
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
    })
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }

  // 6) validate
  try {
    validator!.validate(xmlDoc!);
  } catch (error: any) {
    for (const d of error.details) {
      bags.push({
        name: "XMLValidateError",
        type: "xsd",
        detail: {
          message: d.message || "XSD Validation failed",
          file: d.file || "",
          line: d.line || 1,
          col: d.col || 1,
        },
      });
    }
    if (stopOnFailure) {
      provider?.cleanup();
      return Promise.reject(bags);
    }
  }

  // 6) cleanup
  provider?.cleanup();

  return Promise.reject(bags)
}