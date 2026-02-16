---
when: 2026-02-16T19:57:00Z
why: Make autocomplete reliably hidden when unused and accessible when shown
what: toggle `.open` class and ARIA attributes (expanded/activedescendant) instead of `hidden`
model: github-copilot/gpt-5-mini
tags: [ui,accessibility,autocomplete]
---

Use class-based show/hide (`.open`) and manage `aria-expanded` and
`aria-activedescendant` on the station input so the dropdown is reliably
removed from layout when unused and properly announced to AT when open.
Files: src/ui/options.js, src/style.css
