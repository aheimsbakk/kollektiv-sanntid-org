---
when: 2026-02-14T15:02:00Z
why: constrain blueprint to client-side only (no server/proxy)
what: update BLUEPRINT.md to mandate pure client-side operation and offline/demo fallback
model: github-copilot/gpt-5-mini
tags: [blueprint, client-only, departure]
---

Updated the blueprint to require a pure client-side implementation (no server or proxy).
Documented CORS constraints and added robust offline/demo modes and a manual data upload path
so the app remains usable even if Entur blocks cross-origin requests.
