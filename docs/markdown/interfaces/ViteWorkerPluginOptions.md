[**xml-xsd-validator-browser v1.0.9**](../README.md)

***

[xml-xsd-validator-browser](../globals.md) / ViteWorkerPluginOptions

# Interface: ViteWorkerPluginOptions

Defined in: [plugins/viteWorkerPlugin.ts:7](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/plugins/viteWorkerPlugin.ts#L7)

Opsi plugin untuk membangun worker

## Properties

### outDir?

> `optional` **outDir**: `string`

Defined in: [plugins/viteWorkerPlugin.ts:9](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/plugins/viteWorkerPlugin.ts#L9)

Folder keluaran worker (default: "dist")

***

### pattern?

> `optional` **pattern**: `RegExp`

Defined in: [plugins/viteWorkerPlugin.ts:11](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/plugins/viteWorkerPlugin.ts#L11)

Pola pencocokan import (default: /\?worker$/)

***

### minify?

> `optional` **minify**: `boolean`

Defined in: [plugins/viteWorkerPlugin.ts:13](https://github.com/ferdisap/xml-xsd_validator-browser/blob/97294ff0e0d3eed6a1704787eb3745d48e5b210f/src/plugins/viteWorkerPlugin.ts#L13)

Apakah worker perlu di-minify (default: false)
