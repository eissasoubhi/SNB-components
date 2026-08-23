import { readFile } from 'node:fs/promises';
import path from 'node:path';

const toolingDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(toolingDir, '..');
const manifestPath = path.join(repoDir, 'package.v3.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const installLifecycleScripts = [
  'preinstall',
  'install',
  'postinstall',
  'prepublish',
  'prepublishOnly',
  'prepack',
  'postpack',
  'prepare',
];

const declaredScripts = manifest.scripts ?? {};
const unsafeScripts = installLifecycleScripts.filter((name) => Object.hasOwn(declaredScripts, name));

if (unsafeScripts.length) {
  throw new Error(
    `Public v3 candidate must not execute npm lifecycle hooks: ${unsafeScripts.join(', ')}`,
  );
}

const bundledDependencyFields = ['bundledDependencies', 'bundleDependencies'];
const declaredBundledDependencyFields = bundledDependencyFields.filter((name) =>
  Object.hasOwn(manifest, name),
);

if (declaredBundledDependencyFields.length) {
  throw new Error(
    `Public v3 candidate must not embed bundled dependencies: ${declaredBundledDependencyFields.join(', ')}`,
  );
}

if (Object.hasOwn(manifest, 'bin')) {
  throw new Error('Public v3 candidate must not install command-line executables via the npm bin field.');
}

console.log(
  'Verified public v3 candidate has no npm install/publish lifecycle hooks, bundled dependencies, or bin executables.',
);
