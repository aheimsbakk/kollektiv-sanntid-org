---
when: 2026-02-28T17:05:17Z
why: Split 651-line monolithic options.js into focused single-responsibility modules
what: refactor(ui): decompose options.js into src/ui/options/ sub-modules (v1.31.3)
model: opencode/claude-sonnet-4-6
tags: [refactor, ui, options, srp, modules]
---

Decomposed `src/ui/options.js` (651 lines) into six focused ES modules under `src/ui/options/`: `settings-store.js` (localStorage load/save/validate/diff), `transport-modes.js` (checkbox table + toggle-all), `station-autocomplete.js` (debounced search + keyboard nav), `language-switcher.js` (flag buttons + in-place translation updates), `panel-lifecycle.js` (open/close/focus-trap/ESC/toast), and `index.js` (orchestrator, same public API). The old `src/ui/options.js` is retained as a 3-line re-export shim for backward compatibility; `src/app.js` updated to import from the new path; `src/sw.js` ASSETS list expanded with all six new module paths. Bumped to v1.31.3 (patch).
