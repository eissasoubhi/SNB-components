import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const toolingDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(toolingDir, '..');
const workDir = path.join(toolingDir, '.pack-reproducibility');
const fingerprintOutput = process.env.PACK_FINGERPRINT_OUT
  ? path.resolve(toolingDir, process.env.PACK_FINGERPRINT_OUT)
  : undefined;
const tarballOutput = process.env.PACK_TARBALL_OUT
  ? path.resolve(toolingDir, process.env.PACK_TARBALL_OUT)
  : undefined;

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function packCandidate(name) {
  const stagedDir = path.join(workDir, `${name}-staged`);
  const tarballDir = path.join(workDir, `${name}-tarball`);
  await mkdir(stagedDir, { recursive: true });
  await mkdir(tarballDir, { recursive: true });

  await cp(path.join(toolingDir, 'dist'), path.join(stagedDir, 'dist'), { recursive: true });
  await cp(path.join(repoDir, 'README.md'), path.join(stagedDir, 'README.md'));
  await cp(path.join(repoDir, 'LICENSE'), path.join(stagedDir, 'LICENSE'));
  await writeFile(path.join(stagedDir, 'package.json'), await readFile(path.join(repoDir, 'package.v3.json')));

  const [pack] = JSON.parse(execFileSync(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', tarballDir],
    { cwd: stagedDir, encoding: 'utf8' },
  ));
  const tarballPath = path.join(tarballDir, pack.filename);
  const bytes = await readFile(tarballPath);

  return {
    filename: pack.filename,
    shasum: pack.shasum,
    integrity: pack.integrity,
    sha256: sha256(bytes),
    bytes: bytes.length,
    tarballPath,
  };
}

await rm(workDir, { recursive: true, force: true });
await mkdir(workDir, { recursive: true });

try {
  const first = await packCandidate('first');
  const second = await packCandidate('second');

  for (const field of ['filename', 'shasum', 'integrity', 'sha256', 'bytes']) {
    if (first[field] !== second[field]) {
      throw new Error(
        `Repeated npm pack output is not reproducible for ${field}: first=${first[field]}; second=${second[field]}`,
      );
    }
  }

  if (fingerprintOutput) {
    const manifest = JSON.parse(await readFile(path.join(repoDir, 'package.v3.json'), 'utf8'));
    const fingerprint = {
      package: manifest.name,
      version: manifest.version,
      filename: first.filename,
      shasum: first.shasum,
      integrity: first.integrity,
      sha256: first.sha256,
      bytes: first.bytes,
      node: process.version,
      npm: execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim(),
    };
    await writeFile(fingerprintOutput, `${JSON.stringify(fingerprint, null, 2)}\n`);
  }

  if (tarballOutput) {
    await copyFile(first.tarballPath, tarballOutput);
  }

  console.log(
    `Verified repeatable npm tarball ${first.filename} (${first.bytes} bytes; sha256=${first.sha256}).`,
  );
} finally {
  await rm(workDir, { recursive: true, force: true });
}
