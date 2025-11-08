import { validateWellForm } from "./validateFormWell";
import { UseWorker, ValidationInfo, ValidationPayload, WorkerPayload, WorkerResponse } from "./types";
import { validateXmlTowardXsd } from "./validateTowardXsd";
import ValidatorWorker from "./worker/validator.worker?worker";

/**
 * TBD, akan memvalidate xml berdasarkan namespace
 * tidak berjalan di worker
 * xsi:schemaLocation may contain two xsd, eg. xsi:schemaLocation="namespace1 xsd1 namespace2 xsd2"
 */
export async function validateXml(xmlText: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true): Promise<ValidationInfo[]> {
  const errors: ValidationInfo[] = [];
  return validateWellForm(xmlText)
    .then((validateWellFormInfos): ValidationInfo[] | Promise<ValidationInfo[]> => {
      errors.push(...validateWellFormInfos);
      if (!stopOnFailure || (errors.length < 1)) {
        return validateXmlTowardXsd(xmlText, mainSchemaUrl, stopOnFailure)
          .then((validateXmlTowardXsdInfos) => {
            if (validateXmlTowardXsdInfos) {
              errors.push(...validateXmlTowardXsdInfos)
            }
            return errors;
          })
      }
      return errors;
    })
}

// function reactiveStatus(init: string) {
//   let value = init;
//   let listeners: Function[] = [];

//   return {
//     get value() {
//       return value;
//     },
//     set value(v) {
//       value = v;
//       listeners.forEach(fn => fn(v));
//     },
//     reset() {
//       listeners = [];
//     },
//     watch(fn: Function) {
//       listeners.push(fn);
//     },
//     when(predicate: Function) {
//       return new Promise(resolve => {
//         if (predicate(value)) resolve(value);
//         else this.watch((v: any) => predicate(v) && resolve(v));
//       });
//     }
//   };
// }
// contoh penggunaan reactiveStatus:
// const wstatus = reactiveStatus("working");
// let s1:any = wstatus.when(v => v !== "working").then(v => s1 = v);
// wstatus.value = "done"; // ✅ langsung resolve

export function useWorker(): UseWorker {
  const validatorWorker = new ValidatorWorker();
  const _responses = new Map<
    string,
    { resolve: (res: WorkerResponse) => void; reject: (err?: any) => void }
  >();

  validatorWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const { id, status, bags } = e.data;
    if (status) {
      if (_responses.has(id)) {
        const { resolve } = _responses.get(id)!;
        resolve({ id, status, bags });
        _responses.delete(id)

      }
    } else {
      const { reject } = _responses.get(id)!;
      reject({ id, status, bags });
      _responses.delete(id)
    }
  }

  validatorWorker.onerror = function (e: ErrorEvent) {
    throw new Error("Worker error");
  }

  const terminate = () => {
    validatorWorker.terminate();

  }

  const validate = (xmlText: string, mainSchemaUrl: string | null, stopOnFailure: boolean = true): Promise<WorkerResponse> => {
    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      _responses.set(id, {resolve, reject});

      const payload: WorkerPayload<ValidationPayload> = {
        id,
        payload: { xmlText, mainSchemaUrl, stopOnFailure }
      }
      validatorWorker.postMessage(payload)
    })
  }

  return {
    validate, terminate
  }
}