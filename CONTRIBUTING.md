# Contributing

This file covers development work: setup, commands, scripts, tests, and the
release steps. For what the app does and how to use it, see `README.md`.

## What you need

- Node.js 20 or newer. The test suite uses the built-in `node:test` runner and
  `AbortSignal.timeout`.
- No build step and no runtime dependencies. The only devDependency is
  `prettier@3.5.3`.

## Set up

1. Install dev dependencies:

   ```sh
   npm ci
   ```

2. Optional — enable the commit checks:

   ```sh
   git config core.hooksPath .githooks
   ```

## Run the app locally

Serve `src/` over HTTP. Service workers do not work from `file://` URLs.

```sh
./scripts/serve-src.sh 8000
# then open http://localhost:8000
```

Any static server works. If you serve the repository root instead of `src/`,
open `http://localhost:8000/src/`.

## Commands

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm test`             | Runs the test suite (`tests/run.mjs`)         |
| `npm run format`       | Formats `src/**` and `tests/**` with Prettier |
| `npm run format:check` | Fails if any formatted file is out of date    |

## Repository scripts

| Script                            | Purpose                                                                                                             | Usage                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `scripts/serve-src.sh`            | Serves `src/` over HTTP; tries python3, python, then node                                                           | `./scripts/serve-src.sh [port]` (default 8000)                    |
| `scripts/bump-version.sh`         | Bumps `VERSION` in `src/config.js`, `src/sw.js`, `package.json`; sets `<lastmod>` in `src/sitemap.xml` to today     | `./scripts/bump-version.sh [major\|minor\|patch]` (default patch) |
| `scripts/validate-changelog.sh`   | Checks that the newest `CHANGELOG.md` entry has the required header, metadata bullets, and category headings        | `./scripts/validate-changelog.sh [file]` (default `CHANGELOG.md`) |
| `scripts/verify_codebase_sync.sh` | Two-way check between `CODEBASE.md` and the repository: documented paths exist, and repository files are documented | `./scripts/verify_codebase_sync.sh`                               |

The script reports two problem kinds:

- `MISSING: <path>` — `CODEBASE.md` names a path that is not on disk.
- `UNLISTED: <file>` — a file in the repository is not named anywhere in
  `CODEBASE.md`. This covers tracked files and new files that git does not
  ignore, so a file added in the current session is caught before it is
  committed.

Paths are read both from tables and from the annotated directory tree, so a
tree entry counts as documentation. Folders that change without a code change
are mapped as a whole and skipped file by file. That list lives in
`FOLDER_LEVEL` at the top of the script:

| Folder                | Why it is mapped as a folder                |
| --------------------- | ------------------------------------------- |
| `.opencode/agents`    | Replaced wholesale by `.opencode/update.sh` |
| `.opencode/skills`    | Replaced wholesale by `.opencode/update.sh` |
| `docs/entur-apis`     | Third-party API reference material          |
| `docs/openstreetmap`  | Third-party reference material              |
| `docs/pwa`            | Third-party reference material              |
| `docs/memory/archive` | One dated file per saved memory             |

Add a folder to `FOLDER_LEVEL` only when its contents genuinely carry no
per-file meaning for the code. Application and test folders are never exempt.

`tests/codebase-sync.test.mjs` runs the script against both this repository and
fixture folders, so a regression in either direction fails `npm test`.

## Git hooks

`.githooks/pre-commit` runs two checks:

1. `scripts/validate-changelog.sh` — only when `CHANGELOG.md` is staged.
2. `scripts/verify_codebase_sync.sh` — on every commit.

The hook directory is not active until you run
`git config core.hooksPath .githooks`. To skip a hook for one commit, use
`git commit --no-verify`.

## Tests

Run the suite:

```sh
npm test
```

Rules:

- **Hermetic.** No network calls and no browser. Replace `fetch`, `document`,
  `localStorage`, and `navigator` with stubs inside the test file. Two suites
  are deliberately outside the suite list because they call the live Entur API:
  `tests/entur.norwegian.real.test.mjs` and
  `tests/entur.storen.autocomplete.test.mjs`. Run them by hand with
  `node tests/<file>`.
- **Register every new suite.** `tests/run.mjs` holds an explicit `suites` list
  and does not scan the folder. A test file that is not in the list never runs.
- **Suites load one at a time.** `tests/run.mjs` awaits a dynamic `import()` per
  suite. Several suites install global stubs, and static imports let those
  suspensions interleave, so one suite can resume after another has replaced
  the globals it depends on.
- **Assert against real modules.** Import the function under test instead of
  re-implementing it in the test file, and read limits such as the favorites cap
  from `DEFAULTS` in `src/config.js` rather than hardcoding a number.
- **Set `process.exitCode`, never `process.exit()`.** Calling `process.exit()`
  in a suite kills the run and silently skips every suite that has not finished.

## Documentation workflow

- Change `BLUEPRINT.md` (architecture, contracts, schemas) before writing code
  for a feature or architecture change.
- Change `CODEBASE.md` (paths, mappings) with the code that changes files.
  Remove entries for deleted files in the same commit.
- Run `scripts/verify_codebase_sync.sh` before you finish.
- `README.md` holds user-facing content only. Setup, commands, scripts, and
  contribution steps belong here.

## Changelog entry format

Every release entry in `CHANGELOG.md` has this shape:

```markdown
## [1.41.0] - 2026-11-24

- **why:** <one sentence on the reason for the change>
- **model:** <model id used for the work>
- **tags:** <comma-separated keywords>

### Added

### Changed

### Fixed
```

`scripts/validate-changelog.sh` enforces the header pattern, the three metadata
bullets, and at least one category heading in the newest entry.

## Release checklist

1. Add the `CHANGELOG.md` entry and run `./scripts/validate-changelog.sh`.
2. If you added, renamed, or deleted a file under `src/`, update the `ASSETS`
   array in `src/sw.js`. Missing entries mean the file is not cached offline.
   `sw.js` itself and `sitemap.xml` are not listed in `ASSETS`.
3. Bump the version: `./scripts/bump-version.sh patch|minor|major`. This also
   sets `<lastmod>` in `src/sitemap.xml` to the release date.
4. Run `npm test`, `npm run format:check`, and `./scripts/verify_codebase_sync.sh`.
   All three must pass.
5. Merge to `main`. `static.yml` publishes `src/` to GitHub Pages.

## Deployment workflows

GitHub Actions workflows in `.github/workflows/`:

| Workflow file            | Trigger                     | What it does                                         |
| ------------------------ | --------------------------- | ---------------------------------------------------- |
| `static.yml`             | Push to `main`, manual run  | Publishes the production site to the Pages branch    |
| `pr-preview.yml`         | PR opened or updated        | Builds a per-pull-request preview of the site        |
| `pr-preview-cleanup.yml` | PR closed                   | Removes that pull request's preview                  |
| `pr-preview-gc.yml`      | Weekly schedule, manual run | Deletes stale previews older than their pull request |
