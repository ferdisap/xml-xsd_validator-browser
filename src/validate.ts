import { validateWellForm } from "./validateFormWell";
import { UseWorker, ValidationInfo, ValidationPayload, WorkerPayload, WorkerResponse } from "./types/types";
import { validateXmlTowardXsd } from "./validateTowardXsd";
// import * as ValidatorWorker from "./worker/validator.worker?worker";
// import ValidatorWorker from "./worker/validator.worker?worker";


// validate.ts (your library)
export async function createValidatorWorker(): Promise<Worker> {
  // dynamically import the worker if bundler supports it
  // works for Vite and esbuild
  const WorkerConstructor = (await import("./worker/validator.worker?worker")).default;
  return new WorkerConstructor();
  // return new ValidatorWorker()
}

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
  const _responses = new Map<
    string,
    { resolve: (res: WorkerResponse) => void; reject: (err?: any) => void }
  >();

  // const validatorWorker = new ValidatorWorker();
  let validatorWorker: Worker | null;
  const validatorWorkerCreate = new Promise(async (r) => {
    validatorWorker = await createValidatorWorker();
    validatorWorker!.onmessage = (e: MessageEvent<WorkerResponse>) => {
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
  
    validatorWorker!.onerror = function (e: ErrorEvent) {
      throw new Error("Worker error");
    }
    return r(validatorWorker);
  })


  const terminate = async () => {
    if (!validatorWorker) await validatorWorkerCreate;
    validatorWorker!.terminate();

  }

  const validate = async (xmlText: string, mainSchemaUrl: string | null, stopOnFailure: boolean = true): Promise<WorkerResponse> => {
    if (!validatorWorker) await validatorWorkerCreate;
    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      _responses.set(id, { resolve, reject });

      const payload: WorkerPayload<ValidationPayload> = {
        id,
        payload: { xmlText, mainSchemaUrl, stopOnFailure }
      }
      validatorWorker!.postMessage(payload)
    })
  }

  return {
    validate, terminate
  }
}