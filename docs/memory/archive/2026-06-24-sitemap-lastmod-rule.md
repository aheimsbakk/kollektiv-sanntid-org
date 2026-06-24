---
topic: 'Sitemap lastmod update rule'
importance: high
category: fact
tags: [sitemap, seo, release]
created: 2026-06-24T22:01:07Z
model: opencode/deepseek-v4-flash
---

Whenever any file under `src/` is changed and released, update the
`<lastmod>` date in `src/sitemap.xml` to the release date (ISO 8601
format: `YYYY-MM-DD`). This applies to every commit that touches
user-visible content, markup, styles, or scripts.
