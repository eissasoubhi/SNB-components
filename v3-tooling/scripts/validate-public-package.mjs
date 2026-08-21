import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const toolingDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(toolingDir, '..');
const stagedDir = path.join(toolingDir, '.public-package');

await rm(stagedDir, { recursive: true, force: true });
await mkdir(stagedDir, { recursive: true });

await cp(path.join(toolingDir, 'dist'), path.join(stagedDir, 'dist'), { recursive: true });
await cp(path.join(repoDir, 'README.md'), path.join(stagedDir, 'README.md'));
await cp(path.join(repoDir, 'LICENSE'), path.join(stagedDir, 'LICENSE'));
await writeFile(path.join(stagedDir, 'package.json'), await readFile(path.join(repoDir, 'package.v3.json')));

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: stagedDir,
  encoding: 'utf8',
});
const [pack] = JSON.parse(packOutput);
const files = new Set(pack.files.map(({ path: file }) => file));

const required = [
  'package.json',
  'README.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.umd.cjs',
  'dist/index.umd.cjs.map',
  'dist/types/index.d.ts',
  'dist/types/index.d.ts.map',
];
const missing = required.filter((file) => !files.has(file));
if (missing.length) {
  throw new Error(`Public v3 candidate is missing: ${missing.join(', ')}`);
}

const forbiddenPrefixes = ['src/', 'test/', 'tests/', 'v3-tooling/'];
const leaked = [...files].filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)));
if (leaked.length) {
  throw new Error(`Public v3 candidate leaks internal files: ${leaked.join(', ')}`);
}

const manifest = JSON.parse(await readFile(path.join(stagedDir, 'package.json'), 'utf8'));
if (manifest.name !== 'snb-components' || manifest.version !== '3.0.0-rc.0') {
  throw new Error(`Unexpected public package identity: ${manifest.name}@${manifest.version}`);
}
if (manifest.main !== './dist/index.umd.cjs' || manifest.module !== './dist/index.js' || manifest.types !== './dist/types/index.d.ts') {
  throw new Error('Public package entrypoints do not match the built artifacts.');
}
if (manifest.exports?.['.']?.import !== './dist/index.js' || manifest.exports?.['.']?.require !== './dist/index.umd.cjs' || manifest.exports?.['.']?.types !== './dist/types/index.d.ts') {
  throw new Error('Public package exports do not match the built artifacts.');
}

const publicExportNames = (value) => Object.keys(value ?? {})
  .filter((name) => name !== '__esModule' && name !== 'default')
  .sort();

const esm = await import(pathToFileURL(path.join(stagedDir, 'dist/index.js')).href);
const esmExports = publicExportNames(esm);
if (!esmExports.length) {
  throw new Error('Public ESM entrypoint has no exports.');
}

const require = createRequire(path.join(stagedDir, 'package.json'));
const cjs = require(path.join(stagedDir, 'dist/index.umd.cjs'));
const cjsExports = publicExportNames(cjs);
if (!cjsExports.length) {
  throw new Error('Public CommonJS entrypoint has no exports.');
}

const browserSandbox = {};
const umdSource = await readFile(path.join(stagedDir, 'dist/index.umd.cjs'), 'utf8');
vm.runInNewContext(umdSource, browserSandbox, { filename: 'index.umd.cjs' });
const browserGlobal = browserSandbox.SummernoteBricksCore;
const browserExports = publicExportNames(browserGlobal);
if (!browserExports.length) {
  throw new Error('Public UMD browser artifact did not expose the SummernoteBricksCore global.');
}

const expectedExports = JSON.stringify(esmExports);
for (const [format, names] of [['CommonJS', cjsExports], ['browser UMD', browserExports]]) {
  if (JSON.stringify(names) !== expectedExports) {
    throw new Error(
      `Public ${format} exports differ from ESM exports: ESM=${esmExports.join(', ')}; ${format}=${names.join(', ')}`,
    );
  }
}

// Runtime parity is not sufficient for a TypeScript package: every value that
// consumers can import at runtime must also be importable through the shipped
// declaration entrypoint. Compile a synthetic consumer against the staged
// declarations so a missing/renamed declaration fails the package gate.
const typeProbePath = path.join(stagedDir, 'type-contract-probe.ts');
const importedBindings = esmExports.map((name, index) => `${name} as export${index}`).join(', ');
const touchedBindings = esmExports.map((_, index) => `void export${index};`).join('\n');
await writeFile(
  typeProbePath,
  `import { ${importedBindings} } from './dist/types/index.js';\n${touchedBindings}\n`,
);

try {
  execFileSync(
    process.execPath,
    [
      path.join(toolingDir, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'ESNext',
      '--moduleResolution',
      'Bundler',
      typeProbePath,
    ],
    { cwd: stagedDir, stdio: 'pipe' },
  );
} catch (error) {
  const stdout = error?.stdout?.toString?.() ?? '';
  const stderr = error?.stderr?.toString?.() ?? '';
  throw new Error(`Public TypeScript declarations do not cover the runtime export surface.\n${stdout}${stderr}`);
} finally {
  await rm(typeProbePath, { force: true });
}

console.log(`Validated independent snb-components@${manifest.version} candidate (${files.size} files; ${esmExports.length} runtime exports covered by ESM/CommonJS/UMD and TypeScript declarations).`);
await rm(stagedDir, { recursive: true, force: true });
