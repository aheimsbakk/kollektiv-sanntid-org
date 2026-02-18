---
when: 2026-02-18T19:43:45Z
why: Ensure all JavaScript modules are cached for proper version updates
what: Added all JS modules to service worker ASSETS array
model: github-copilot/claude-sonnet-4.5
tags: [service-worker, cache, version, fix]
---

Added all JavaScript modules to ASSETS array in src/sw.js (config.js, data-loader.js, entur.js, i18n.js, time.js, and all ui/*.js files, plus demo.json). Updated tests/sw.test.mjs to verify config.js and i18n.js are cached. Bumped version to 1.8.5.
