---
topic: 'Service worker ASSETS sync rule'
importance: high
category: fact
tags: [service-worker, pwa, assets, cache]
created: 2026-06-24T22:01:07Z
model: opencode/deepseek-v4-flash
---

Whenever a JS, CSS, or static asset file is added, renamed, or deleted
under `src/`, the `ASSETS` array in `src/sw.js` must be updated in the
same commit. Files intentionally excluded: `sw.js` itself and
`sitemap.xml` (neither is a runtime asset). Failure to update ASSETS
means the new file is not cached offline.
