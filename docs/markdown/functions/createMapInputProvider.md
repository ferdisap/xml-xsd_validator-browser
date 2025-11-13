[**xml-xsd-validator-browser v1.0.9**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / createMapInputProvider

# Function: createMapInputProvider()

> **createMapInputProvider**(`map`): `Promise`\<[`MapInputProvider`](../type-aliases/MapInputProvider.md)\>

Defined in: [provider/MapInputProvider.ts:15](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/provider/MapInputProvider.ts#L15)

Create a virtual file provider for libxml2-wasm.
It maps filenames (or URLs) to in-memory schema contents,
allowing libxml2 to resolve xs:import/xs:include directly
without needing network access.

## Parameters

### map

`Map`\<`string`, `string`\> | [`Schema`](../type-aliases/Schema.md)[]

## Returns

`Promise`\<[`MapInputProvider`](../type-aliases/MapInputProvider.md)\>
