---
when: 2026-03-17T21:32:52Z
why: silent catch blocks hide runtime errors and violate rule §9 (no silent failures)
what: add console.warn to 7 silent catch blocks across settings, handlers, url-import, geocoder
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, error-handling, observability]
---

Replaced 7 silent `catch (_) {}` / `catch (_) { /* ignore */ }` blocks with named `catch (err)` + `console.warn` calls bearing a `[module]` prefix in `src/app/settings.js` (loadSettings, saveSettings, applyTextSize), `src/app/handlers.js` (two document.title assignments), `src/app/url-import.js` (language localStorage write), and `src/entur/geocoder.js` (reverse-geocode JSON parse). All other catch blocks were already logging. Bumped to v1.40.11.
