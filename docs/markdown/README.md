**xml-xsd-validator-browser v1.0.3**

***

**xml-xsd-validator-browser v1.0.3**

# 🧩 xml-xsd-validator-browser

A lightweight **XML validator in the browser** using [`libxml2-wasm`](https://github.com/jameslan/libxml2-wasm) with support for **recursive XSD imports/includes/redefines** via a `MapInputProvider`.

This library allows you to validate XML files against complex XSD schemas that reference multiple nested schemas, **without requiring network requests during validation**.

Read the docs:
- [Github] https://ferdisap.github.io/xml-xsd_validator-browser/docs/html/index
- [Github] https://ferdisap.github.io/xml-xsd_validator-browser/docs/html/modules
---

## 🟢 Features

- Validate XML documents in the browser or Node.js.
- Automatically resolve nested `<xs:import>`, `<xs:include>`, and `<xs:redefine>`.
- Use `MapInputProvider` to provide XSD files from memory (no network fetch needed during validation).
- Works with absolute URLs or relative schema paths.
- Simple API with Promises and TypeScript support.

---

## 🔧 Installation

```bash
npm i xml-xsd-validator-browser
```

## 🧰 Usage Example

```ts
import { extractSchemaLocation, getXmlText } from "../src/util/helper";
import { useWorker, validateXml } from "../src/validate";

// if use xml file url
// const fileurl = "/test/xml_file.xml";
// const xmlText = await getXmlText(fileurl);

function test1() {
  const xmlText = 
  `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE dmodule >
  <dmodule xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://www.purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:noNamespaceSchemaLocation="https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd"><identAndStatusSection></identAndStatusSection></dmodule>`;
  validateXml(xmlText)
    .catch(err => {
      console.log(err) // returning array contains object has name:"XMLValidateError"
    })
}
test1()

async function test2() {
  const xmlText = 
  `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE dmodule >
  <dmodule>
    <identAndStatusSection></identAndStatusSection>
  </dmodule>`;
  const mainSchemaUrl = "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd";

  const { validate, terminate } = useWorker()
  validate(xmlText, mainSchemaUrl)
    // never get resolved if the file is valid
    .then(response => {
      const { id, status, bags } = response;
      console.log(id, status, bags) // returning array contains object has name:"XMLValidateError"
    })
    .catch(response => {
      console.log(response)
      terminate()
    })

}
test2()

// expected of test1 and tes2
/**
[
  {
    name: "XMLValidateError",
    type: "xsd",
    detail: {
      message: "Element 'identAndStatusSection': Missing child element(s). Expected is ( dmAddress ).\\n",
      file: "",
      line: 3,
      col: 1
    }
  },
  {
    name: "XMLValidateError",
    type: "xsd",
    detail: {
      message: "Element 'dmodule': Missing child element(s). Expected is ( content ).\\n",
      file: "",
      line: 2,
      col: 1
    }
  }
]
*/

```
