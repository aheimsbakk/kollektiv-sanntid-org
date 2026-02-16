---
when: 2026-02-15T04:10:00Z
why: set sensible default for text size and expose via settings dropdown
what: make 'medium' the default text size when user has not selected anything; update settings select default
model: github-copilot/gpt-5-mini
tags: [ui,accessibility,worklog]
---

Changed the default text size to 'medium' when no user preference is stored. Updated the settings panel select default and the runtime fallback so the board uses medium typography by default.
