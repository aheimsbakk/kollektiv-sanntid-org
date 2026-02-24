---
when: 2026-02-20T16:00:14Z
why: Share button navigation was reloading the page unnecessarily
what: Use pushState instead of window.location.href to update URL without reload
model: github-copilot/claude-sonnet-4.5
tags: [share, ux, performance]
---

Changed share button from `window.location.href = url` to `window.history.pushState({}, '', url)` to update the address bar without reloading the page. Also added back the checkmark visual feedback (✓ for 2 seconds) to confirm successful share. This provides better UX with no page interruption. Bumped version to 1.24.1.
