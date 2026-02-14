---
when: 2026-02-14T21:15:00Z
why: add/enable Node-local tests and update test runner
what: update `tests/run.mjs` to include new tests and add `tests/data-loader.test.mjs`
model: github-copilot/gpt-5-mini
tags: [tests, ci]
---

Enabled Node-local coverage by updating `tests/run.mjs` to import new test modules and added `tests/data-loader.test.mjs` to validate `parseUploadedJson` behavior for string/object inputs. No commits yet.
