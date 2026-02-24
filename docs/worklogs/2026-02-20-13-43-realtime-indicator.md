---
when: 2026-02-20T13:43:19Z
why: Show realtime vs scheduled departure status with visual indicator
what: Add {indicator} placeholder to departure template showing ● for realtime, ○ for scheduled
model: github-copilot/claude-sonnet-4.5
tags: [ui,realtime,config,template]
---

Added configurable realtime indicator in v1.20.0. REALTIME_INDICATORS in config.js defines symbols (● solid for realtime, ○ hollow for scheduled). Template now supports {indicator} placeholder based on departure.realtime field. Files: src/config.js, src/ui/departure.js, src/sw.js
