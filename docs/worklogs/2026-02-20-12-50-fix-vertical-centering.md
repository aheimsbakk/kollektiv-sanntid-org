---
when: 2026-02-20T12:50:20Z
why: Fix vertical alignment of stacked platform display
what: Center platform codes on text line using translateY transform
model: github-copilot/claude-sonnet-4.5
tags: [fix, css, platform-display]
---

Fixed vertical centering of stacked platform display in src/style.css. Changed from vertical-align: middle with position relative to vertical-align: baseline with transform: translateY(-30%) to properly center the symbol+code stack on the text line height instead of sitting at the bottom. Bumped version to 1.18.1.
