#!/usr/bin/env bash
# Validate that the newest CHANGELOG.md entry follows the wrap-up format:
# version header, metadata bullets (why, model, tags), and category headings.
set -euo pipefail

FILE="${1:-CHANGELOG.md}"

if [ ! -f "$FILE" ]; then
	echo "Error: $FILE not found" >&2
	exit 1
fi

fail() {
	echo "FAIL: $1" >&2
	exit 1
}

# First version heading must be [x.y.z] - YYYY-MM-DD
head -n 1 "$FILE" | grep -q '^# Changelog' || fail "file must start with '# Changelog'"

HEADER=$(grep -n -m1 '^## \[' "$FILE")
grep -m1 '^## \[' "$FILE" | grep -qE '^## \[[0-9]+\.[0-9]+\.[0-9]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$' ||
	fail "version header must match '## [x.y.z] - YYYY-MM-DD' (found: $HEADER)"

# Metadata bullets in the newest entry (between first and second version heading)
BODY=$(awk '/^## \[/{c++} c==2{exit} c==1{print}' "$FILE")
echo "$BODY" | grep -q '^- \*\*why:\*\*' || fail "newest entry missing '- **why:**' bullet"
echo "$BODY" | grep -q '^- \*\*model:\*\*' || fail "newest entry missing '- **model:**' bullet"
echo "$BODY" | grep -q '^- \*\*tags:\*\*' || fail "newest entry missing '- **tags:**' bullet"
echo "$BODY" | grep -q '^### ' || fail "newest entry has no category heading (Added/Changed/Fixed/...)"

echo "OK: newest changelog entry is valid"
