---
when: 2026-02-28T15:46:56Z
why: Split monolithic entur.js into focused single-responsibility modules for maintainability
what: Refactor src/entur.js into src/entur/ directory with 6 focused modules + index facade
model: opencode/claude-sonnet-4-6
tags: [refactor, entur, srp, modules]
---

Deleted `src/entur.js` (678 lines) and replaced it with `src/entur/` containing `modes.js` (mode mapping), `parser.js` (pure response parser), `query.js` (GraphQL query builder), `http.js` (network transport), `departures.js` (fetch orchestration), `geocoder.js` (stop lookup + autocomplete), and `index.js` (public re-export facade). Updated import paths in `src/app.js`, `src/ui/options.js`, `src/sw.js` (asset cache list), and all 12 test files. Zero breaking changes to the public API. Bumped to v1.31.1.
