---
when: 2026-02-26T17:58:25Z
why: Refactor the full codebase to comply with agents/RULES.md — remove debug artefacts, fix undefined references, and eliminate antipatterns
what: Rules-compliance refactor of src/entur.js, src/app.js, and all src/ui/* modules; version bumped to 1.30.6
model: github-copilot/claude-sonnet-4.6
tags: [refactor, cleanup, rules-compliance, debug-removal]
---

Refactored `src/entur.js` (removed `globalThis._enturCache`, `console.debug` calls, dead `liveFetchSucceeded`, duplicate validation), `src/app.js` (removed `window.__APP_OPTIONS__`/`__GLOBAL_BUTTONS__` globals, deduplicated `onApply` logic, removed unused state), `src/ui/ui.js` (removed debug panel `<pre>` element and `setDebug` helper), `src/ui/departure.js` (fixed `ReferenceError` on undefined `_seenRawSignatures` and `normalize()`, dropped `console.warn` for missing mode), `src/ui/options.js` (replaced the `open`/`close` reassignment antipattern with clean `openPanel`/`closePanel` declarations), and `src/ui/share-button.js` (replaced empty clipboard catch with a `console.warn`). All 11 tests pass; new version is 1.30.6.
