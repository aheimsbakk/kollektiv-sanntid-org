---
when: 2026-02-21T08:38:22Z
why: Keep browser URL clean when sharing boards
what: Remove window.history.pushState from share button
model: github-copilot/claude-sonnet-4.5
tags: [refactor, ux, share-button]
---

Removed window.history.pushState from share button since clipboard copying works reliably without polluting the browser URL with query parameters.
