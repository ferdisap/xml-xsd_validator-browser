[**xml-xsd-validator-browser v1.0.3**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / ValidationInfo

# Type Alias: ValidationInfo

> **ValidationInfo** = `object`

Defined in: [types.ts:78](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L78)

🔹 Informasi detail tentang satu hasil error atau validasi.

## Properties

### name

> **name**: [`ErrorName`](ErrorName.md)

Defined in: [types.ts:80](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L80)

Nama atau kategori error

***

### type

> **type**: [`ValidationType`](ValidationType.md)

Defined in: [types.ts:83](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L83)

Jenis validasi yang dilakukan

***

### detail

> **detail**: `object`

Defined in: [types.ts:86](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L86)

Detail pesan error dan posisi sumber

#### message

> **message**: `string`

Pesan kesalahan

#### file

> **file**: `string`

Nama file atau sumber XML

#### line

> **line**: `number`

Nomor baris terjadinya error

#### col

> **col**: `number`

Nomor kolom terjadinya error
