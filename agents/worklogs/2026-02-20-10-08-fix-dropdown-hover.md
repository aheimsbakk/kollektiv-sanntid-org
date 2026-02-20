---
when: 2026-02-20T10:08:25Z
why: Fix dropdown hover creating black text on black background in light theme
what: Made autocomplete highlight colors theme-specific
model: github-copilot/claude-sonnet-4.5
tags: [fix, theme, dropdown, light-mode, accessibility]
---

Moved `--autocomplete-highlight-bg` and `--autocomplete-highlight-fg` variables from generic `:root` to theme-specific sections in `src/style.css`. Dark theme uses white background with dark text, light theme uses dark background with white text. Moved `--autocomplete-item-gap` to layout spacing section. Fixes unreadable black-on-black text when hovering dropdown items in light mode. Version bumped to 1.15.4.
