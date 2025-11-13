[**xml-xsd-validator-browser v1.0.9**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / MapInputProvider

# Type Alias: MapInputProvider

> **MapInputProvider** = `object`

Defined in: [types/types.ts:159](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L159)

🔹 Input provider untuk proses validasi XML.
Menyediakan akses virtual terhadap file yang dibaca oleh `libxml2-wasm`.

## Methods

### match()

> **match**(`filename`): `boolean`

Defined in: [types/types.ts:165](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L165)

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

Defined in: [types/types.ts:172](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L172)

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

Defined in: [types/types.ts:180](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L180)

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

Defined in: [types/types.ts:187](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L187)

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

Defined in: [types/types.ts:192](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L192)

Registrasi provider ini ke dalam sistem libxml2 virtual IO.

#### Returns

`any`

***

### cleanup()

> **cleanup**(): `void`

Defined in: [types/types.ts:197](https://github.com/ferdisap/xml-xsd_validator-browser/blob/f546e7f8db997c60245e28b1fc8e1492efc7c262/src/types/types.ts#L197)

Bersihkan provider dari sistem libxml2.

#### Returns

`void`
