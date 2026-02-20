---
when: 2026-02-20T17:05:22Z
why: Prevent accidental re-import of shared stations on page refresh
what: Clear URL parameter after loading shared board data
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, share-link, url-cleanup]
---

Changed share link import behavior to clear the URL parameter after loading data. Uses `window.history.replaceState({}, '', window.location.pathname)` to remove ?b= or ?board= parameter after the shared station is imported and saved to favorites. This prevents the same station from being re-added to favorites on every page refresh. Modified src/app.js line 100. Version bumped to 1.25.2.
