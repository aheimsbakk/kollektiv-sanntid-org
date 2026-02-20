---
generated_at: 2026-02-20T22:04:35Z
total_worklogs: 211
themes:
  ui/css: 117
  service-worker/pwa: 112
  autocomplete: 102
  options/favorites: 86
  tests: 43
  i18n: 31
  accessibility: 24
summary: "Consolidated lessons from agent worklogs: frequent autocomplete race conditions and SW caching mistakes were highest-impact; process improvements (worklog discipline, version bumps) reduced regressions."
---

What I learned
- Autocomplete is fragile: race conditions, stale candidate lists, programmatic input events, and mobile-specific quirks repeatedly caused wrong selections or missing fetches. Representative worklogs: `agents/worklogs/2026-02-16-19-21-add-station-autocomplete.md`, `agents/worklogs/2026-02-16-20-10-rate-limit-autocomplete.md`, `agents/worklogs/2026-02-16-21-43-fix-autocomplete-stopid.md`.
- Service Worker caching caused incorrect API responses when query strings were ignored or cache keys were reused; fixes included versioned caches and network-only for external APIs. Representative worklog: `agents/worklogs/2026-02-17-19-46-fix-sw-cache-version.md`.
- i18n and character handling exposed backend filtering bugs (Norwegian characters); removing aggressive geocoder filters and adding client-side ranking fixed many cases. Representative worklogs: `agents/worklogs/2026-02-16-21-52-fix-norwegian-chars.md`, `agents/worklogs/2026-02-16-22-17-fix-storen-autocomplete.md`.
- Tests and validation are effective at preventing regressions but were often added late; adding tests earlier would have saved time. Representative worklogs: `agents/worklogs/2026-02-20-20-36-add-missing-tests.md`, `agents/worklogs/2026-02-16-21-43-fix-autocomplete-stopid.md`.
- UX/CSS churn is high: many small layout/styling fixes accumulate and cost time; centralizing tokens and CSS variables helped.

What I should have done differently
- Add focused unit/integration tests for autocomplete and SW caching before making behavioral changes (e.g., tests that assert stale results are not rendered, and SW returns network-only for api hosts).
- Treat external API requests as network-only by default in SW and explicitly opt-in to caching with a clear cache key that includes query params.
- Guard against programmatic input events: set and clear a dedicated flag when updating input fields programmatically and have autocomplete ignore events while the flag is set.
- Add debounce + request-cancellation (or response-sequencing) for autocomplete; always validate that a response matches the current query before rendering.
- Require a worklog + test for any change touching networking, caching, or input handling (autocomplete/pre-fill) before code edits are merged.
- Run a brief UX smoke test (mobile + desktop) after each autocomplete-related change to catch platform-specific input/select() quirks.

Suggested rules for agent (actionable, enforceable)
1. If a change affects network fetching for external hostnames, then add a test and ensure SW treats that hostname as network-only (implementation hint: update `src/sw.js` route to `networkFirst` or bypass; enforce in CI by a lint that searches for hostnames in fetch handlers).
   - Enforce: pre-commit lint + CI test preventing new external hostnames from being added without tests.
2. Always validate autocomplete responses correspond to the current input before rendering (implementation hint: attach an increasing requestId or compare returned query with `input.value`).
   - Enforce: unit tests in `tests/ui.autocomplete.*.mjs`.
3. Debounce user input for autocomplete (250–500ms) and cancel or ignore earlier responses (implementation hint: store lastRequestId; ignore responses with stale id).
   - Enforce: PR checklist item + unit test.
4. When programmatically updating inputs (updateFields / pre-fill), set `suppressInputEvents=true` and ignore input/change events when set; clear the flag after the update completes.
   - Enforce: code comment + small test that asserts no autocomplete triggers on programmatic set.
5. Version the SW cache and require running `scripts/bump-version.sh` on any deploy-affecting commit (implementation hint: include version constant in `src/sw.js` and `src/config.js`).
   - Enforce: pre-commit hook or CI check that `src/sw.js` and `src/config.js` versions were bumped when files under `src/` change.
6. Prefer network-only for API endpoints that include query/search params; if caching is required, include normalized query in cache key (implementation hint: use Request.url as part of cache key or a hash of query string).
   - Enforce: tests for SW caching behavior in `tests/sw.*.mjs`.
7. Remove debug logging before merge and add a CI grep that fails if '[DEBUG]' or console.debug left in committed JS (implementation hint: add a small lint rule or grep step in CI).
   - Enforce: CI lint step.
8. Add acceptance tests for i18n edge cases (Norwegian characters) that exercise geocoder behavior and ranking (implementation hint: tests under `tests/entur.*.mjs` that assert expected stop appears in top results).
   - Enforce: tests + CI.
9. For any UI/UX change that affects layout, run a short visual/DOM smoke test on mobile viewport and desktop (implementation hint: a tiny Puppeteer script that loads the app, opens options, and runs a few key interactions).
   - Enforce: local smoke script + optional CI job for major UI PRs.
10. Maintain the worklog discipline: create a short worklog (1–3 sentences, correct front-matter order) before any code edits and run `scripts/validate_worklogs.sh`.
   - Enforce: CI check that new commits include a worklog entry when files under `agents/` or `src/` change.

Machine summary (JSON)
{
  "generated_at": "2026-02-20T22:04:35Z",
  "total_worklogs": 211,
  "themes": {"ui/css":117,"service-worker/pwa":112,"autocomplete":102,"options/favorites":86,"tests":43,"i18n":31,"accessibility":24}
}

Representative references (one per major theme)
- Autocomplete: `agents/worklogs/2026-02-16-19-21-add-station-autocomplete.md`
- SW cache/version: `agents/worklogs/2026-02-17-19-46-fix-sw-cache-version.md`
- Norwegian/i18n: `agents/worklogs/2026-02-16-21-52-fix-norwegian-chars.md`
- Tests added: `agents/worklogs/2026-02-20-20-36-add-missing-tests.md`
- Worklog discipline: `agents/WORKLOG_TEMPLATE.md`
