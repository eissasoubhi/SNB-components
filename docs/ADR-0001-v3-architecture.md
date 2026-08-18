# ADR 0001 — Summernote Bricks v3 architecture

Status: Accepted for the v3 development line

## Context

The current ecosystem grew around reusable TypeScript classes, React-powered JSX templates and Bootstrap-oriented modal markup. That made sense as an incremental evolution of the original plugins, but it is not the architecture we want to freeze for the next major version.

The product is a set of plugins for **Summernote**. Summernote already owns the editor lifecycle, toolbar registry, dialog abstraction, history/undo integration and UI variants. Reimplementing those concerns in a parallel framework increases coupling and makes Bootstrap/Lite compatibility harder than necessary.

The v3 line therefore starts from Summernote's public extension contracts rather than from the existing SNB class hierarchy.

## Product constraints

1. A brick must remain useful as a standalone Summernote plugin.
2. Persisted editor HTML is a public API and may live in databases for years.
3. Persisted HTML must render without the plugin JavaScript being present.
4. Editor-only controls must not leak into persisted content.
5. The runtime must not force React, Vue, Tailwind or another application framework on host applications.
6. The runtime must not depend directly on Bootstrap. Summernote's own UI abstraction is the compatibility boundary.
7. Multiple Summernote editors on one page must not share mutable plugin state.
8. Create/edit/remove operations must participate in Summernote history and change events.
9. Accessibility and keyboard behavior are release criteria.

## Summernote compatibility target

The first v3 target is Summernote **0.9.x**, with 0.9.1 as the reference release.

Compatibility is tested against Summernote interfaces rather than inferred from upstream support claims:

- `summernote-bs5`
- `summernote-lite`
- `summernote-bs4`
- `summernote-bs3`

The fast pull-request matrix may run BS5 + Lite. BS4 + BS3 can run in the full release matrix if CI cost becomes material.

No 0.8.x compatibility promise is made until it passes the same browser suite. If retained later, it is a deliberate compatibility layer rather than an accidental side effect.

## UI integration

Plugins use Summernote's own UI APIs:

- `$.summernote.ui.button`
- `$.summernote.ui.buttonGroup`
- `$.summernote.ui.dropdown`
- `$.summernote.ui.dialog`
- `$.summernote.ui.showDialog`
- `$.summernote.ui.hideDialog`
- `$.summernote.ui.onDialogShown`
- `$.summernote.ui.onDialogHidden`

This is the key architectural boundary. Concrete bricks do not call Bootstrap modal APIs and do not ship Bootstrap markup as their integration contract.

The Summernote plugin lifecycle (`initialize`, `destroy`, `context.memo`, `context.invoke`) owns setup and teardown.

## Runtime stack

### Language

**TypeScript, strict mode.**

The public surface is intentionally small and typed. `any` is allowed only at the narrow boundary where Summernote's historical typings are incomplete; it must not spread through brick domain code.

### Rendering

**Native DOM + Summernote UI renderers. No React/Vue runtime.**

Persistent brick markup is created with DOM APIs or small pure render helpers. Modal chrome is created by Summernote UI. This keeps the bundle small and avoids framework/version conflicts with host applications.

### Styling

Small namespaced CSS files and CSS custom properties where customization is needed.

Do not ship Tailwind or Bootstrap utility classes as a public persistence contract. Host applications may use any CSS stack.

### Build

**Vite library mode.**

Target outputs:

- ESM for modern bundlers;
- IIFE/UMD-compatible browser artifact for script-tag users;
- generated type declarations.

`jquery` and `summernote` are host/peer concerns and must not be duplicated into plugin bundles.

### Unit tests

**Vitest.**

Unit tests cover pure brick parsing/rendering, options normalization, data adapters and migration helpers.

### Browser/integration tests

**Playwright.**

The browser suite is authoritative for Summernote lifecycle and compatibility. It covers Chromium, Firefox and WebKit plus the Summernote UI variants listed above.

### Package manager

The existing repositories may keep npm during the transition. If/when the ecosystem moves to a source monorepo, use **pnpm workspaces** for one lockfile and independent packages.

Do not force a monorepo before v3 contracts are proven. `summernote-gallery` already has public history, users, forks and stars; repository identity has product value even if source ownership is consolidated later.

## Core scope

The v3 core is deliberately smaller than the current `snb-components` package.

It may own:

- brick metadata constants and parsing;
- clean create/update/remove helpers;
- Summernote context typings/adapters where upstream typings are insufficient;
- editor-only selection/enhancement helpers;
- history-safe mutation helpers;
- migration helpers for legacy persisted markup;
- small shared accessibility helpers.

It must **not** own:

- concrete Heading/Gallery forms;
- concrete templates;
- Bootstrap-specific modal adapters;
- generic application validation frameworks;
- a second event bus when Summernote/DOM events already solve the problem;
- a class hierarchy that every brick must inherit from.

Prefer composition and plain functions over inheritance.

## Persistent brick contract

New v3 markup uses explicit metadata:

```html
<div class="snb-brick snb-heading" data-snb-brick="heading" data-snb-version="3">
  <h2>Semantic title</h2>
  <p class="snb-heading__subtitle">Optional subtitle</p>
</div>
```

Rules:

- `data-snb-brick` identifies the brick type;
- `data-snb-version` identifies its persisted schema version;
- meaningful content stays in semantic HTML, not an opaque JSON blob;
- editor-only controls are not persisted;
- inline `<style>` blocks are not generated per brick;
- IDs are optional and only emitted when they have content meaning (for example a heading anchor), not as runtime bookkeeping.

Legacy markup remains readable through migration/parsing helpers. It is not rewritten silently just because an editor opens it.

## Plugin shape

A v3 plugin is a normal Summernote plugin. Conceptually:

```ts
registerPlugin('summernoteHeading', (context) => {
  context.memo('button.summernoteHeading', () => createButton(context))

  return {
    initialize() {},
    destroy() {},
  }
})
```

The exact helper signature may evolve during the Heading proof of concept. We intentionally avoid publishing a large `BrickDefinition` framework before two independent bricks prove the common contract.

## Aggregator (`summernote-bricks`)

The aggregator remains optional. It groups already registered Summernote buttons and provides ecosystem UX; it does not instantiate concrete bricks or own their lifecycle.

A third-party Summernote plugin should be composable without importing `summernote-bricks` internals.

## Release gate

A v3 package is not stable until all of these are green:

1. strict TypeScript;
2. unit tests;
3. package/export smoke test;
4. `npm pack` artifact validation;
5. standalone browser test;
6. composed Bricks browser test where relevant;
7. multiple-editor isolation;
8. destroy/recreate lifecycle;
9. persisted HTML round trip;
10. supported Summernote UI compatibility matrix.

## Migration strategy

The rewrite is developed in parallel with the current major versions.

1. Build the small v3 core.
2. Implement Heading v3 as the first proof because its domain is small.
3. Adjust the core only when Heading exposes a real missing primitive.
4. Implement Gallery v3 independently.
5. Remove any core API that only one brick needed and belongs locally.
6. Add the Bricks composer against the two proven plugins.
7. Add legacy markup readers/migration guidance.
8. Publish release candidates before replacing stable majors.

This is a greenfield implementation with backward-compatibility planning, not an in-place rewrite of stored user content.