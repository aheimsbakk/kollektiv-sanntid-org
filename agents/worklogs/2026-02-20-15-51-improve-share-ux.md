---
when: 2026-02-20T15:51:06Z
why: Improve share UX with visible URL, shorter parameter, and no auto-favorite
what: Change share to navigate to URL with ?b= param and update tooltip translations
model: github-copilot/claude-sonnet-4.5
tags: [share, ux, i18n, url]
---

Updated share button to navigate to shareable URL (instead of just copying), changed URL parameter from `?board=` to `?b=` (saves 5 bytes), removed auto-add to favorites for shared boards, and updated tooltip text in all languages to "Copy link to clipboard". Share now copies to clipboard AND navigates to the URL so users can see the full shareable link in their address bar. Bumped version to 1.24.0.
