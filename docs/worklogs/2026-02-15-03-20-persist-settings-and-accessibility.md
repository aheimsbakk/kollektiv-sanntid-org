---
when: 2026-02-15T03:20:00Z
why: persist user settings and improve accessibility for options panel
what: save/load options to localStorage, add ESC-to-close and focus-trap behavior when panel is open
model: github-copilot/gpt-5-mini
tags: [accessibility,settings,worklog]
---

Persist settings to `localStorage` under key `departure:settings` and add keyboard accessibility: ESC closes the panel and Tab/Shift-Tab are trapped inside the panel while open. Created this worklog before making code changes per AGENT.md.
