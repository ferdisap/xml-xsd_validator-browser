import { ValidationPayload, ValidationResponse, WorkerBags, WorkerPayload, WorkerResponse } from "../types/types";
import { validateWellForm } from "../validateFormWell";
import { validateXmlTowardXsd } from "../validateTowardXsd";

async function validating(xmlText: string, mainSchemaUrl: string | null = null, stopOnFailure: boolean = true) {
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

// console.log('[worker] self on message ready');
self.postMessage({
  ready: true
});
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
