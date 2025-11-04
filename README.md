**xml-xsd_validator-browser v1.0.0**

# xml-xsd_validator-browser

A lightweight **XML validator in the browser** using [`libxml2-wasm`](https://github.com/jameslan/libxml2-wasm) with support for **recursive XSD imports/includes/redefines** via a `MapInputProvider`.  

This library allows you to validate XML files against complex XSD schemas that reference multiple nested schemas, **without requiring network requests during validation**.

---

## Features

- Validate XML documents in the browser or Node.js.
- Automatically resolve nested `<xs:import>`, `<xs:include>`, and `<xs:redefine>`.
- Use `MapInputProvider` to provide XSD files from memory (no network fetch needed during validation).
- Works with absolute URLs or relative schema paths.
- Simple API with Promises and TypeScript support.

---

## Installation

```bash
npm install xml-xsd_validator-browser
```

## 🧰 Usage Example

```ts
import { validateXmlTowardXsd } from '@/validate.ts';

const fileurl = "/test/xml_file.xml";
const mainSchemaUrl = "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd";
validateXmlTowardXsd(fileurl, mainSchemaUrl)
  .then((result: any) => {
    if (result) {
      const name = result.name
      const stack = result.stack
      const cause = result.cause
      const details = result.details // Array<{line:number, col:number, message:string}>
      const message = result.message
      console.log(name)
      console.log(stack)
      console.log(cause)
      console.log(details)
      console.log(message)
    }
  })
```