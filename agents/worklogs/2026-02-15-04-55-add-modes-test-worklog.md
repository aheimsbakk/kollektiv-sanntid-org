---
when: 2026-02-15T04:55:00Z
why: add unit test exposing transport mode filter behavior
what: create a test that verifies GraphQL POST contains whiteListedModes when modes are provided; commit worklog before test
model: github-copilot/gpt-5-mini
tags: [tests,entur,worklog]
---

Added a unit test that asserts fetchDepartures includes `whiteListedModes` in the request body when a non-empty `modes` parameter is supplied. This worklog was created prior to the change, as required.
