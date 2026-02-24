---
when: 2026-02-20T19:33:43Z
why: autocomplete still broken on first load when select() fails on mobile
what: detect stale input value on first keystroke and clear field
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, mobile, input-event]
---

Fixed autocomplete on first load by detecting when input event fires with full old value after focus (select() failure on mobile). Added check in input handler: if lastQuery is empty (just focused) and input has value >= 3 chars without stopId, clear the field. This forces fresh input on first keystroke when select() doesn't work. Version 1.27.7.
