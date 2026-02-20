---
when: 2026-02-20T13:24:58Z
why: Make departure line format fully customizable via template
what: Add DEPARTURE_LINE_TEMPLATE to config.js with {lineNumber}, {destination}, {emoji}, {platform} placeholders
model: github-copilot/claude-sonnet-4.5
tags: [config,ui,template,customization]
---

Replaced hardcoded departure line format with configurable template system in v1.19.0. Users can now customize order and format of line elements via DEPARTURE_LINE_TEMPLATE in config.js (default: '{destination} · {lineNumber} {emoji}{platform}'). Files: src/config.js, src/ui/departure.js, src/sw.js
