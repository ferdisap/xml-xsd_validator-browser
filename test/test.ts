import { ValidationInfo, WorkerResponse } from "../src/types";
// import { ValidationInfo, WorkerResponse } from "../dist/esm/types";
import { useWorker, validateXml } from "../src/validate";
// import { useWorker, validateXml } from "../dist/esm/validate";

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
  const { validate, terminate } = useWorker()
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
      appendToHTML("for_test_2", bags); // returning array contains object has name:"Fetch Error" because CORS
      terminate()
    })

}
test2()

// expected
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
