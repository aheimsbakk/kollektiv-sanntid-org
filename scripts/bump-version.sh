#!/usr/bin/env bash
# Bump version in sw.js and config.js according to SemVer

set -euo pipefail

SW_FILE="src/sw.js"
CONFIG_FILE="src/config.js"

if [ ! -f "$SW_FILE" ]; then
  echo "Error: $SW_FILE not found" >&2
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: $CONFIG_FILE not found" >&2
  exit 1
fi

# Extract current version
CURRENT=$(grep -oP "const VERSION = '\K[0-9]+\.[0-9]+\.[0-9]+" "$SW_FILE" || echo "")
if [ -z "$CURRENT" ]; then
  echo "Error: VERSION not found in $SW_FILE" >&2
  exit 1
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

# Determine bump type
BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Usage: $0 [major|minor|patch]" >&2
    echo "  major - Breaking changes (x.0.0)" >&2
    echo "  minor - New features (0.x.0)" >&2
    echo "  patch - Bug fixes (0.0.x) [default]" >&2
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update sw.js
sed -i "s/const VERSION = '[0-9.]*';/const VERSION = '$NEW_VERSION';/" "$SW_FILE"

# Update config.js
sed -i "s/export const VERSION = '[0-9.]*';/export const VERSION = '$NEW_VERSION';/" "$CONFIG_FILE"

echo "Version bumped: $CURRENT → $NEW_VERSION"
echo "Updated: $SW_FILE, $CONFIG_FILE"
