[**xml-xsd-validator-browser v1.0.3**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / validateXml

# Function: validateXml()

> **validateXml**(`xmlText`, `mainSchemaUrl`, `stopOnFailure`): `Promise`\<[`ValidationInfo`](../type-aliases/ValidationInfo.md)[]\>

Defined in: [validate.ts:11](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/validate.ts#L11)

TBD, akan memvalidate xml berdasarkan namespace
tidak berjalan di worker
xsi:schemaLocation may contain two xsd, eg. xsi:schemaLocation="namespace1 xsd1 namespace2 xsd2"

## Parameters

### xmlText

`string`

### mainSchemaUrl

`string` | `null`

### stopOnFailure

`boolean` = `true`

## Returns

`Promise`\<[`ValidationInfo`](../type-aliases/ValidationInfo.md)[]\>
