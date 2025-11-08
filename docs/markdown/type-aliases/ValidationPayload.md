[**xml-xsd-validator-browser v1.0.4**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / ValidationPayload

# Type Alias: ValidationPayload

> **ValidationPayload** = `object`

Defined in: [types/types.ts:120](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L120)

🔹 Payload untuk menjalankan validasi XML terhadap XSD.

## Properties

### xmlText

> **xmlText**: `string`

Defined in: [types/types.ts:122](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L122)

Teks XML yang akan divalidasi

***

### duration?

> `optional` **duration**: `number`

Defined in: [types/types.ts:125](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L125)

Lama waktu eksekusi (opsional)

***

### stopOnFailure?

> `optional` **stopOnFailure**: `boolean`

Defined in: [types/types.ts:128](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L128)

Jika `true`, hentikan pada error pertama

***

### mainSchemaUrl?

> `optional` **mainSchemaUrl**: `string` \| `null`

Defined in: [types/types.ts:131](https://github.com/ferdisap/xml-xsd_validator-browser/blob/490baa48e5f31f6e979784148fbc24d41953b6e2/src/types/types.ts#L131)

URL XSD utama (opsional)
