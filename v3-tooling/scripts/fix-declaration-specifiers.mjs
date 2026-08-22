import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const typesDir = path.resolve(import.meta.dirname, '../dist/types');
const files = await readdir(typesDir, { recursive: true });

for (const relative of files) {
  if (!relative.endsWith('.d.ts')) continue;

  const file = path.join(typesDir, relative);
  const source = await readFile(file, 'utf8');
  const rewritten = source.replace(
    /(from\s+['"]|import\s*\(\s*['"])(\.\.?\/[^'"]+?)(['"])/g,
    (match, prefix, specifier, suffix) => {
      if (/\.(?:[cm]?js|json|node)$/.test(specifier)) return match;
      return `${prefix}${specifier}.js${suffix}`;
    },
  );

  if (rewritten !== source) await writeFile(file, rewritten);
}
