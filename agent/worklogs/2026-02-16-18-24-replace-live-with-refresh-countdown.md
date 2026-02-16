---
when: 2026-02-16T18:24:06Z
why: Replace 'Live' status chip with a countdown to the next API refresh
what: Show "Next update in XX seconds." under the station header instead of 'Live'/'Demo'
model: github-copilot/gpt-5-mini
tags: [ui,feature,countdown]
---

Replace the small "Live"/"Demo" status chip with a per-second countdown that shows how many seconds remain until the next automatic API refresh. Modified `src/app.js` to track the next refresh timestamp and update the header status element every second.
