---
when: 2026-02-14T22:45:00Z
why: ensure demo departures show future countdowns during manual testing
what: tweak `getDemoData` to normalize/shift demo times into the future when they are in the past
model: github-copilot/gpt-5-mini
tags: [bugfix, demo]
---

When demo data contains past timestamps the UI will show "Now". `getDemoData` now shifts past demo departures to be relative to current time (5/10/15... minute offsets) so the demo always shows upcoming departures.
