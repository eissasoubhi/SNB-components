# SNB-components

SNB-components is the optional shared-core project for the Summernote Bricks ecosystem.

## Current architecture

V3 is the maintained product line and now lives directly at the repository root. The shared core is intentionally small and is only for primitives that are genuinely reusable across multiple plugins.

Heading and Gallery currently **do not depend on SNB-components v3**. Do not add coupling merely to synchronize package versions; concrete plugins should consume the core only when shared runtime value is demonstrated.

## v3 scope

SNB-components v3 provides:

- semantic/versioned brick metadata helpers;
- DOM lookup and parsing helpers;
- narrow Summernote context integration helpers;
- history-safe DOM mutation helpers.

It deliberately does **not** own:

- plugin-specific dialogs or UI;
- Heading/Gallery rendering or validation;
- image/source loading;
- Bootstrap behavior;
- concrete plugin lifecycle.

## Runtime contract

- native DOM;
- strict TypeScript;
- no React or Vue runtime;
- no direct Bootstrap dependency;
- no bundled jQuery or Summernote runtime dependency;
- no host peer dependency while the core remains independent of jQuery/Summernote imports.

Concrete plugins declare their own host peer ranges.

## v3 package candidate

The root `package.json` defines the independent `3.0.0-rc.0` candidate:

```text
dist/index.js           ESM
dist/index.umd.cjs      CommonJS / browser artifact
dist/types/index.d.ts   ESM TypeScript declarations
dist/types/index.d.cts  CommonJS TypeScript declarations
```

The candidate uses conditional package `exports` so ESM imports resolve with the `.d.ts` declarations and CommonJS `require()` consumers resolve with the `.d.cts` declarations. The package gate validates the exact packed tarball through normal NodeNext/ESM and Node16/CommonJS TypeScript package resolution in addition to the runtime ESM/CommonJS/browser checks.

Package contents remain restricted to distribution files plus public documentation.

Repository history is preserved, but there is no longer a maintained parallel `package.v3.json` / `v3-tooling` product line. Publication remains independent from Bricks/Heading/Gallery and requires SNB-components' own release workflow and gates.

## Development and reproducibility

The committed root lockfile and permanent Node 22/24 validation gate are authoritative:

```bash
npm ci
npm run check
```

`npm run check` performs strict typechecking, Vitest tests, Vite/TypeScript builds, package-shape validation, exact-tarball consumer checks, and Node package-resolution checks for the shipped declarations.

The independent release-readiness workflow additionally verifies package/lock identity, packs the exact candidate, records SHA-256 and size evidence, and archives the artifact without authorizing publication.

For contribution rules, package-boundary guidance, and release constraints, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Compatibility

SNB-components is a browser-library core rather than a standalone Summernote plugin, so it does not claim Summernote UI compatibility independently. Compatibility is proven by the concrete Heading/Gallery plugins and the central Bricks Playwright matrix across Summernote 0.9.1 BS3/BS4/BS5/Lite and Chromium/Firefox/WebKit.

## Architecture

See:

- `docs/V3.md` for the v3 contract;
- `docs/ADR-0001-v3-architecture.md` for the architecture decision and boundaries;
- `summernote-bricks` issue #3 for ecosystem release-readiness status.

## Historical continuity

Older components such as `LineBreak`, `ModalMode`, editable wrappers, validation and extension managers remain part of repository history, but they are not the architectural contract for the maintained v3 shared core.

## License

MIT — see `LICENSE`.