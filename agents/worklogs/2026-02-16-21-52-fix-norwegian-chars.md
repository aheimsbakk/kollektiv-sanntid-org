---
when: 2026-02-16T21:52:26Z
why: Fix Norwegian character handling in geocoder autocomplete
what: Remove layers and categories filters to avoid Entur API bugs with æøå
model: github-copilot/claude-sonnet-4.5
tags: [geocoder, bug-fix, norwegian, i18n]
---

Fixed issue where stations with Norwegian characters (æøå) like "Støren" returned wrong results in autocomplete. Root cause: Entur geocoder API has bugs when combining `layers=venue` or `categories` filters with Norwegian characters - fuzzy matching returns "Storeng" instead of "Støren". Solution: Remove all filters from autocomplete search, let users see all results (address + venue layers). Mode filtering still happens server-side when fetching departures. Also added default apiUrl to fetchDepartures. Files: src/entur.js, src/ui/options.js, tests/entur.norwegian.chars.test.mjs, tests/entur.norwegian.real.test.mjs.
