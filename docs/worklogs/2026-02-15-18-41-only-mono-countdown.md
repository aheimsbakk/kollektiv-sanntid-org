---
when: 2026-02-15T18:41:00Z
why: Reduce visual noise by reserving monospace for countdown timers only
what: Use proportional UI font for destinations and monospace for countdowns
model: github-copilot/gpt-5-mini
tags: [ui,style,typography]
---

Use the app's proportional UI font for destination text and keep `var(--mono)` exclusively for the countdown timer so time values remain visually distinct and tabular. Files: src/style.css
