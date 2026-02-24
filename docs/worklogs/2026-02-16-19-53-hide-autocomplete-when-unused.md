---
when: 2026-02-16T19:53:26Z
why: Ensure autocomplete is removed from layout and inaccessible when unused
what: hide autocomplete list using the hidden attribute and ARIA flags
model: github-copilot/gpt-5-mini
tags: [ui,accessibility,autocomplete]
---

Hide the station autocomplete when no candidates are present or the user is
not interacting with it. Use the `hidden` attribute and `aria-*` flags so the
dropdown is fully removed from layout and not exposed to assistive tech.
