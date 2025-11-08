[**xml-xsd-validator-browser v1.0.4**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / WorkerResponse

# Type Alias: WorkerResponse

> **WorkerResponse** = `object`

Defined in: [types/types.ts:15](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L15)

🔹 Struktur data yang dikirim dari worker ke thread utama.

## Properties

### id

> **id**: [`PayloadId`](PayloadId.md)

Defined in: [types/types.ts:17](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L17)

ID unik (UUID) untuk payload yang sedang diproses

***

### status

> **status**: [`ValidationResponse`](ValidationResponse.md)\[`"status"`\]

Defined in: [types/types.ts:20](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L20)

Status dari proses validasi

***

### bags

> **bags**: [`ValidationResponse`](ValidationResponse.md)\[`"bags"`\]

Defined in: [types/types.ts:23](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L23)

Kumpulan hasil validasi
