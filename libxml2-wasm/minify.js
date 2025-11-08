const esbuild = require('esbuild');
const glob = require('glob');
const fs = require('fs/promises');
const path = require('path');

(async () => {
  const files = glob.sync('libxml2-wasm/**/*.mjs', { nodir: true });

  for (const file of files) {
    const tempFile = file + '.tmp.js';

    // Build minify ke file sementara
    await esbuild.build({
      entryPoints: [file],
      outfile: tempFile,
      bundle: false,
      minify: true,
      format: 'esm',
      platform: 'neutral',
    });

    // Ganti file asli dengan file minify
    await fs.rename(tempFile, file);

    console.log(`✅ Minified (overwrite): ${file}`);
  }
})();
