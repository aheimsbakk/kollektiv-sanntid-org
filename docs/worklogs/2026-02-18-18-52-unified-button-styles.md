---
when: 2026-02-18T18:52:06Z
why: Remove duplicate button CSS to maintain single source of truth
what: Cleaned up redundant .options-actions button styles
model: github-copilot/claude-sonnet-4.5
tags: [css, refactor, cleanup, v1.6.6]
---

Removed duplicate `.options-actions button` and `.options-actions button:hover` styles from `src/style.css` (lines 523-534). These were redundant with the unified base `button` styles added earlier. All buttons now inherit from the single base definition, maintaining consistency across Close, Apply, and language flag buttons. Bumped version to 1.6.6.
