---
when: 2026-02-16T18:37:08Z
why: Shorten header countdown label for compact UI
what: show "Updating in XXs" instead of long phrase and remove duplicate interval
model: github-copilot/gpt-5-mini
tags: [ui,ux,countdown]
---

Shorten the header countdown text from "Next update in XX seconds." to the compact "Updating in XXs" and remove a duplicated periodic refresh interval in `src/app.js` so only the centralized refresh loop runs.
