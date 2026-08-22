import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const typesDir = path.resolve(import.meta.dirname, '../dist/types');
const files = await readdir(typesDir, { recursive: true });
const declarationFiles = files.filter((relative) => relative.endsWith('.d.ts'));

const rewriteSpecifiers = (source, extension) => source.replace(
  /(from\s+['"]|import\s*\(\s*['"])(\.\.?\/[^'"]+?)(['"])/g,
  (match, prefix, specifier, suffix) => {
    if (/\.(?:[cm]?js|json|node)$/.test(specifier)) return match;
    return `${prefix}${specifier}${extension}${suffix}`;
  },
);

for (const relative of declarationFiles) {
  const file = path.join(typesDir, relative);
  const source = await readFile(file, 'utf8');
  await writeFile(file, rewriteSpecifiers(source, '.js'));

  const ctsFile = file.replace(/\.d\.ts$/, '.d.cts');
  await writeFile(ctsFile, rewriteSpecifiers(source, '.cjs'));
}
