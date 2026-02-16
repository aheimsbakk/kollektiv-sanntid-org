---
when: 2026-02-16T21:58:48Z
why: Filter autocomplete to only show transport stops, not addresses or places
what: Add client-side filtering in searchStations to return only venue layer or NSR: IDs
model: github-copilot/claude-sonnet-4.5
tags: [entur, autocomplete, geocoder, filtering]
---

Modified `searchStations` in src/entur.js to filter geocoder results client-side, returning only transport stops (layer=venue OR id starts with NSR:). This prevents address results like "Støren, Midtre Gauldal" (ID: 801983) from appearing in autocomplete, ensuring only valid station results.
