[**xml-xsd-validator-browser v1.0.3**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / ensureLibxml2Loaded

# Function: ensureLibxml2Loaded()

> **ensureLibxml2Loaded**(): `Promise`\<[`ValidationInfo`](../type-aliases/ValidationInfo.md)[]\>

Defined in: [libxmlloader.ts:21](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/libxmlloader.ts#L21)

To ensure that libxml2 has loaded, to let the worker can process.

## Returns

`Promise`\<[`ValidationInfo`](../type-aliases/ValidationInfo.md)[]\>

Promise array contains validation info or an error instance of XmlError or XmlValidateError owned by libxml2-wasm
