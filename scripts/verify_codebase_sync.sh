#!/usr/bin/env bash
# verify_codebase_sync.sh
# Two-way check between CODEBASE.md and the repository:
#   forward — every path written in CODEBASE.md exists on disk
#   reverse — every repository file is written in CODEBASE.md (tracked files
#             plus new files that are not gitignored)
#
# The reverse pass closes the gap that made this script one-directional: a file
# added under src/ or tests/ used to pass the check while being absent from the
# mapping document.
#
# Usage: ./scripts/verify_codebase_sync.sh
# Exit:  0 when both directions agree, 1 with one output line per problem.
#
# Size review: kept as one file on purpose. The pre-commit hook and
# tests/codebase-sync.test.mjs both run or copy this single script, so a helper
# file would have to travel with it for no readability gain.

set -euo pipefail

# C locale keeps the byte-level tree parsing and regex behaviour predictable.
export LC_ALL=C

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CODEBASE="$ROOT_DIR/CODEBASE.md"
REPO_NAME="$(basename "$ROOT_DIR")"

# Directories CODEBASE.md documents as a folder rather than file by file.
# Each one changes without a code change, so listing them individually would
# make the document stale on its own:
#   .opencode/agents, .opencode/skills — replaced wholesale by .opencode/update.sh
#   docs/entur-apis, docs/openstreetmap, docs/pwa — third-party reference dumps
#   docs/memory/archive — one dated entry file per saved memory
readonly FOLDER_LEVEL=(
	".opencode/agents"
	".opencode/skills"
	"docs/entur-apis"
	"docs/openstreetmap"
	"docs/pwa"
	"docs/memory/archive"
)

if [ ! -f "$CODEBASE" ]; then
	echo "ERROR: CODEBASE.md not found at $CODEBASE" >&2
	exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

LISTED="$TMP_DIR/listed"
: >"$LISTED"

# ─── Forward pass input: paths written in CODEBASE.md ─────────────────────────

# Prefixed paths in tables and prose.
grep -oE '(src|tests|scripts|docs|\.githooks|\.opencode|\.github)/[a-zA-Z0-9_./-]+' "$CODEBASE" >>"$LISTED" || true

# Root-level files mentioned at the start of a line (tree entries, tables).
grep -oE '^[a-zA-Z][a-zA-Z0-9_.-]+\.(md|json|sh|js|mjs|yml|yaml|ico|svg|txt|xml|webmanifest|html|css)' "$CODEBASE" >>"$LISTED" || true
grep -oE '^CNAME' "$CODEBASE" >>"$LISTED" || true
grep -oE '^departure\.sh' "$CODEBASE" >>"$LISTED" || true

# Annotated directory trees: a fenced block whose first line is a folder
# (for example "work/" or "src/"). Nesting is rebuilt from the indent width, so
# the comments cannot mislead the parser. Box-drawing glyphs are multibyte, so
# they are deleted by byte range under LC_ALL=C before the indent is measured.
#
# A root line is a display label. When it does not name a real folder here, its
# entries are read as repository-root paths, so a clone in a differently named
# directory still checks.
ROOT_LABELS="$(awk '
  /^```/ { inblock = !inblock; pending = inblock; next }
  inblock && pending {
    if ($0 ~ /^[ \t]*$/) next
    pending = 0
    line = $0
    sub(/#.*/, "", line)
    sub(/[ \t]+$/, "", line)
    if (line ~ /\/$/) print substr(line, 1, length(line) - 1)
  }
' "$CODEBASE" | sort -u)"

AS_ROOT=""
while IFS= read -r label; do
	[ -z "$label" ] && continue
	if [ "$label" != "$REPO_NAME" ] && [ ! -e "$ROOT_DIR/$label" ]; then
		AS_ROOT="$AS_ROOT,$label"
	fi
done <<<"$ROOT_LABELS"

awk -v repo="$REPO_NAME" -v as_root="$AS_ROOT" '
  BEGIN {
    inblock = 0; pending = 0; mode = ""
    n = split(as_root, aliases, ",")
    for (i = 1; i <= n; i++) if (aliases[i] != "") is_alias[aliases[i]] = 1
  }
  /^```/ {
    if (!inblock) { inblock = 1; pending = 1; mode = ""; next }
    inblock = 0; pending = 0; mode = ""; next
  }
  !inblock { next }
  {
    line = $0
    sub(/\r$/, "", line)
    if (line ~ /^[ \t]*$/) next

    if (pending) {
      pending = 0
      name = line
      sub(/#.*/, "", name)
      sub(/[ \t]+$/, "", name)
      if (name ~ /\/$/) {
        mode = "tree"
        root = substr(name, 1, length(name) - 1)
        prefix = (root == repo || (root in is_alias)) ? "" : root "/"
      }
      next
    }

    if (mode != "tree") next

    sub(/#.*/, "", line)
    gsub(/[\x80-\xff]/, "", line)
    sub(/[ \t]+$/, "", line)
    if (line ~ /^[^ \t]/) next

    leading = length(line) - length(ltrim(line))
    # Removing the glyphs leaves 3 spaces per "│   " level plus 1 for the final
    # "├── ", so leading spaces = 3 * (depth - 1) + 1.
    depth = int(leading / 3) + 1

    n = split(line, parts, /[ \t]+/)
    if (n == 0) next
    entry = parts[n]
    if (entry == "") next
    sub(/\/$/, "", entry)

    stack[depth] = entry
    for (d = depth + 1; d <= 64; d++) delete stack[d]

    path = prefix
    for (d = 1; d <= depth; d++) path = path stack[d] (d < depth ? "/" : "")
    print path
  }

  function ltrim(s) { sub(/^[ \t]+/, "", s); return s }
' "$CODEBASE" >>"$LISTED"

# Trim trailing non-path characters, drop blanks, deduplicate.
sed -i 's/[`)>[:space:]].*$//' "$LISTED"
grep -v '^$' "$LISTED" | sort -u >"$LISTED.sorted"
mv "$LISTED.sorted" "$LISTED"

# ─── Forward check: documented paths must exist ───────────────────────────────

echo "=== Checking CODEBASE.md paths exist on disk ==="
missing=0
while IFS= read -r path; do
	[ -z "$path" ] && continue
	if [ ! -e "$ROOT_DIR/$path" ]; then
		echo "MISSING: $path"
		missing=$((missing + 1))
	fi
done <"$LISTED"
echo "$missing missing"

# ─── Reverse check: repository files must be documented ───────────────────────

echo "=== Checking repository files are listed in CODEBASE.md ==="

if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
	# --others --exclude-standard adds new files that are not ignored, so a file
	# created during this session is checked before it is ever committed.
	git -C "$ROOT_DIR" ls-files --cached --others --exclude-standard >"$TMP_DIR/tracked"
else
	# No git available: walk the working tree and skip the usual noise.
	find "$ROOT_DIR" -type d \( -name .git -o -name node_modules \) -prune -o \
		-type f -printf '%P\n' >"$TMP_DIR/tracked"
fi

unlisted=0
while IFS= read -r file; do
	[ -z "$file" ] && continue
	# Deleted-but-still-tracked files are reported by the forward pass instead.
	[ -e "$ROOT_DIR/$file" ] || continue

	covered=0
	for dir in "${FOLDER_LEVEL[@]}"; do
		case "$file" in
		"$dir"/*)
			covered=1
			break
			;;
		esac
	done
	[ "$covered" -eq 1 ] && continue

	if grep -qxF -- "$file" "$LISTED"; then
		continue
	fi
	# Any mention anywhere in the document counts, including prose and comments.
	if grep -qF -- "$file" "$CODEBASE"; then
		continue
	fi

	echo "UNLISTED: $file"
	unlisted=$((unlisted + 1))
done <"$TMP_DIR/tracked"
echo "$unlisted unlisted"

# ─── Result ───────────────────────────────────────────────────────────────────

total=$((missing + unlisted))
if [ "$total" -eq 0 ]; then
	echo "=== CODEBASE.md and the repository are in sync ==="
	exit 0
fi

echo "=== $total problem(s): $missing missing, $unlisted unlisted ==="
exit 1
