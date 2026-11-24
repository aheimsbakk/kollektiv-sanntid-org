/**
 * run.mjs — unit test runner
 *
 * Suites are imported one at a time with dynamic `import()`, not static
 * imports. Several suites install global stubs (`document`, `localStorage`,
 * fake `setTimeout`) and use top-level await; with static imports the ESM
 * graph interleaves those suspensions, so a suite can resume after a later
 * suite has replaced the globals it depends on. Sequential awaits keep each
 * suite's global sandbox intact.
 *
 * A suite that throws at import time is reported and counted; the run still
 * continues so one broken suite does not hide the state of the rest.
 */

// Catch assertion failures from async tests (e.g. gps-dropdown-click) whose
// top-level awaits settle after the import phase completes.
process.on('unhandledRejection', (err) => {
  console.error('\n✗ Async test FAILED:', err?.message ?? err);
  process.exitCode = 1;
});

const suites = [
  './transport-mode-labels.test.mjs',
  './time.test.mjs',
  './i18n.test.mjs',
  './ui.emoji.test.mjs',
  './entur.parse.test.mjs',
  './entur.fetch.test.mjs',
  './entur.modes.test.mjs',
  './entur.query.line.test.mjs',
  './entur.parse.mode.test.mjs',
  './ui.diff.test.mjs',
  './entur.lookup.test.mjs',
  './entur.empty.test.mjs',
  './entur.autocomplete.blindern.test.mjs',
  './entur.norwegian.chars.test.mjs',
  './entur.gps-nearby.test.mjs',
  './ui.tick.test.mjs',
  './station-dropdown.test.mjs',
  './favorites.test.mjs',
  './remove-favorites.test.mjs',
  './toggle-all.test.mjs',
  './share-link.test.mjs',
  './options-autocomplete.test.mjs',
  './autocomplete-input-wipe.test.mjs',
  './gps-dropdown-click.test.mjs',
  './search-filtering.test.mjs',
  './footer-link.test.mjs',
  './codebase-sync.test.mjs',
  './sw.test.mjs',
  './sw-api-caching.test.mjs',
  './fetch-loop.test.mjs',
  './sw-updater.test.mjs',
  './share-button-reset.test.mjs',
  './departure-delay.test.mjs',
  './osm-button.test.mjs',
  './favorites-gps.test.mjs',
  './share-gps.test.mjs',
];

let failedSuites = 0;

for (const suite of suites) {
  try {
    await import(suite);
  } catch (err) {
    failedSuites += 1;
    console.error(`\n✗ ${suite} FAILED: ${err?.message ?? err}`);
  }
}

const failedTotal = failedSuites + (process.exitCode ? 1 : 0);
console.log(
  `\nSuites: ${suites.length} | Failed: ${failedTotal}` +
    (failedTotal ? ' — test run failed' : ' — all suites loaded')
);

if (failedSuites > 0) process.exitCode = 1;
