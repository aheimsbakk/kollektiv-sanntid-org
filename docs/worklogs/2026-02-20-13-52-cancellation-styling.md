---
when: 2026-02-20T13:52:35Z
why: Show cancelled departures with strikethrough styling for visual clarity
what: Add departure-cancelled CSS class and wrapper logic for item.cancellation field
model: github-copilot/claude-sonnet-4.5
tags: [ui,cancellation,css,config]
---

Added cancellation styling in v1.21.0. When API reports departure.cancellation === true, entire departure line is wrapped with .departure-cancelled class showing strikethrough and reduced opacity. CANCELLATION_WRAPPER config allows customization. Files: src/config.js, src/ui/departure.js, src/style.css, src/sw.js
