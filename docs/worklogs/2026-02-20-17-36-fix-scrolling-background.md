---
when: 2026-02-20T17:36:39Z
why: Background gradient was scrolling away when page scrolled
what: Fixed background to html element with background-attachment fixed
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, css, background, ui]
---

Fixed scrolling background color issue by moving the gradient background to the html element and adding `background-attachment: fixed`. This ensures the background stays in place when scrolling and doesn't disappear. Body now has transparent background and min-height instead of height to allow content to expand. Modified src/style.css lines 103-115. Version bumped to 1.25.5.
