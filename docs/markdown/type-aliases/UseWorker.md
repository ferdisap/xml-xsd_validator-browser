[**xml-xsd-validator-browser v1.0.4**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / UseWorker

# Type Alias: UseWorker

> **UseWorker** = `object`

Defined in: [types/types.ts:41](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L41)

🔹 Interface utama untuk menggunakan worker di sisi main thread.

## Methods

### validate()

> **validate**(`xmlText`, `mainSchemaUrl`, `stopOnFailure?`): `Promise`\<[`WorkerResponse`](WorkerResponse.md)\>

Defined in: [types/types.ts:49](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L49)

Jalankan proses validasi XML terhadap XSD.

#### Parameters

##### xmlText

`string`

Teks XML yang akan divalidasi.

##### mainSchemaUrl

URL XSD utama (boleh `null`).

`string` | `null`

##### stopOnFailure?

`boolean`

Jika `true`, hentikan saat error pertama ditemukan.

#### Returns

`Promise`\<[`WorkerResponse`](WorkerResponse.md)\>

Promise yang mengembalikan hasil berupa `WorkerResponse`.

***

### terminate()

> **terminate**(): `void`

Defined in: [types/types.ts:54](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L54)

Terminasi worker agar berhenti bekerja dan melepaskan resource.

#### Returns

`void`
