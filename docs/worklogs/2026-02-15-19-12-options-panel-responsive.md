---
when: 2026-02-15T19:12:00Z
why: Make options panel responsive so it never overflows small screens
what: Use CSS variable `--options-panel-width` that is `min(360px, 100vw)` and apply it to panel width and content translate
model: github-copilot/gpt-5-mini
tags: [ui,style,responsive]
---

Ensure the options panel is 360px on larger viewports but uses full viewport width on narrow screens to avoid overflow. Files: src/style.css
