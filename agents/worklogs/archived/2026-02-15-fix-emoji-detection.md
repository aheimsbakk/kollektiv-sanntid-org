Title: Fix emoji detection to search raw payload for transport tokens

What I changed:
- Improve mode detection in `src/ui/departure.js` to recursively search the parsed `raw` call object for known transport tokens when explicit `mode`/`transportMode` fields are absent.

Reasoning:
- Many Entur responses place mode tokens in nested fields; a shallow check missed those and caused the UI fallback icon to be used for all departures.

Files to be modified:
- src/ui/departure.js
