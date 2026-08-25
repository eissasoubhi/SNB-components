import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolingDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(toolingDir, 'dist');
const mapFiles = [
  'index.js.map',
  'index.umd.cjs.map',
  'types/index.d.ts.map',
  'types/brick.d.ts.map',
  'types/summernote.d.ts.map',
];

const absoluteWindowsPath = /^[A-Za-z]:[\\/]/;
const unsafeUrlSchemes = /^(?:file|https?):\/\//i;

for (const relativeMapPath of mapFiles) {
  const mapPath = path.join(distDir, relativeMapPath);
  const sourceMap = JSON.parse(await readFile(mapPath, 'utf8'));

  if (sourceMap.version !== 3) {
    throw new Error(`${relativeMapPath} must use source map version 3.`);
  }
  if (!Array.isArray(sourceMap.sources) || sourceMap.sources.length === 0) {
    throw new Error(`${relativeMapPath} must declare at least one source.`);
  }

  for (const source of sourceMap.sources) {
    if (
      typeof source !== 'string' ||
      path.posix.isAbsolute(source) ||
      absoluteWindowsPath.test(source) ||
      unsafeUrlSchemes.test(source)
    ) {
      throw new Error(`${relativeMapPath} contains a non-portable source reference: ${String(source)}`);
    }
  }

  if (typeof sourceMap.sourceRoot === 'string' && sourceMap.sourceRoot) {
    if (
      path.posix.isAbsolute(sourceMap.sourceRoot) ||
      absoluteWindowsPath.test(sourceMap.sourceRoot) ||
      unsafeUrlSchemes.test(sourceMap.sourceRoot)
    ) {
      throw new Error(`${relativeMapPath} contains a non-portable sourceRoot: ${sourceMap.sourceRoot}`);
    }
  }
}

console.log(`Verified ${mapFiles.length} public source maps contain only portable relative source references.`);
