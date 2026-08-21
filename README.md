# SNB-components

SNB-components is the optional shared-core project for the Summernote Bricks ecosystem.

## Current architecture

The repository preserves its historical root package while developing a **parallel v3 shared core**. The v3 line is intentionally small and is only for primitives that are genuinely reusable across multiple plugins.

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

`package.v3.json` defines the independent `3.0.0-rc.0` candidate:

```text
dist/index.js          ESM
dist/index.umd.cjs     CommonJS / browser artifact
dist/types/index.d.ts  TypeScript declarations
```

The candidate includes package `exports` for import/require/types and restricts package contents to distribution files plus public documentation.

The historical root package remains preserved by design. Source readiness of the wider ecosystem does not automatically authorize replacing or publishing this package line.

## Development and reproducibility

The v3 tooling has its own committed lockfile and permanent Node 22/24 validation gate:

```bash
cd v3-tooling
npm ci
npm run check
```

`npm run check` performs strict typechecking, Vitest tests, Vite/TypeScript builds and package-shape validation.

For contribution rules, package-boundary guidance, and release constraints, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Compatibility

SNB-components is a browser-library core rather than a standalone Summernote plugin, so it does not claim Summernote UI compatibility independently. Compatibility is proven by the concrete Heading/Gallery plugins and the central Bricks Playwright matrix across Summernote 0.9.1 BS3/BS4/BS5/Lite and Chromium/Firefox/WebKit.

## Architecture

See:

- `docs/V3.md` for the v3 contract;
- `docs/ADR-0001-v3-architecture.md` for the architecture decision and boundaries;
- `summernote-bricks` issue #3 for ecosystem release-readiness status.

## Historical package

The older components such as `LineBreak`, `ModalMode`, editable wrappers, validation and extension managers belong to the preserved historical package. They are not the architectural contract for new v3 plugins.

## License

MIT — see `LICENSE`.
