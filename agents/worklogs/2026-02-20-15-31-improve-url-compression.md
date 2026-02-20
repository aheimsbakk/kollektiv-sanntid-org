---
when: 2026-02-20T15:30:58Z
why: reduce share URL length with better compression strategy
what: use array encoding instead of object keys for 17-24% size reduction
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, compression, share, url-encoding]
---

Improved share URL compression by switching from JSON object encoding to compact array encoding. Changed data format from `{n:"name",s:"id",...}` to array `["name","id",...]` which eliminates object key overhead. Achieves 24.5% reduction for typical URLs and 17.4% for worst-case scenarios without requiring gzip/CompressionStream API. Maintains backward compatibility by detecting and supporting both array and legacy object formats during decode. Updated src/ui/share-button.js with simplified encoding/decoding logic.
