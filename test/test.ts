import { ValidationInfo, WorkerResponse, IValidateEntityNotationOption } from "../src/types/types";
import { constructEntityNotationValidationOption } from "../src/util/helper";
// import { ValidationInfo, WorkerResponse } from "../dist/esm/types";
import { getS1000dAllowedNotation, useWorker, validateXml, XmlEntityNotationOption } from "../src/validate";
// import { useWorker, validateXml } from "../dist/esm/validate";
import { findRequiredDtd, findEntitysNotations, validateEntityNotation } from "../src/validateDtd";

// const fileurl = "/test/xml_file.xml";
// const xmlText = await getXmlText(fileurl);

function appendToHTML(idEl: string, errors: ValidationInfo[]) {
  const container = document.getElementById(idEl)
  if (container) {
    errors.forEach((err, i) => {
      const div = document.createElement("div");
      div.className = "error-item";
      div.innerHTML = `
<strong>${i + 1}. ${err.name}</strong>
<em>(${err.type})</em>
<br>
  <pre>${err.detail.message.trim()}</pre>
  <small>Line: ${err.detail.line}, Col: ${err.detail.col}</small>
      `;
      container.appendChild(div);
    });
  }
}

function test1() {
  const xmlText =
    `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE dmodule >
  <dmodule xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dc="http://www.purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:xlink="http://www.w3.org/1999/xlink" xsi:noNamespaceSchemaLocation="https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd">
    <identAndStatusSection></identAndStatusSection>
  </dmodule>`;
  // const xmlText =
  // `<?xml version="1.0" encoding="UTF-8"?>
  // <!DOCTYPE dmodule >
  // <dmodule xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  //   xmlns:dc="http://www.purl.org/dc/elements/1.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:xlink="http://www.w3.org/1999/xlink"
  //   xsi:noNamespaceSchemaLocation="http://localhost:5174/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd">
  //   <identAndStatusSection></identAndStatusSection>
  // </dmodule>`;
  validateXml(xmlText)
    .catch(bags => {
      // console.log(bags) // returning array contains object has name:"XMLValidateError"
      appendToHTML("for_test_1", bags);
      // console.log('test1', bags);
    })
}
test1()

async function test2() {
  const xmlText =
    `<?xml version="1.0" encoding="UTF-8"?>  <!DOCTYPE dmodule >
  <dmodule>
    <identAndStatusSection></identAndStatusSection>
  </dmodule>`;
  const mainSchemaUrl = "http://www.s1000d.org/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd"; // CORS
  // const xmlText =
  //   `<purchaseOrder xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" orderDate="1999-10-20" xsi:noNamespaceSchemaLocation="./test/purchaseOrder.xsd">
  //     <shipTo country="US">
  //         <name>Alice Smith</name>
  //         <street>123 Maple Street</street>
  //         <city>Mill Valley</city>
  //         <state>CA</state>
  //         <zip>90952</zip>
  //     </shipTo>
  //     <comment>Hurry, my lawn is going wild!</comment>
  //     <items>
  //         <item partNum="872-AA">
  //             <productName>Lawnmower</productName>
  //             <quantity>1</quantity>
  //             <USPrice>148.95</USPrice>
  //             <comment>Confirm this is electric</comment>
  //         </item>
  //         <item partNum="926-AA">
  //             <productName>Baby Monitor</productName>
  //             <quantity>1</quantity>
  //             <USPrice>39.98</USPrice>
  //             <shipDate>1999-05-21</shipDate>
  //         </item>
  //     </items>
  //   </purchaseOrder>`;
  // const mainSchemaUrl = "./test/purchaseOrder.xsd";
  const { validate, terminate, onBefore } = useWorker();
  onBefore({
    "base": window.location.href,
  })
  validate(xmlText, mainSchemaUrl)
    // never get resolved if the file is valid
    .then((response: WorkerResponse) => {
      const { id, status, bags } = response;
      // console.log(id, status, bags)
      appendToHTML("for_test_2", bags);
    })
    .catch((response: WorkerResponse) => {
      const { id, status, bags } = response;
      // console.log(id, status, bags)
      // 1. Failed to find required schemas
      appendToHTML("for_test_2", bags); // returning array contains object has name:"Fetch Error" because CORS
      // console.log('test2', bags);
      terminate()
    })

}
test2()

async function test3() {
  const uri = "/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML";
  const xmlText = await fetch(uri).then(r => r.text())
  validateXml(xmlText)
    .catch(bags => {
      // console.log(bags) // returning array contains object has name:"XMLValidateError"
      // 1. Element 'dmRef': Missing child element(s). Expected is ( dmRefIdent ).
      // 2. element 'graphic', attribute 'infoEntityIdent': 'ICN-C0419-S1000D0381-001-01' is not a valid value of the atomic type 'xs:ENTITY'.
      appendToHTML("for_test_3", bags);
      // console.log('test3', bags);
    })

}
test3()

async function test4() {
  const mainSchemaUrl = "http://www.s1000d.org/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd"; // CORS
  const xmlText = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE dmodule SYSTEM "test/entities.dtd" [
      <!ENTITY ICN-C0419-S1000D0381-001-01 SYSTEM "ICN-C0419-S1000D0381-001-01.CGM" NDATA cgm >
      <!NOTATION cgm PUBLIC "-//sUSA-DOD//NOTATION Computer Graphics Metafile//EN" >
    ]>
    <dmodule>
    </dmodule>`;
  const allowedNotation = await getS1000dAllowedNotation()
  const constructed = constructEntityNotationValidationOption(allowedNotation);

  const { validate, terminate, onBefore } = useWorker();
  onBefore({
    "set_xml_entity_notation_option": constructed,
    "base": window.location.href
  })
  validate(xmlText, mainSchemaUrl)
    // never get resolved if the file is valid
    .catch((response: WorkerResponse) => {
      const { id, status, bags } = response;
      // 1. Notation cgm with public id -//sUSA-DOD//NOTATION Computer Graphics Metafile//EN is not available
      appendToHTML("for_test_4", bags);
      console.log('test4', bags);
      terminate()
    })
}
test4()

// expected test 1
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
