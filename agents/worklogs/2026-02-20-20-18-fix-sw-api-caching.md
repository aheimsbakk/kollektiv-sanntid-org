---
when: 2026-02-20T20:18:13Z
why: Fix service worker caching wrong API responses with ignoreSearch
what: Exclude external API requests from service worker cache
model: github-copilot/claude-sonnet-4.5
tags: [bug, service-worker, caching, api]
---

Fixed critical bug in `src/sw.js` where `cache.match(req, { ignoreSearch: true })` caused API requests to api.entur.io to return wrong cached responses. Search for "Berg" would return cached "Jernbanetorget" results because SW ignored query params. Now external API requests (different hostname) bypass SW cache entirely using network-only strategy. Version 1.28.0.
