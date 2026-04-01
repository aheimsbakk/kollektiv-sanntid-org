---
when: 2026-04-01T19:29:52Z
why: the delayed indicator symbol changed to ◆ and user-facing documentation needed to reflect it
what: update README to document the ◆ delayed departure indicator
model: github-copilot/claude-sonnet-4.6
tags: [docs, readme, realtime, delayed]
---

Updated `README.md` Live Departures section to list all three realtime indicators (●, ○, ◆) and reworded the delay description from "red dot" to "red diamond (◆)". Also updated `src/config.js` delayed symbol from `⬦` to `◆` with corrected comment. Bumped to v1.40.17.
