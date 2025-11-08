[**xml-xsd-validator-browser v1.0.4**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / validateWellForm

# Function: validateWellForm()

> **validateWellForm**(`xmlText`): `Promise`\<[`WorkerBags`](../type-aliases/WorkerBags.md)\>

Defined in: [validateFormWell.ts:9](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/validateFormWell.ts#L9)

✅ Validasi XML hanya untuk memastikan well-formed
- Menggunakan libxml2-wasm (WASM, aman di Worker)
- Output sesuai struktur ValidationErrorInfo

## Parameters

### xmlText

`string`

## Returns

`Promise`\<[`WorkerBags`](../type-aliases/WorkerBags.md)\>
