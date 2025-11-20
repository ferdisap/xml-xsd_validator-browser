// ------------------------------------
// Type declarations

import { DtdInfo, EntityNotation, ErrorName, IValidateEntityNotationOption, ParsedEntity, ParsedNotation, ValidationInfo, WorkerBags } from "./types/types.js";
import { findRequiredDtds, isXmlLike } from "./util/helper.js";
import { baseUri, XmlEntityNotationOption } from "./validate.js";

// ------------------------------------
// FUNCTION 1: findRequiredDtds
// ------------------------------------
export function findRequiredDtd(xmlText: string): DtdInfo {
  const doctypeRegex = /<!DOCTYPE\s+([^\s>]+)\s+([^>]*)>/i;
  const doctypeMatch = doctypeRegex.exec(xmlText);

  if (!doctypeMatch) {
    return {
      type: "none",
      publicId: null,
      systemId: null,
      rootName: null,
      internalSubset: null,
      hasInternal: false,
      hasExternal: false,
    } as DtdInfo
  }

  const rootName = doctypeMatch[1];
  const insideDoctype = doctypeMatch[2];

  // =====================================================
  // 1. Extract internal subset (text inside [...])
  // =====================================================
  const internalSubsetMatch = /\[([\s\S]*?)\]\s*>/i.exec(xmlText);
  const internalSubset = internalSubsetMatch ? internalSubsetMatch[1].trim() : null;
  const hasInternal = internalSubset !== null;

  // =====================================================
  // 2. Detect PUBLIC or SYSTEM identifier
  // =====================================================

  // PUBLIC "pubId" "sysId"
  const publicRegex = /PUBLIC\s+"([^"]+)"\s+"([^"]+)"/i;
  const publicMatch = publicRegex.exec(insideDoctype);

  // SYSTEM "sysId"
  const systemRegex = /SYSTEM\s+"([^"]+)"/i;
  const systemMatch = systemRegex.exec(insideDoctype);

  let type: DtdInfo["type"] = "none";
  let publicId: string | null = null;
  let systemId: string | null = null;
  let hasExternal = false;

  if (publicMatch) {
    type = "public";
    publicId = publicMatch[1];
    systemId = publicMatch[2];
    hasExternal = true;
  } else if (systemMatch) {
    type = "external";
    systemId = systemMatch[1];
    hasExternal = true;
  }

  // Jika public + external + internal subset
  if (publicMatch && hasInternal) {
    type = "public+external";
  } else if (systemMatch && hasInternal) {
    type = "external"; // External + internal subset
  } else if (!publicMatch && !systemMatch && hasInternal) {
    type = "internal"; // Only internal subset
  }

  // resolveing to absolute uri
  if (type === "external" || type === "public+external") {
    try {
      const uri = new URL(systemId!);
      systemId = uri.toString();
    } catch (error) {
      const uri = new URL(systemId!, baseUri(null));
      systemId = uri.toString();
    }
  }

  return {
    type,
    publicId,
    systemId,
    rootName,
    internalSubset,
    hasInternal,
    hasExternal,
  } as DtdInfo;
}
// cara pakai findRequiredDtds
// const dtd = findRequiredDtds(xmlString);
// console.log(dtd);
// /*
// {
// "type": "external",
// "publicId": null,
// "systemId": "invoice.dtd",
// "rootName": "invoice",
// "internalSubset": null,
// "hasInternal": false,
// "hasExternal": true
// }
// */

// ------------------------------------
// FUNCTION 2: findEntitysNotations
// ------------------------------------
export async function findEntitysNotations(
  info: DtdInfo | string
): Promise<EntityNotation> {
  const isInfoAsDtdInfo = !(typeof info === 'string');
  let entities: ParsedEntity[] = [];
  let notations: ParsedNotation[] = [];

  const matchEntityNotation = (text: string) => {
    // ENTITY regex (covers internal, external, unparsed)
    const entityRegex =
      /<!ENTITY\s+([a-zA-Z0-9._:-]+)\s+(?:(PUBLIC)\s+"([^"]+)"\s+"([^"]+)"|(SYSTEM)\s+"([^"]+)"|"([^"]+)")(?:(?:\s+NDATA\s+([a-zA-Z0-9._:-]+)))?\s*>/g;

    // NOTATION regex
    const notationRegex =
      /<!NOTATION\s+([a-zA-Z0-9._:-]+)\s+(?:(PUBLIC)\s+"([^"]+)"(?:\s+SYSTEM\s+"([^"]+)")?|SYSTEM\s+"([^"]+)")\s*>/g;

    let m: RegExpExecArray | null;

    // ---------------------------
    // Parse all <!ENTITY ...>
    // ---------------------------
    while ((m = entityRegex.exec(text)) !== null) {
      const name = m[1];

      const isPublic = !!m[2];
      const publicId = m[3] ?? null;
      const publicSystemId = m[4] ?? null;

      const isSystem = !!m[5];
      const systemId = m[6] ?? publicSystemId ?? null;

      // Internal parsed entity (e.g. "hello")
      const internalText = m[7] ?? null;

      const ndata = m[8] ?? null;

      entities.push({
        name,
        publicId: publicId,
        systemId: internalText ? null : systemId, // internal entity -> no systemId
        notationName: ndata ?? null,
      });
    }

    // ---------------------------
    // Parse all <!NOTATION ...>
    // ---------------------------
    while ((m = notationRegex.exec(text)) !== null) {
      const name = m[1];

      const isPublic = !!m[2];
      const publicId = m[3] ?? null;

      const publicSystemId = m[4] ?? null;
      const systemOnly = m[5] ?? null;

      const systemId = publicSystemId ?? systemOnly ?? null;

      notations.push({
        name,
        publicId,
        systemId,
      });
    }
  }

  if (isInfoAsDtdInfo) {
    const subsetText = (info as DtdInfo).internalSubset
    // fill entities and notations
    if (subsetText) matchEntityNotation(subsetText);
    // recursive
    if ((info as DtdInfo).hasExternal && (info as DtdInfo).systemId) {
      return fetch((info as DtdInfo).systemId!)
        .then(response => response.text())
        .then(dtdText => findEntitysNotations(dtdText))
        .then(subset => {
          entities.push(...subset.entities);
          notations.push(...subset.notations);
          return { entities, notations } as EntityNotation
        })
    }
  } else {
    matchEntityNotation(info);
  }

  return { entities, notations };
}

// cara pakai findEntitysNotations
// {
// entities: [
// { name: "copyright", publicId: null, systemId: null, notationName: null },
// { name: "header", publicId: null, systemId: "header.xml", notationName: null },
// { name: "icon", publicId: null, systemId: "icon.cgm", notationName: "cgm" }
// ],
// notations: [
// { name: "cgm", publicId: null, systemId: "image/cgm" }
// ]
// }

export async function notationXmlToObject(xmlText: string): Promise<ParsedNotation[]> {
  if (!isXmlLike(xmlText)) {
    xmlText = await fetch(xmlText).then(response => response.text())
  }
  // Regex untuk menangkap <notation ... />
  const notationRegex = /<notation\s+([^>]+?)\/>/g;

  // Regex untuk menangkap atribut
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;

  const results: ParsedNotation[] = [];

  let match;
  while ((match = notationRegex.exec(xmlText)) !== null) {
    const attributes = match[1];
    let attrMatch;

    const obj: ParsedNotation = { name: "", publicId: "", systemId: "" };

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const key = attrMatch[1];
      const value = attrMatch[2];
      switch (key) {
        case 'public':
          (obj as any)["publicId"] = value;
          break;
        case 'system':
          (obj as any)["systemId"] = value;
          break;
        default:
          (obj as any)[key] = value;
          break;
      }
    }
    results.push(obj);
  }
  return results
}

function isNotValidName(name: string | null, isNotation = true): ValidationInfo | void {
  if (!name || (name === '') || !isNaN(Number(name))) {
    return {
      "name": isNotation ? "NotationNotValid" : "EntityNotValid",
      "type": "dtd",
      "detail": {
        "message": isNotation ? `Notation ${name} is not valid name.` : `Entity ${name} is not valid name.`,
        "file": "",
        "line": 1,
        "col": 1,
      }
    }
  }
}
async function validate(data: EntityNotation, stopOnFailure:boolean) :Promise<WorkerBags> {
  const bags: WorkerBags = []; // berupa nama notasi atau entity
  const option: IValidateEntityNotationOption = XmlEntityNotationOption()
  // 1. validate notation
  if (option.notations) {
    let allowedNotation: ParsedNotation[] | null | undefined= option.notations.allowedNotation;
    // if (option.notations.allowedNotation) allowedNotation = await option.notations.allowedNotation!();
    for (const notation of data.notations) {
      // validate notation publicId
      if (option.notations.publicId) {
        // check name nya dahulu
        if (allowedNotation && allowedNotation!.find(n => n.name === notation.name)) {
          // jika allowedNotation tidak ada nama dan public id yang sama dengan data.notation.publicId/name maka error
          if (notation.publicId && !(allowedNotation!.find(n => n.publicId === notation.publicId))) {
            bags.push({
              "name": "NotationNotValid",
              "type": "dtd",
              "detail": {
                "message": `Notation ${notation.name} with public id ${notation.publicId} is not available`,
                "file": "",
                "line": 1,
                "col": 1,
              }
            })
            if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
          }
        }
        // validate name
        let isnv: ValidationInfo | void;
        if (isnv = isNotValidName(notation.publicId, true)) {
          bags.push(isnv)
          if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
        }
      }
      // validate notation systemId
      if (option.notations.systemId) {
        // check name nya dahulu
        if (allowedNotation && allowedNotation!.find(n => n.name === notation.name)) {
          // jika allowedNotation tidak ada nama dan public id yang sama dengan data.notation.systemId/name maka error
          if (notation.systemId && !(allowedNotation!.find(n => n.systemId === notation.systemId))) {
            bags.push({
              "name": "NotationNotValid",
              "type": "dtd",
              "detail": {
                "message": `Notation ${notation.name} with system id ${notation.systemId} is not available`,
                "file": "",
                "line": 1,
                "col": 1,
              }
            })
            if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
          }
        }
        // validate name
        let isnv: ValidationInfo | void;
        if (isnv = isNotValidName(notation.systemId, true)) {
          bags.push(isnv)
          if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
        }
      }
      // validate notation name
      if (option.notations.name) {
        // jika allowedNotation tidak ada nama yang sesuai dengan data.notation.name maka error
        if (allowedNotation) {
          if (!(allowedNotation.find(n => n.name === notation.name))) {
            bags.push({
              "name": "NotationNotValid",
              "type": "dtd",
              "detail": {
                "message": `Notation ${notation.name} is not available.`,
                "file": "",
                "line": 1,
                "col": 1,
              }
            })
            if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
          }
        }
        // validate name
        let isnv: ValidationInfo | void;
        if (isnv = isNotValidName(notation.name, true)) {
          bags.push(isnv)
          if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
        }
      }
    }
  }

  // 2. validate entity
  if (option.entity) {
    for (const entity of data.entities) {
      // jika punya notation
      if (entity.notationName) {
        // cek apakah ada notation <!NOTATION nya
        if (!(data.notations.find(n => n.name === entity.notationName))) {
          if (option.entity.validNotation) {
            bags.push({
              "name": "EntityNotValid",
              "type": "dtd",
              "detail": {
                "message": `Entity ${entity.name} should have notation`,
                "file": "",
                "line": 1,
                "col": 1,
              }
            })
            if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
          }
        }
        // validate name
        let isnv: ValidationInfo | void;
        if (isnv = isNotValidName(entity.name, false)) {
          bags.push(isnv)
          if(stopOnFailure) return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
        }
      }
    }
  }
  return bags.length ? Promise.reject(bags) : Promise.resolve(bags);
}

export async function validateEntityNotation(xmlText:string, stopOnFailure: boolean = true) :Promise<WorkerBags>{
  return validate(await findEntitysNotations(findRequiredDtd(xmlText)), stopOnFailure)
}
