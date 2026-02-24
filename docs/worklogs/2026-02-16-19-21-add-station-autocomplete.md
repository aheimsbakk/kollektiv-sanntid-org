---
when: 2026-02-16T19:21:34Z
why: Provide station-name autocomplete in the options panel for faster selection
what: add station autocomplete that queries Entur geocoder and shows top 5 matches
model: github-copilot/gpt-5-mini
tags: [ui,entur,autocomplete]
---

Add a dependency-free autocomplete for the station input in the options panel.
When the user types at least three characters the UI queries the Entur
geocoder and renders up to five suggestions; selecting one fills the input.
Files: src/ui/options.js, src/entur.js, src/style.css
