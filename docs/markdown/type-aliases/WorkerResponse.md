[**xml-xsd-validator-browser v1.0.3**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / WorkerResponse

# Type Alias: WorkerResponse

> **WorkerResponse** = `object`

Defined in: [types.ts:15](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L15)

🔹 Struktur data yang dikirim dari worker ke thread utama.

## Properties

### id

> **id**: [`PayloadId`](PayloadId.md)

Defined in: [types.ts:17](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L17)

ID unik (UUID) untuk payload yang sedang diproses

***

### status

> **status**: [`ValidationResponse`](ValidationResponse.md)\[`"status"`\]

Defined in: [types.ts:20](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L20)

Status dari proses validasi

***

### bags

> **bags**: [`ValidationResponse`](ValidationResponse.md)\[`"bags"`\]

Defined in: [types.ts:23](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L23)

Kumpulan hasil validasi
