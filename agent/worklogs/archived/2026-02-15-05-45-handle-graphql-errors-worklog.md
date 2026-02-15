---
when: 2026-02-15T05:45:00Z
why: fix fetchDepartures stopping on GraphQL validation errors
what: treat GraphQL responses with an `errors` array as non-success for variant selection so the client will try alternative query shapes
model: github-copilot/gpt-5-mini
tags: [entur,bugfix,worklog]
---

The previous change preferred mode-filtered queries when `modes` were provided, but the server returns GraphQL validation errors (in JSON) for some shapes. The code now interprets JSON responses with an `errors` array as a signal to try the next variant instead of stopping. Created this worklog before applying the fix per AGENT.md.
