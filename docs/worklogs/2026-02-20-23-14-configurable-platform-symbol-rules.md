---
when: 2026-02-20T23:14:43Z
why: add configurable platform symbol rules combining transport mode and publicCode patterns
what: implement PLATFORM_SYMBOL_RULES in config.js with rule-based symbol selection for bus bays vs gates vs platforms
model: github-copilot/claude-sonnet-4.5
tags: [platform, symbols, config, rules, bus-terminal]
---

Added configurable PLATFORM_SYMBOL_RULES combining transport mode from API with publicCode patterns to distinguish physical quay types. Bus terminals now show bay symbol (▣) for B10/C2, gates (◆) for A/P, and platforms (⚏) for numeric codes.
