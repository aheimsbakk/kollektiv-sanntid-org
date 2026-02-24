---
when: 2026-02-20T20:04:25Z
why: Debug which features are filtered out by venue layer check
what: Log raw API features and post-filter results to identify filtering bug
model: github-copilot/claude-sonnet-4.5
tags: [debug, filtering, venue-layer]
---

Enhanced debug logging in `src/entur.js` to show: raw API features with name/label/layer/id before filtering, and features remaining after `layer === 'venue'` filter. API returns 3 features for "berg" but only 1 passes filter (Jernbanetorget), suggesting valid stations being incorrectly filtered. Version 1.27.12.
