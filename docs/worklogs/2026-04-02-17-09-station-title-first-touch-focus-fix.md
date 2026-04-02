---
when: 2026-04-02T17:09:48Z
why: Focus ring incorrectly appeared on station title on the very first touch after page reload due to four compounding WebKit edge cases.
what: Eliminate spurious first-touch focus ring on station title across all four root causes
model: github-copilot/claude-sonnet-4.6
tags: [css, javascript, accessibility, pwa, mobile, focus, webkit, bugfix]
---

Four targeted fixes applied: (1) `src/css/header.css` — added `:active` to the `outline:none` rule to suppress the ring during physical press; (2) `src/ui/station-dropdown.js` — deferred `populateMenu()` via `Promise.resolve().then()` so DOM re-render no longer occurs inside WebKit's modality-detection window, and changed `titleBtn.focus()` to `titleBtn.focus({ preventScroll: true })`; (3) `src/app.js` — registered a passive, once-only `touchstart` listener on `document.body` to prime WebKit's input-modality heuristic before the first tap reaches any interactive element. Bumped to v1.40.23.
