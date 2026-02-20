---
when: 2026-02-20T20:36:01Z
why: add missing test files to repository
what: commit sw-api-caching test and test runner update
model: github-copilot/claude-sonnet-4.5
tags: [test, sw, api-caching, v1.29.1]
---

Added `tests/sw-api-caching.test.mjs` which tests that the service worker correctly detects and bypasses cache for external API requests (prevents regression of the autocomplete bug). Also updated `tests/run.mjs` to include the new test. These files were created during bug investigation but not committed. Version bumped to 1.29.1.
