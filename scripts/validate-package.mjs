import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const repoDir = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(path.join(repoDir, 'package.json'), 'utf8'));
if (manifest.name !== 'snb-components') throw new Error(`Unexpected package name: ${manifest.name}`);
if (typeof manifest.version !== 'string' || !/^3\.0\.0(?:-rc\.\d+)?$/.test(manifest.version)) {
  throw new Error(`Unexpected package version: ${manifest.version}`);
}
for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies', 'bundledDependencies', 'bundleDependencies']) {
  const value = manifest[field];
  if (Array.isArray(value) ? value.length : value && typeof value === 'object' && Object.keys(value).length) {
    throw new Error(`Core must remain dependency-free at runtime: ${field}`);
  }
}
for (const script of ['preinstall', 'install', 'postinstall', 'prepublish', 'prepublishOnly', 'prepack', 'postpack', 'prepare']) {
  if (Object.hasOwn(manifest.scripts ?? {}, script)) throw new Error(`Unsafe npm lifecycle hook: ${script}`);
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'snb-components-package-'));
const firstDir = path.join(tempRoot, 'first');
const secondDir = path.join(tempRoot, 'second');
const consumerDir = path.join(tempRoot, 'consumer');
await Promise.all([mkdir(firstDir), mkdir(secondDir), mkdir(consumerDir)]);

const packInto = (dir) => JSON.parse(execFileSync(
  'npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', dir],
  { cwd: repoDir, encoding: 'utf8' },
))[0];

try {
  const first = packInto(firstDir);
  const second = packInto(secondDir);
  const files = new Set(first.files.map(({ path: file }) => file));
  const required = [
    'package.json', 'README.md', 'LICENSE',
    'dist/index.js', 'dist/index.js.map',
    'dist/index.umd.cjs', 'dist/index.umd.cjs.map',
    'dist/types/index.d.ts', 'dist/types/index.d.ts.map', 'dist/types/index.d.cts',
    'dist/types/brick.d.ts', 'dist/types/brick.d.ts.map', 'dist/types/brick.d.cts',
    'dist/types/summernote.d.ts', 'dist/types/summernote.d.ts.map', 'dist/types/summernote.d.cts',
  ];
  const missing = required.filter((file) => !files.has(file));
  if (missing.length) throw new Error(`Package is missing: ${missing.join(', ')}`);
  const unexpected = [...files].filter((file) => !required.includes(file));
  if (unexpected.length) throw new Error(`Package contains unexpected files: ${unexpected.join(', ')}`);

  const firstTarball = path.join(firstDir, first.filename);
  const secondTarball = path.join(secondDir, second.filename);
  const [firstBytes, secondBytes] = await Promise.all([readFile(firstTarball), readFile(secondTarball)]);
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
  if (sha256(firstBytes) !== sha256(secondBytes)) throw new Error('Repeated npm pack output is not reproducible.');
  const actualShasum = createHash('sha1').update(firstBytes).digest('hex');
  const actualIntegrity = `sha512-${createHash('sha512').update(firstBytes).digest('base64')}`;
  if (first.shasum !== actualShasum || first.integrity !== actualIntegrity) throw new Error('npm pack integrity metadata differs from exact tarball bytes.');

  for (const mapName of ['index.js.map', 'index.umd.cjs.map']) {
    const map = JSON.parse(await readFile(path.join(repoDir, 'dist', mapName), 'utf8'));
    for (const source of map.sources ?? []) {
      if (path.isAbsolute(source) || /^[A-Za-z]:[\\/]/.test(source) || source.includes('src/v3') || source.includes('v3-tooling')) {
        throw new Error(`Non-portable sourcemap source in ${mapName}: ${source}`);
      }
    }
  }

  const publicNames = (value) => Object.keys(value ?? {}).filter((key) => key !== 'default' && key !== '__esModule').sort();
  const esm = await import(`${pathToFileURL(path.join(repoDir, 'dist/index.js')).href}?check=${Date.now()}`);
  const esmNames = publicNames(esm);
  if (!esmNames.length) throw new Error('ESM entrypoint has no exports.');
  const require = createRequire(import.meta.url);
  const cjsNames = publicNames(require(path.join(repoDir, 'dist/index.umd.cjs')));
  const sandbox = {};
  vm.runInNewContext(await readFile(path.join(repoDir, 'dist/index.umd.cjs'), 'utf8'), sandbox, { filename: 'index.umd.cjs' });
  const browserNames = publicNames(sandbox.SummernoteBricksCore);
  const expected = JSON.stringify(esmNames);
  if (JSON.stringify(cjsNames) !== expected || JSON.stringify(browserNames) !== expected) throw new Error('ESM/CommonJS/UMD export surfaces differ.');

  await writeFile(path.join(consumerDir, 'package.json'), '{"name":"snb-core-consumer","private":true,"type":"module"}\n');
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock', firstTarball], { cwd: consumerDir, stdio: 'pipe' });
  const installedManifest = JSON.parse(await readFile(path.join(consumerDir, 'node_modules/snb-components/package.json'), 'utf8'));
  if (installedManifest.version !== manifest.version) throw new Error(`Clean consumer installed ${installedManifest.version}; expected ${manifest.version}.`);

  const bindings = esmNames.map((name, index) => `${name} as value${index}`).join(', ');
  const touches = esmNames.map((_, index) => `void value${index};`).join('\n');
  const probe = `import { ${bindings} } from 'snb-components';\n${touches}\n`;
  const tsc = path.join(repoDir, 'node_modules/typescript/bin/tsc');
  for (const testCase of [
    { file: 'probe.mts', module: 'NodeNext', resolution: 'NodeNext' },
    { file: 'probe.cts', module: 'Node16', resolution: 'Node16' },
  ]) {
    const probePath = path.join(consumerDir, testCase.file);
    await writeFile(probePath, probe);
    execFileSync(process.execPath, [tsc, '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', '--module', testCase.module, '--moduleResolution', testCase.resolution, probePath], { cwd: consumerDir, stdio: 'pipe' });
  }

  console.log(`Validated ${manifest.name}@${manifest.version}: exact, reproducible, portable tarball with matching ESM/CommonJS/UMD and TypeScript exports.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
