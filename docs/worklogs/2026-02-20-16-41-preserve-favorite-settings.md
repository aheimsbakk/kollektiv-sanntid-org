---
when: 2026-02-20T16:41:02Z
why: Clicking favorites was overwriting their stored settings with current DEFAULTS
what: Preserve favorite settings when re-selecting from dropdown and add comprehensive tests
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, favorites, settings, testing]
---

Fixed bug where selecting a favorite from dropdown would overwrite its stored settings (numDepartures, fetchInterval, textSize, language) with current DEFAULTS. Added 5 new tests verifying settings storage and preservation behavior.
