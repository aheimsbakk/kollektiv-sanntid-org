---
when: 2026-02-14T21:45:00Z
why: add helper script to serve `src/` for manual browser testing
what: create `scripts/serve-src.sh` that launches a minimal static server (prefers Python3, falls back to Node)
model: github-copilot/gpt-5-mini
tags: [tools, dev]
---

Added `scripts/serve-src.sh` to quickly start a static HTTP server rooted at `src/` for manual testing in a browser. The script prefers `python3 -m http.server`, falls back to `python`, and finally tries Node (repo wrapper or system `node`).
