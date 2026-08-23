import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const toolingDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(toolingDir, '..');
const stagedDir = path.join(toolingDir, '.public-package');
const tarballDir = path.join(toolingDir, '.public-tarball');
const consumerDir = path.join(toolingDir, '.public-consumer');

await Promise.all([
  rm(stagedDir, { recursive: true, force: true }),
  rm(tarballDir, { recursive: true, force: true }),
  rm(consumerDir, { recursive: true, force: true }),
]);
await Promise.all([mkdir(stagedDir, { recursive: true }), mkdir(tarballDir, { recursive: true })]);

await cp(path.join(toolingDir, 'dist'), path.join(stagedDir, 'dist'), { recursive: true });
await cp(path.join(repoDir, 'README.md'), path.join(stagedDir, 'README.md'));
await cp(path.join(repoDir, 'LICENSE'), path.join(stagedDir, 'LICENSE'));
await writeFile(path.join(stagedDir, 'package.json'), await readFile(path.join(repoDir, 'package.v3.json')));

const packOutput = execFileSync(
  'npm',
  ['pack', '--json', '--ignore-scripts', '--pack-destination', tarballDir],
  { cwd: stagedDir, encoding: 'utf8' },
);
const [pack] = JSON.parse(packOutput);
const files = new Set(pack.files.map(({ path: file }) => file));
const tarballPath = path.join(tarballDir, pack.filename);
const tarballBytes = await readFile(tarballPath);
const actualShasum = createHash('sha1').update(tarballBytes).digest('hex');
const actualIntegrity = `sha512-${createHash('sha512').update(tarballBytes).digest('base64')}`;
if (pack.shasum !== actualShasum) {
  throw new Error(`npm pack shasum does not match the exact tarball bytes: reported=${pack.shasum}; actual=${actualShasum}`);
}
if (pack.integrity !== actualIntegrity) {
  throw new Error(`npm pack integrity does not match the exact tarball bytes: reported=${pack.integrity}; actual=${actualIntegrity}`);
}

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
  'dist/types/index.d.cts',
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

const unexpected = [...files].filter((file) => !required.includes(file)).sort();
if (unexpected.length) {
  throw new Error(
    `Public v3 candidate contains unexpected packed files outside the reviewed allowlist: ${unexpected.join(', ')}`,
  );
}

const manifest = JSON.parse(await readFile(path.join(stagedDir, 'package.json'), 'utf8'));
if (manifest.name !== 'snb-components' || manifest.version !== '3.0.0-rc.0') {
  throw new Error(`Unexpected public package identity: ${manifest.name}@${manifest.version}`);
}
if (manifest.main !== './dist/index.umd.cjs' || manifest.module !== './dist/index.js' || manifest.types !== './dist/types/index.d.ts') {
  throw new Error('Public package entrypoints do not match the built artifacts.');
}
const rootExport = manifest.exports?.['.'];
if (
  rootExport?.import?.types !== './dist/types/index.d.ts' ||
  rootExport?.import?.default !== './dist/index.js' ||
  rootExport?.require?.types !== './dist/types/index.d.cts' ||
  rootExport?.require?.default !== './dist/index.umd.cjs'
) {
  throw new Error('Public package conditional exports do not match the built runtime and declaration artifacts.');
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

// Validate the artifact consumers will actually receive, not only the staged
// directory used to create it. Install the exact npm-pack tarball into a clean
// project and resolve the package through its public ESM/CommonJS exports.
await mkdir(consumerDir, { recursive: true });
await writeFile(path.join(consumerDir, 'package.json'), '{"name":"snb-components-v3-consumer","private":true,"type":"module"}\n');
execFileSync(
  'npm',
  ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock', tarballPath],
  { cwd: consumerDir, stdio: 'pipe' },
);

const installedManifest = JSON.parse(
  await readFile(path.join(consumerDir, 'node_modules/snb-components/package.json'), 'utf8'),
);
if (installedManifest.version !== manifest.version) {
  throw new Error(`Clean consumer installed ${installedManifest.version}; expected ${manifest.version}.`);
}
const consumerEsmExports = JSON.parse(execFileSync(
  process.execPath,
  ['--input-type=module', '--eval', "import('snb-components').then(m => console.log(JSON.stringify(Object.keys(m).filter(k => k !== 'default').sort())))"],
  { cwd: consumerDir, encoding: 'utf8' },
).trim());
const consumerCjsExports = JSON.parse(execFileSync(
  process.execPath,
  ['--input-type=commonjs', '--eval', "console.log(JSON.stringify(Object.keys(require('snb-components')).filter(k => k !== '__esModule' && k !== 'default').sort()))"],
  { cwd: consumerDir, encoding: 'utf8' },
).trim());
for (const [format, names] of [['installed ESM', consumerEsmExports], ['installed CommonJS', consumerCjsExports]]) {
  if (JSON.stringify(names) !== expectedExports) {
    throw new Error(`Public ${format} exports differ from staged ESM exports.`);
  }
}

// Every runtime value must also be importable through the declarations reached
// by normal package resolution from the clean consumer installation.
const typeProbePath = path.join(consumerDir, 'type-contract-probe.ts');
const importedBindings = esmExports.map((name, index) => `${name} as export${index}`).join(', ');
const touchedBindings = esmExports.map((_, index) => `void export${index};`).join('\n');
await writeFile(typeProbePath, `import { ${importedBindings} } from 'snb-components';\n${touchedBindings}\n`);

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
    { cwd: consumerDir, stdio: 'pipe' },
  );
} catch (error) {
  const stdout = error?.stdout?.toString?.() ?? '';
  const stderr = error?.stderr?.toString?.() ?? '';
  throw new Error(`Installed TypeScript declarations do not cover the runtime export surface.\n${stdout}${stderr}`);
}

console.log(`Validated exact tarball for independent snb-components@${manifest.version} (${files.size} files; ${esmExports.length} exports covered by staged and installed ESM/CommonJS, browser UMD, TypeScript declarations, and npm tarball integrity metadata).`);
await Promise.all([
  rm(stagedDir, { recursive: true, force: true }),
  rm(tarballDir, { recursive: true, force: true }),
  rm(consumerDir, { recursive: true, force: true }),
]);