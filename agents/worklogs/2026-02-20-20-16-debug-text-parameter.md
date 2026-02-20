---
when: 2026-02-20T20:16:26Z
why: Debug text parameter passed to API - suspecting variable capture issue
what: Log raw text parameter and encoded version before fetch
model: github-copilot/claude-sonnet-4.5
tags: [debug, api, variable-capture]
---

Added logging in `src/entur.js` to show: raw `text` parameter value, `encodeURIComponent(text)` result, and actual `response.url` after fetch completes. This will reveal if the text parameter is being corrupted or if a different URL is being fetched than what we construct. Version 1.27.13.
