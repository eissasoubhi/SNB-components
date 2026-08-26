# Contributing to SNB-components

SNB-components is an independent optional shared-core project for the Summernote Bricks ecosystem. Changes should add reusable value without forcing Heading, Gallery, or Bricks to depend on this repository.

## Development

V3 is the maintained product line and lives directly at the repository root. The former parallel `v3-tooling` / `package.v3.json` layout is no longer maintained.

Repository history and existing public package/repository identity must remain intact, but new work should target the root v3 implementation rather than recreate a parallel product tree.

```bash
npm ci
npm run check
```

The root V3 gate covers strict TypeScript, tests, build output, declarations, package-shape validation, exact-tarball consumer checks, and package-resolution checks on the committed lockfile. CI runs this contract on the supported Node matrix.

## Architecture rules

A change belongs in the shared core only when it is genuinely reusable across multiple plugins. Keep plugin-specific rendering, dialogs, validation, source loading, Bootstrap behavior, and concrete Summernote lifecycle logic inside the concrete plugin repositories.

Prefer narrow DOM and editor-integration helpers over framework abstractions. Do not add React, Vue, Bootstrap, jQuery, or Summernote runtime coupling to the V3 core unless a concrete cross-plugin requirement proves it is necessary.

See `docs/V3.md` and `docs/ADR-0001-v3-architecture.md` before changing public V3 contracts.

## Tests and compatibility

Pure shared-core behavior needs focused unit coverage. A change that affects how concrete plugins interact with Summernote must also be validated in the relevant Heading/Gallery repository and, when composition is affected, in the central Bricks browser matrix.

Do not claim independent Summernote UI compatibility from this repository alone; SNB-components is a library core, not a standalone editor plugin.

## Pull requests

Keep PRs small and independent. Rebase or synchronize with `main` before merge when `main` has advanced. Merge only when the relevant CI is green on the exact head.

Call out any change to exported functions, persisted brick metadata, DOM mutation semantics, package entrypoints, or dependency direction. Keep incomplete or architecture-sensitive work as draft.

## Releases

SNB-components is not part of the coordinated Bricks/Heading/Gallery publication workflow. Source readiness elsewhere does not authorize publishing this package.

Its independent release-readiness workflow verifies package/lock identity, the full package gate, the exact npm tarball and recorded digest evidence, but that evidence explicitly does not authorize publication.

Do not publish npm packages, tags, or GitHub Releases for SNB-components until a separate explicit release workflow has been implemented, validated against its own public-head/reproducibility evidence, and the maintainer's release conditions are satisfied.