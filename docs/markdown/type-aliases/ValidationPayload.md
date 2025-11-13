[**xml-xsd-validator-browser v1.0.9**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / ValidationPayload

# Type Alias: ValidationPayload

> **ValidationPayload** = `object`

Defined in: [types/types.ts:124](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L124)

🔹 Payload untuk menjalankan validasi XML terhadap XSD.

## Properties

### base?

> `optional` **base**: `string`

Defined in: [types/types.ts:126](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L126)

base uri

***

### xmlText

> **xmlText**: `string`

Defined in: [types/types.ts:129](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L129)

Teks XML yang akan divalidasi

***

### duration?

> `optional` **duration**: `number`

Defined in: [types/types.ts:132](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L132)

Lama waktu eksekusi (opsional)

***

### stopOnFailure?

> `optional` **stopOnFailure**: `boolean`

Defined in: [types/types.ts:135](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L135)

Jika `true`, hentikan pada error pertama

***

### mainSchemaUrl?

> `optional` **mainSchemaUrl**: `string` \| `null`

Defined in: [types/types.ts:138](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L138)

URL XSD utama (opsional)
