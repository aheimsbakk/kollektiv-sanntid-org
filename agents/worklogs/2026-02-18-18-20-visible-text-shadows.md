---
when: 2026-02-18T18:20:52Z
why: Fix text shadows to be visible on dark background
what: Changed text shadows from gray to white glow effect for visibility
model: github-copilot/claude-sonnet-4.5
tags: [css, bugfix, shadows, visibility]
---

## Visible Text Shadows (v1.6.3)

Fixed text shadows to be visible on dark background by changing from traditional gray drop shadow to white glow effect (`0 0 8px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.3)`). Applied to departure destination text, countdown time, and transport mode icons. Version bumped to invalidate service worker cache.
