[**xml-xsd-validator-browser v1.0.9**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / WorkerPayload

# Type Alias: WorkerPayload\<TData\>

> **WorkerPayload**\<`TData`\> = `object`

Defined in: [types/types.ts:33](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/types/types.ts#L33)

🔹 Payload yang dikirim ke worker untuk diproses.

## Type Parameters

### TData

`TData` *extends* `Record`\<`string`, `any`\>

Data spesifik yang dikirim ke worker.

## Properties

### id

> **id**: [`PayloadId`](PayloadId.md)

Defined in: [types/types.ts:35](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/types/types.ts#L35)

ID unik (UUID) payload

***

### payload

> **payload**: `TData`

Defined in: [types/types.ts:38](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/types/types.ts#L38)

Isi data aktual yang akan diproses oleh worker
