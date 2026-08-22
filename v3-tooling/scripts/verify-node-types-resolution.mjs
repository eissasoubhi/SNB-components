import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const toolingDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(toolingDir, '..');
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'snb-components-node-types-'));
const stagingDir = path.join(tempRoot, 'package');
const consumerDir = path.join(tempRoot, 'consumer');

try {
  await mkdir(stagingDir, { recursive: true });
  await mkdir(consumerDir, { recursive: true });
  await cp(path.join(toolingDir, 'dist'), path.join(stagingDir, 'dist'), { recursive: true });
  await cp(path.join(repoDir, 'README.md'), path.join(stagingDir, 'README.md'));
  await cp(path.join(repoDir, 'LICENSE'), path.join(stagingDir, 'LICENSE'));
  await writeFile(path.join(stagingDir, 'package.json'), await readFile(path.join(repoDir, 'package.v3.json')));

  const pack = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts'], {
    cwd: stagingDir,
    encoding: 'utf8',
  }))[0];
  const tarball = path.join(stagingDir, pack.filename);

  await writeFile(path.join(consumerDir, 'package.json'), '{"name":"node-types-consumer","private":true,"type":"module"}\n');
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock', tarball], {
    cwd: consumerDir,
    stdio: 'pipe',
  });

  const manifest = JSON.parse(await readFile(path.join(consumerDir, 'node_modules/snb-components/package.json'), 'utf8'));
  const runtimeExports = JSON.parse(execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', "import('snb-components').then(m => console.log(JSON.stringify(Object.keys(m).filter(k => k !== 'default').sort())))"],
    { cwd: consumerDir, encoding: 'utf8' },
  ).trim());
  if (!runtimeExports.length) throw new Error('Installed package has no public ESM exports for TypeScript resolution probes.');

  const bindings = runtimeExports.map((name, index) => `${name} as value${index}`).join(', ');
  const touches = runtimeExports.map((_, index) => `void value${index};`).join('\n');
  const probe = `import { ${bindings} } from 'snb-components';\n${touches}\n`;
  const cases = [
    { file: 'probe.mts', module: 'NodeNext', resolution: 'NodeNext' },
    { file: 'probe.cts', module: 'Node16', resolution: 'Node16' },
  ];

  const tsc = path.join(toolingDir, 'node_modules/typescript/bin/tsc');
  for (const testCase of cases) {
    const probePath = path.join(consumerDir, testCase.file);
    await writeFile(probePath, probe);
    execFileSync(process.execPath, [
      tsc,
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      testCase.module,
      '--moduleResolution',
      testCase.resolution,
      probePath,
    ], { cwd: consumerDir, stdio: 'pipe' });
  }

  console.log(`Verified ${manifest.name}@${manifest.version} declarations through TypeScript NodeNext ESM and Node16 CommonJS package resolution.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
