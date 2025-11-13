[**xml-xsd-validator-browser v1.0.7**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / MapInputProvider

# Type Alias: MapInputProvider

> **MapInputProvider** = `object`

Defined in: [types/types.ts:153](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L153)

🔹 Input provider untuk proses validasi XML.
Menyediakan akses virtual terhadap file yang dibaca oleh `libxml2-wasm`.

## Methods

### match()

> **match**(`filename`): `boolean`

Defined in: [types/types.ts:159](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L159)

Tentukan apakah provider ini menangani file tertentu.

#### Parameters

##### filename

`string`

Nama file yang ingin dicek.

#### Returns

`boolean`

`true` jika provider akan menangani file tersebut.

***

### open()

> **open**(`filename`): `number` \| `undefined`

Defined in: [types/types.ts:166](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L166)

Membuka file dan mengembalikan file descriptor.

#### Parameters

##### filename

`string`

Nama file.

#### Returns

`number` \| `undefined`

Nomor descriptor, atau `undefined` jika gagal.

***

### read()

> **read**(`fd`, `buf`): `number`

Defined in: [types/types.ts:174](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L174)

Membaca isi file berdasarkan descriptor.

#### Parameters

##### fd

`number`

File descriptor.

##### buf

`Uint8Array`

Buffer target pembacaan.

#### Returns

`number`

Jumlah byte yang berhasil dibaca, `-1` jika gagal.

***

### close()

> **close**(`fd`): `boolean`

Defined in: [types/types.ts:181](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L181)

Menutup file descriptor.

#### Parameters

##### fd

`number`

File descriptor.

#### Returns

`boolean`

`true` jika berhasil menutup.

***

### register()

> **register**(): `any`

Defined in: [types/types.ts:186](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L186)

Registrasi provider ini ke dalam sistem libxml2 virtual IO.

#### Returns

`any`

***

### cleanup()

> **cleanup**(): `void`

Defined in: [types/types.ts:191](https://github.com/ferdisap/xml-xsd_validator-browser/blob/262a5d69532399b9b2c332f3b4b8954db3f6ed4b/src/types/types.ts#L191)

Bersihkan provider dari sistem libxml2.

#### Returns

`void`
