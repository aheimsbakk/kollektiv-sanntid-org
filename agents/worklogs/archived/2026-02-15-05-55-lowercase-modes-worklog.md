---
when: 2026-02-15T05:55:00Z
why: fix transport mode enum casing to match Entur API expectations
what: map transport mode enum tokens to lowercase when constructing enum-array GraphQL literal
model: github-copilot/gpt-5-mini
tags: [entur,bugfix,worklog]
---

Fixed an issue where enum-like mode tokens were uppercased (e.g. TRAM) causing GraphQL validation errors. The client now maps modes to lowercase tokens for the enum-array variant. Created this worklog before the code change per AGENT.md.
