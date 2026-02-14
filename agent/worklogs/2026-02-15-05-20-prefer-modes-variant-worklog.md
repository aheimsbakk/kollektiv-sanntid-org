---
when: 2026-02-15T05:20:00Z
why: ensure transport mode filters are sent when modes are provided
what: change fetchDepartures to prefer sending whiteListedModes variants when caller supplies modes; added unit test to validate behavior
model: github-copilot/gpt-5-mini
tags: [entur,worklog,tests]
---

When `modes` are provided to `fetchDepartures`, prefer queries that include `whiteListedModes` (single-string, quoted-array, enum-array) before falling back to no-filter. Created this worklog before updating `src/entur.js` and tests.
