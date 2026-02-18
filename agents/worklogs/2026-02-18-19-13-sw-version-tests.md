---
when: 2026-02-18T19:13:10Z
why: Ensure version consistency across service worker and config files
what: Added service worker version validation tests
model: github-copilot/claude-sonnet-4.5
tags: [test, service-worker, version, v1.8.1]
---

Enhanced `tests/sw.test.mjs` with two new test cases: (1) validates that VERSION constant in `src/sw.js` matches VERSION in `src/config.js`, and (2) verifies the auto-reload mechanism is correctly implemented by checking that old manual reload/dismiss buttons are removed and the new `showUpdateNotification` function exists. Added sw.test.mjs to the test runner in `tests/run.mjs`. All 10 service worker tests pass. Bumped version to 1.8.1.
