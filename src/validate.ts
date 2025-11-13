import { validateWellForm } from "./validateFormWell";
import { UseWorker, ValidationInfo, ValidationPayload, WorkerPayload, WorkerResponse } from "./types/types";
import { validateXmlTowardXsd } from "./validateTowardXsd";

declare global {
  var uri: string;
}

function WorkerWrapper() {
  return new Worker(new URL("./worker/validator.worker.js", import.meta.url), {
    type: "module",
  });
}

self.uri = '';
/**
 * set and get base uri
 */
export function baseUri(uri: string | null = null): string {
  if (uri) {
    self.uri = uri;
  }
  try { return window.location.href; }
  catch (e) { return self.uri; }
}

/**
 * xsi:schemaLocation may contain two xsd, eg. xsi:schemaLocation="namespace1 xsd1 namespace2 xsd2"
 */
export async function validateXml(xmlText: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true): Promise<ValidationInfo[]> {
  const errors: ValidationInfo[] = [];
  return validateWellForm(xmlText)
    .then(() => validateXmlTowardXsd(xmlText, mainSchemaUrl, stopOnFailure))
    .then(() => Promise.resolve(errors))
    .catch(e => {
      errors.push(...e);
      return Promise.reject(errors);
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

  // let validatorWorker: Worker = new ValidatorWorker();
  let validatorWorker: Worker = WorkerWrapper();

  let _resolveReady: (v: any) => void;
  const readyPromise = new Promise((resolve) => (_resolveReady = resolve));

  validatorWorker!.onmessage = (e: MessageEvent<WorkerResponse>) => {
    // console.log("✅ Worker message:", e.data);
    if (e.data.ready) {
      console.log("[xml-xsd-validator-browser] Worker is ready ✅");
      _resolveReady(true);
      return;
    };
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

  validatorWorker.onmessageerror = (e) => {
    console.error("⚠️ Worker message error:", e);
  };


  validatorWorker!.onerror = async function (e: ErrorEvent) {
    throw new Error("Worker error");
  }

  const terminate = async () => {
    validatorWorker!.terminate();
    console.log("[xml-xsd-validator-browser] Worker is terminated ✅");

  }

  const validate = async (xmlText: string, mainSchemaUrl: string | null, stopOnFailure: boolean = true): Promise<WorkerResponse> => {
    // console.log("before validate by worker");
    const id = crypto.randomUUID();

    return new Promise(async (resolve, reject) => {
      _responses.set(id, { resolve, reject });
      let timer = setTimeout(() => {
        const response = {
          id, status: false, bags: [{
            name: "WorkerResponseTimeout",
            type: "none",
            detail: {
              message: "",
              file: "",
              line: 1,
              col: 1,
            }
          }]
        };
        console.error("[xml-xsd-validator-browser] Worker response timeout ⚠️ ");
        return reject(response);
      }, 5000);
      if (await readyPromise) {
        clearTimeout(timer);
        const payload: WorkerPayload<ValidationPayload> = {
          id,
          payload: { xmlText, mainSchemaUrl, stopOnFailure, base: window.location.href }
        }
        // console.log("before post to worker");
        validatorWorker!.postMessage(payload)
      }
    })
  }

  return {
    validate, terminate,
  }
}