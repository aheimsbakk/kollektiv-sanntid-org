What I learned

- Service worker caching is a high-leverage place to look when responses are stale or inconsistent: using cache.match with options like `ignoreSearch` can silently return responses that don't match the current query (query string ignored). External APIs must be treated as network-first or explicitly excluded from aggressive cache matching.
- Async UI bugs often come from race conditions and event ordering: debounced searches may return out-of-order results, programmatic updates can trigger handlers, and mobile behaviors (e.g. `select()`) differ from desktop.
- Instrumentation (debug logs) helped find the issue fast, but leaving debug logs in production caused noise and required extra cleanup. Always gate or remove debug output when done.
- Small UX choices interact with technical details: clearing input on focus vs selecting text had different effects on mobile and desktop. Handling mobile quirks required defensive checks (flags like `updatingFields`, stale-value detection).
- Tests that exercise the service worker and edge cases prevented regressions. Adding targeted tests (e.g. `sw-api-caching.test.mjs`) made the fix reliable.
- Versioned service-worker caches and a strict version-bump policy ensure clients pick up fixes. Bumping the SW `VERSION` on every meaningful change avoids stale assets being served.

What I should have done differently to achieve the goal earlier

- Prioritise the service worker when network responses look wrong — the SW is a common source of "mismatched" responses. A quick grep for `ignoreSearch` / `cache.match` would have surfaced the risky call earlier.
- Write a small failing test first for the observed misbehavior (simulate a cached API response mismatch). TDD-style investigation can point you to the root cause faster.
- When adding debug logging, keep it local or behind a `DEBUG` constant. Do not push global `console.log` statements to commits without a guard; instead create a temporary local branch or use conditional logging.
- When changing UI input behavior, test on both desktop and mobile early. Mobile input selection semantics can be different; an early manual check would have shown the `select()` problem.
- Add minimal SW-related unit tests when changing fetch/caching logic. The absence of such tests made it easier for the bug to slip in.

Suggested rules for the agent (to make decisions more correct earlier)

1. Service worker first rule
- If a bug reports that network responses are incorrect or stale, always check the service worker fetch handler and cache.match usage before deeper code changes. Search for `ignoreSearch`, `cache.match`, and hostname checks.

2. Guarded logging
- Never add unguarded `console.log` debug statements directly to files that will be committed. Use a `DEBUG` flag, ephemeral local branches, or a logger that can be disabled. If logs are added, create a worklog entry stating why and mark them for removal before bumping a public version.

3. Add regression tests early
- When a production-visible bug is found, create a focused test that fails for that bug before implementing the fix (especially for SW and API caching issues). This prevents regressions and forces a targeted fix.

4. Cross-platform verification for UI changes
- For any change that touches input focus/selection or programmatic events, run a quick manual check on both desktop and mobile (or add a test that simulates mobile behavior). Assume `select()` and browser autofill behave differently across platforms.

5. Guard programmatic updates
- When code updates UI fields programmatically (e.g. `updateFields()`), always set an `updatingFields` flag and have input handlers return early when that flag is set. Document the flag usage in a nearby comment.

6. Network-first for external APIs
- Treat requests to external hostnames (not same-origin assets) as network-first by default in the SW. Explicitly exclude them from `ignoreSearch` or cache.match calls that ignore query strings.

7. Versioning & worklogs
- Bump SW `VERSION` for every commit that changes client-visible behavior, create a granular worklog BEFORE committing, and update `agents/CONTEXT.md` immediately. Validate worklogs with the repository script.

8. Commit checklist
- Before committing: run the full test suite (`npm test`), run `scripts/validate_worklogs.sh`, ensure no unguarded debug logs remain, and ensure the version bump script has been run.

9. Async UI safety
- For any UI flow that displays async results, only render results when the originating query still matches the input value (e.g., compare `inpStation.value` to `searchQuery`). This avoids out-of-order display.

10. Keep short, actionable worklogs
- Write concise worklogs that document the why/what and include a reference to the new version. Keep `agents/CONTEXT.md` under 20 lines and update it after each granular log.

Next steps (practical)

- Add a linter rule or pre-commit check to flag `console.log('\[DEBUG\]')` and stray `console.log` statements.
- Add a small SW unit test harness (node-based) to exercise `fetch` handler branching for origin vs external hostnames.
- Add a short mobile QA checklist to the repo README for input-related changes.

File: `LEARNED.md`
