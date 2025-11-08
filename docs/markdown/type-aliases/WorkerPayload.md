[**xml-xsd-validator-browser v1.0.4**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / WorkerPayload

# Type Alias: WorkerPayload\<TData\>

> **WorkerPayload**\<`TData`\> = `object`

Defined in: [types/types.ts:30](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L30)

🔹 Payload yang dikirim ke worker untuk diproses.

## Type Parameters

### TData

`TData` *extends* `Record`\<`string`, `any`\>

Data spesifik yang dikirim ke worker.

## Properties

### id

> **id**: [`PayloadId`](PayloadId.md)

Defined in: [types/types.ts:32](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L32)

ID unik (UUID) payload

***

### payload

> **payload**: `TData`

Defined in: [types/types.ts:35](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L35)

Isi data aktual yang akan diproses oleh worker
