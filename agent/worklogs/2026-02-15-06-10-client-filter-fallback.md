---
when: 2026-02-15T06:10:00Z
why: ensure UI mode selections apply even when server rejects mode AST shapes
what: added client-side permissive filtering fallback in `fetchDepartures` to filter parsed results by requested modes when server-side filtering fails
model: github-copilot/gpt-5-mini
tags: [entur,worklog,bugfix]
---

Added a client-side fallback filter to `fetchDepartures` so when Entur rejects `whiteListedModes` AST variants the UI still shows the user-selected transport modes by filtering the parsed `estimatedCalls` locally. This worklog documents the change per AGENT.md.
