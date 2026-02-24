---
when: 2026-02-20T14:41:20Z
why: Fix bug where unchecking last transport mode doesn't show all modes
what: Add ALL_TRANSPORT_MODES constant to ensure empty selection always falls back to all modes
model: github-copilot/claude-sonnet-4.5
tags: [bugfix,transport-modes,ux]
---

Fixed transport mode fallback bug in v1.21.3. When all modes are unchecked, the app now correctly shows all transport types instead of keeping the last selected mode. Added immutable ALL_TRANSPORT_MODES constant to prevent reference mutation issues. Files: src/config.js, src/ui/options.js, src/sw.js
