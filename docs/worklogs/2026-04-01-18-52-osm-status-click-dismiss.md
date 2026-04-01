---
when: 2026-04-01T18:52:39Z
why: osmNoCoords status message should persist until the user explicitly dismisses it by clicking away
what: replace auto-timeout dismiss with click-outside dismiss for OSM no-coords status
model: github-copilot/claude-sonnet-4.6
tags: [ui, osm, ux]
---

Removed the 3-second auto-timeout from the OSM "no coords" status message in `src/ui/osm-button.js`. The message now stays visible until the user clicks anywhere outside the OSM container, using a deferred document click listener that tears itself down on dismiss. README updated to remove stale "button is disabled" wording. Bumped to v1.40.15.
