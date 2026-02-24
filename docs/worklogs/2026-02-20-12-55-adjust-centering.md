---
when: 2026-02-20T12:55:26Z
why: Improve vertical centering of platform display for better visual balance
what: Adjust translateY from -30% to -50% for optimal centering
model: github-copilot/claude-sonnet-4.5
tags: [fix, css, platform-display]
---

Adjusted vertical centering of stacked platform display in src/style.css. Changed transform: translateY(-30%) to translateY(-50%) for more visually pleasing alignment. User confirmed -50% centers the symbol+code stack optimally on the text line height. Bumped version to 1.18.2.
