/**
 * codebase-sync.test.mjs — regression tests for scripts/verify_codebase_sync.sh
 *
 * The script checks CODEBASE.md against the repository in both directions:
 * documented paths must exist, and on-disk files must be documented. Each
 * direction has been a silent blind spot before, so both are covered here,
 * along with the annotated tree format and the folder-level exceptions.
 *
 * Fixture runs happen outside this repository, so the script falls back to
 * walking the working tree instead of `git ls-files`.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPT = join(REPO_ROOT, 'scripts', 'verify_codebase_sync.sh');

const tempDirs = [];

after(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

/**
 * Build a throwaway repository layout and run the script inside it.
 *
 * The fixture document always lists the two self-referential files — the
 * document and the script under test — so each case only states the paths it
 * is actually about.
 *
 * @param {string[]} files paths to create, relative to the fixture root
 * @param {(rootName: string) => string} buildCodebase receives the fixture
 *   folder name so tree blocks can use it as their root line
 * @returns {{status: number|null, output: string}}
 */
function runFixture(files, buildCodebase) {
  const root = mkdtempSync(join(tmpdir(), 'codebase-sync-'));
  tempDirs.push(root);
  const rootName = basename(root);

  const selfLines =
    '\nSelf-documenting entries: `CODEBASE.md`, `scripts/verify_codebase_sync.sh`\n';

  mkdirSync(join(root, 'scripts'), { recursive: true });
  copyFileSync(SCRIPT, join(root, 'scripts', 'verify_codebase_sync.sh'));
  writeFileSync(join(root, 'CODEBASE.md'), buildCodebase(rootName) + selfLines);

  for (const file of files) {
    const target = join(root, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, 'export const fixture = true;\n');
  }

  const run = spawnSync('bash', [join(root, 'scripts', 'verify_codebase_sync.sh')], {
    encoding: 'utf8',
  });
  return { status: run.status, output: `${run.stdout}${run.stderr}` };
}

/** Annotated tree block rooted at the fixture folder, with the given entries. */
function treeBlock(rootName, entries) {
  return ['```', `${rootName}/`, ...entries, '```'].join('\n');
}

test('the repository itself passes both directions', () => {
  const run = spawnSync('bash', [SCRIPT], { encoding: 'utf8' });
  assert.equal(run.status, 0, `script failed:\n${run.stdout}${run.stderr}`);
  assert.match(run.stdout, /CODEBASE\.md and the repository are in sync/);
});

test('a documented path that no longer exists is reported', () => {
  const codebase =
    '# Fixture\n\n| Component | Path |\n| --- | --- |\n| Kept | `src/kept.js` |\n| Gone | `src/gone.js` |\n';
  const result = runFixture(['src/kept.js'], () => codebase);
  assert.equal(result.status, 1);
  assert.match(result.output, /MISSING: src\/gone\.js/);
  assert.doesNotMatch(result.output, /MISSING: src\/kept\.js/);
});

test('an undocumented file is reported', () => {
  const codebase = '# Fixture\n\n| Component | Path |\n| --- | --- |\n| Kept | `src/kept.js` |\n';
  const result = runFixture(['src/kept.js', 'src/unlisted.js'], () => codebase);
  assert.equal(result.status, 1);
  assert.match(result.output, /UNLISTED: src\/unlisted\.js/);
  assert.doesNotMatch(result.output, /UNLISTED: src\/kept\.js/);
});

test('tree entries are checked, not just table paths', () => {
  const result = runFixture(['src/kept.js'], (rootName) =>
    [
      '# Fixture',
      '',
      treeBlock(rootName, ['├── src/', '│   ├── kept.js', '│   └── gone.js']),
      '',
    ].join('\n')
  );
  assert.equal(result.status, 1);
  assert.match(result.output, /MISSING: src\/gone\.js/);
  assert.doesNotMatch(result.output, /MISSING: src\/kept\.js/);
});

test('a file listed only in a tree block counts as documented', () => {
  const result = runFixture(['src/kept.js'], (rootName) =>
    ['# Fixture', '', treeBlock(rootName, ['├── src/', '│   └── kept.js']), ''].join('\n')
  );
  assert.equal(result.status, 0, result.output);
});

test('a folder-level tree label that is not a real folder still resolves', () => {
  // The tree block is labelled "repo/", which does not exist in the fixture.
  // Its entries must then be read as repository-root paths.
  const result = runFixture(['src/kept.js'], () =>
    ['# Fixture', '', treeBlock('repo', ['├── src/', '│   └── kept.js']), ''].join('\n')
  );
  assert.equal(result.status, 0, result.output);
});

test('folder-level directories are exempt from the reverse check', () => {
  const codebase =
    '# Fixture\n\n| Component | Path |\n| --- | --- |\n| Memory index | `docs/memory/INDEX.md` |\n';
  const result = runFixture(
    [
      'docs/memory/INDEX.md',
      'docs/memory/archive/2026-01-01-entry.md',
      '.opencode/skills/demo/SKILL.md',
    ],
    () => codebase
  );
  assert.equal(result.status, 0, result.output);
});

test('a file path mention does not exempt its folder neighbours', () => {
  // `src/app.js` contains the text "src/" but is a file entry, so a
  // neighbouring file must still be reported as undocumented.
  const codebase = '# Fixture\n\n| Component | Path |\n| --- | --- |\n| App | `src/app.js` |\n';
  const result = runFixture(['src/app.js', 'src/hidden.js'], () => codebase);
  assert.equal(result.status, 1);
  assert.match(result.output, /UNLISTED: src\/hidden\.js/);
});
