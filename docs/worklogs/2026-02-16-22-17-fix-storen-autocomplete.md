---
when: 2026-02-16T22:17:41Z
why: Fix autocomplete ranking so Støren stasjon appears when typing Støren
what: Implement client-side relevance scoring and re-ranking in searchStations
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, geocoder, ranking, norwegian-chars]
---

Fixed autocomplete issue where "Støren stasjon" wouldn't appear when typing "Støren" due to geocoder ranking "Storeng" higher. Implemented client-side relevance scoring in src/entur.js searchStations that prioritizes exact matches and name/label prefix matches. Increased geocoder fetch size to 50 and filter to venue-only layer. Created test tests/entur.storen.autocomplete.test.mjs to verify fix.
