import { ensureLibxml2Loaded } from "../libxmlloader";
import { ValidationPayload, ValidationResponse, WorkerBags, WorkerPayload, WorkerResponse } from "../types";
import { validateWellForm } from "../validateFormWell";
import { validateXmlTowardXsd } from "../validateTowardXsd";

async function validating(xmlText: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true) {

  await ensureLibxml2Loaded();
  return Promise.all([
    validateWellForm(xmlText),
    validateXmlTowardXsd(xmlText, mainSchemaUrl, stopOnFailure)
  ])
  .then(() => Promise.resolve([]))
  .catch((bags: WorkerBags) => Promise.reject(bags))
}
async function run(xmlText: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true, duration: number = 3000): Promise<WorkerBags> {

  const timer = setTimeout(() => {
    Promise.reject([
      {
        name: "ParseTimeout",
        type: "form",
        details: {
          message: "Parsing timeout or worker unresponsive",
          file: "",
          line: 1,
          col: 1,
        },
      },
    ]);
  }, duration);

  return validating(xmlText, mainSchemaUrl, stopOnFailure)
    .then((data) => {
      clearTimeout(timer);
      return Promise.resolve(data)
    })
    .catch(bags => {
      clearTimeout(timer)
      return Promise.reject(bags)
    })
}

self.onmessage = (e: MessageEvent<WorkerPayload<ValidationPayload>>) => {
  const { id, payload } = e.data;
  const { xmlText, mainSchemaUrl, stopOnFailure, duration } = payload;

  const errorBags: WorkerBags = [];
  run(xmlText, mainSchemaUrl, stopOnFailure, duration)
    .then((i) => {
      errorBags.push(...i);
      const response: WorkerResponse = {
        id,
        status: true,
        bags: errorBags,
      }
      self.postMessage(response);
    })
    .catch(e => {
      errorBags.push(...e);
      const response: WorkerResponse = {
        id,
        status: false,
        bags: errorBags,
      }
      self.postMessage(response)
    })
}















// let validatorWorker: Worker | null;
// function run(xmlText: string, mainSchemaUrl:string | null = null, stopOnFailure: boolean = true, duration: number = 3000): Promise<WorkerBags> {
//   return new Promise((resolve, reject) => {
//     validatorWorker = new ValidatorWorker();

//     let finished = false;

//     const timer = setTimeout(() => {
//       if (finished) return;
//       finished = true;
//       try {
//         validatorWorker!.terminate();
//       } catch (e) {
//         // ignore
//       }
//       reject([
//         {
//           name: "ParseTimeout",
//           type: "form",
//           details: {
//             message: "Parsing timeout or worker unresponsive",
//             file: "",
//             line: 1,
//             col: 1,
//           },
//         },
//       ]);
//     }, duration);

//     validatorWorker!.onmessage = (ev: MessageEvent) => {
//       if (finished) return;
//       finished = true;
//       clearTimeout(timer);
//       const data = ev.data as WorkerResponse; // no id here

//       if (data.status) {
//         resolve(data.bags); // empty array -> no errors
//       } else {
//         reject(data.bags);
//       }
//       validatorWorker!.terminate();
//     };

//     validatorWorker!.onerror = (ev) => {
//       if (finished) return;
//       finished = true;
//       clearTimeout(timer);
//       validatorWorker!.terminate();
//       reject([
//         {
//           name: "WorkerRuntimeError",
//           type: "none",
//           details: {
//             message: ev?.message || "Worker runtime error",
//             file: "",
//             line: 1,
//             col: 1,
//           },
//         },
//       ]);
//     };

//     // send xmlText
//     const payload:ValidationPayload = {
//       xmlText, mainSchemaUrl, stopOnFailure
//     }
//     validatorWorker!.postMessage(payload);
//   });
// }

// self.onmessage = (e: MessageEvent<WorkerPayload<ValidationPayload>>) => {
//   const { type, id } = e.data
//   let status = false;
//   if (type === "terminate") {
//     validatorWorker?.terminate();
//     const response: WorkerResponse = {
//       id,
//       type,
//       status: true,
//       bags: [],
//     }
//     self.postMessage(response)
//     return;
//   }
//   const { payload } = e.data;
//   const { xmlText, mainSchemaUrl, stopOnFailure, duration } = payload;

//   const errorBags: WorkerBags = [];
//   run(xmlText, mainSchemaUrl, stopOnFailure, duration)
//     .then((i) => {
//       errorBags.push(...i);
//       status = true;
//       return errorBags;
//     })
//     .catch(e => {
//       errorBags.push(...e);
//       return errorBags
//     })
//     .finally(() => {
//       const response: WorkerResponse = {
//         id,
//         type,
//         status,
//         bags: errorBags,
//       }
//       self.postMessage(response)
//     })
// }