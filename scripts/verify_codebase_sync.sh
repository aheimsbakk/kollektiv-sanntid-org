#!/usr/bin/env bash
# verify_codebase_sync.sh
# Validates that all physical file paths listed in CODEBASE.md actually exist.
# Run this after any code or documentation changes that alter files or paths.
#
# Usage: ./scripts/verify_codebase_sync.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CODEBASE="$ROOT_DIR/CODEBASE.md"
ERRORS=0

if [ ! -f "$CODEBASE" ]; then
  echo "ERROR: CODEBASE.md not found at $CODEBASE"
  exit 1
fi

echo "=== Verifying CODEBASE.md physical paths ==="

# Use C locale for predictable regex behavior
export LC_ALL=C

# Collect all unique paths from CODEBASE.md
# Paths in subdirectories: known prefix followed by alphanumeric, dots, underscores, hyphens, slashes
ALL_PATHS=$(grep -oE '(src|tests|scripts|docs|.githooks|.opencode)/[a-zA-Z0-9_./-]+' "$CODEBASE" || true)

# Root-level files (md, json, sh, ico, svg, txt, xml, webmanifest, noext)
ALL_PATHS="$ALL_PATHS
$(grep -oE '^[a-zA-Z][a-zA-Z0-9_.-]+\.(md|json|sh|js|mjs|yml|yaml|ico|svg|txt|xml|webmanifest|html|css)' "$CODEBASE" || true)
$(grep -oE '^CNAME' "$CODEBASE" || true)
$(grep -oE '^departure\.sh' "$CODEBASE" || true)"

# Sort unique and filter lines
ALL_PATHS=$(echo "$ALL_PATHS" | sort -u)

while IFS= read -r path; do
  [ -z "$path" ] && continue
  # Strip trailing non-path characters: backticks, closing parens, spaces, etc.
  path=$(echo "$path" | sed 's/[`)>[:space:]].*$//')
  [ -z "$path" ] && continue

  full_path="$ROOT_DIR/$path"
  if [ ! -e "$full_path" ] && [ ! -d "$full_path" ]; then
    echo "MISSING: $path"
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$ALL_PATHS"

if [ "$ERRORS" -eq 0 ]; then
  echo "=== All paths verified successfully ==="
  exit 0
else
  echo "=== $ERRORS path(s) missing ==="
  exit 1
fi
