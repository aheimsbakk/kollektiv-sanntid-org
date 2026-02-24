---
when: 2026-02-20T10:12:17Z
why: Fix station dropdown hover creating black text on black background in light theme
what: Made station dropdown highlight colors theme-specific
model: github-copilot/claude-sonnet-4.5
tags: [fix, theme, dropdown, light-mode, accessibility]
---

Added `--dropdown-highlight-bg` and `--dropdown-highlight-fg` variables to both dark and light theme sections in `src/style.css`. Updated `.station-dropdown-item:hover` and `.station-dropdown-item.selected` to use new variables instead of hardcoded colors. Dark theme uses white bg with dark text, light theme uses dark bg with white text. Fixes unreadable black-on-black text in station dropdown for light mode. Version bumped to 1.15.5.
