---
when: 2026-02-17T19:46:13Z
why: Fix service worker cache preventing app updates after deployment
what: Add versioned caching to service worker
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, service-worker, cache, pwa]
---

Modified src/sw.js to use versioned CACHE_NAME with SemVer VERSION constant. Created scripts/bump-version.sh for automated version bumping and tests/sw.test.mjs to validate service worker configuration.
