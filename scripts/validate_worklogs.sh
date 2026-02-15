#!/usr/bin/env bash
set -euo pipefail

# Validate staged worklog files follow the strict AGENT.md front-matter

STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)
if [ -z "$STAGED" ]; then
  exit 0
fi

ERR=0
ERRS=()

REQUIRED_SEQ="when,why,what,model,tags"

for path in $STAGED; do
  case "$path" in
    agent/worklogs/*.md)
      # ignore archived
      if echo "$path" | grep -q "/archived/"; then
        continue
      fi
      # read staged content from git index if available
      if content=$(git show ":$path" 2>/dev/null); then
        :
      else
        if ! content=$(cat "$path" 2>/dev/null); then
          ERRS+=("$path: cannot read staged or workspace file")
          ERR=1
          continue
        fi
      fi

      # extract front-matter between the first pair of --- markers
      # use a safer variable name in awk ('ins') to avoid reserved word conflicts
      front=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {exit} } ins==1{print}')
      if [ -z "$front" ]; then
        ERRS+=("$path: missing required YAML front-matter (--- ... ---)")
        ERR=1
        continue
      fi

      # extract keys in order from the front matter
      keys=$(printf '%s' "$front" | sed -n 's/^\s*\([A-Za-z0-9_-]\+\)\s*:.*/\1/p' | tr '\n' ',' | sed 's/,$//')
      if [ "$keys" != "$REQUIRED_SEQ" ]; then
        ERRS+=("$path: YAML keys must be exactly in order: $REQUIRED_SEQ (found: ${keys:-<none>})")
        ERR=1
        continue
      fi

      # ensure each front-matter line matches key: value (no empty values)
      nonconforming=$(printf '%s' "$front" | sed -n '1,120p' | awk 'NF{ if ($0 !~ /^[A-Za-z0-9_-]+:\s*.+$/) print NR ": " $0 }')
      if [ -n "$nonconforming" ]; then
        ERRS+=("$path: front-matter contains malformed lines: $nonconforming")
        ERR=1
        continue
      fi

      # basic ISO timestamp check for when field
      whenVal=$(printf '%s' "$front" | sed -n 's/^\s*when:\s*\(.*\)/\1/p' | head -n1 | tr -d '\r')
      if [ -z "$whenVal" ]; then
        ERRS+=("$path: 'when' key present but empty")
        ERR=1
      else
        if ! date -d "$whenVal" >/dev/null 2>&1; then
          ERRS+=("$path: 'when' value is not a valid ISO timestamp: $whenVal")
          ERR=1
        fi
      fi

      # tags should be a bracketed list like [a,b]
      tagsVal=$(printf '%s' "$front" | sed -n 's/^\s*tags:\s*\(.*\)/\1/p' | head -n1 | tr -d '\r' | sed 's/^\s*//;s/\s*$//')
      if [ -z "$tagsVal" ]; then
        ERRS+=("$path: 'tags' key present but empty")
        ERR=1
      else
        if ! echo "$tagsVal" | grep -q '^\[.*\]$'; then
          ERRS+=("$path: 'tags' must be a list-like value, e.g. [a,b] (found: $tagsVal)")
          ERR=1
        fi
      fi

      # validate body: must be present and be 1-3 sentences (heuristic)
      body=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {ins=2; next}} ins==2{print}')
      body_trim=$(printf '%s' "$body" | sed 's/^\s\+//;s/\s\+$//')
      if [ -z "$body_trim" ]; then
        ERRS+=("$path: body is empty; worklog body must be 1-3 sentences after front-matter")
        ERR=1
        continue
      fi
      # count sentence terminators as a rough sentence count
      sentence_count=$(printf '%s' "$body_trim" | grep -o '[\.\!?]' | wc -l | tr -d ' ')
      if [ "$sentence_count" -lt 1 ] || [ "$sentence_count" -gt 3 ]; then
        ERRS+=("$path: body should contain 1-3 sentences (found $sentence_count). Keep summary concise.")
        ERR=1
        continue
      fi
      ;;
    *)
      ;;
  esac
done

if [ "$ERR" -ne 0 ]; then
  echo "\nWorklog validation failed for staged worklog files:" >&2
  for e in "${ERRS[@]}"; do
    echo " - $e" >&2
  done
  echo "\nPlease fix the worklog(s) to include the required YAML front-matter with keys in order: $REQUIRED_SEQ" >&2
  exit 1
fi

exit 0
