[**xml-xsd-validator-browser v1.0.3**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / MapInputProvider

# Type Alias: MapInputProvider

> **MapInputProvider** = `object`

Defined in: [types.ts:149](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L149)

🔹 Input provider untuk proses validasi XML.
Menyediakan akses virtual terhadap file yang dibaca oleh `libxml2-wasm`.

## Methods

### match()

> **match**(`filename`): `boolean`

Defined in: [types.ts:155](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L155)

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

Defined in: [types.ts:162](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L162)

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

Defined in: [types.ts:170](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L170)

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

Defined in: [types.ts:177](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L177)

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

Defined in: [types.ts:182](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L182)

Registrasi provider ini ke dalam sistem libxml2 virtual IO.

#### Returns

`any`

***

### cleanup()

> **cleanup**(): `void`

Defined in: [types.ts:187](https://github.com/ferdisap/xml-xsd_validator-browser/blob/974c6bdeb6c555b2350d781bd48d963dd5aed509/src/types.ts#L187)

Bersihkan provider dari sistem libxml2.

#### Returns

`void`
