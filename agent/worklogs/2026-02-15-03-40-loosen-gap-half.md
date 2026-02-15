---
when: 2026-02-15T03:40:00Z
why: Reduce previously increased gap; align inter-station spacing
what: set internal departure row-gap to 12px and make departures list gap 12px
model: github-copilot/gpt-5-mini
tags: [ui,style,spacing]
---

Reduce the `.departure` `row-gap` from 24px to 12px and set `.departures` `gap` to 12px so internal destination↔countdown spacing matches spacing between station rows. Files: src/style.css
