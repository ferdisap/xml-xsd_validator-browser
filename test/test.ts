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