#!/usr/bin/env bash
set -euo pipefail

# validate_worklogs.sh
# Validate one or more worklog files follow the strict AGENT.md front-matter
# Usage:
#   ./scripts/validate_worklogs.sh [file ...]
# If no files are provided the script validates staged files in the git index
# (original behavior). Supports -h/--help and -v/--version.

VERSION="0.2.0"
REQUIRED_SEQ="when,why,what,model,tags"

print_help() {
  cat <<'EOF'
validate_worklogs.sh - validate agent worklog front-matter and body

Usage:
  ./scripts/validate_worklogs.sh [path ...]

If one or more paths are provided, those files are validated from the
workspace. If no paths are provided the script inspects staged files in the
git index (added/modified/renamed) and validates any matching
`agent/worklogs/*.md` files.

Options:
  -h, --help       Show this help message and exit
  -v, --version    Show version and exit

Examples:
  ./scripts/validate_worklogs.sh agent/worklogs/2026-02-15-add-emoji-mapping.md
  ./scripts/validate_worklogs.sh   # validate staged files
EOF
}

print_version() { printf "%s\n" "$VERSION"; }

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  print_help
  exit 0
fi
if [ "${1:-}" = "-v" ] || [ "${1:-}" = "--version" ]; then
  print_version
  exit 0
fi

ARGS=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help)
      print_help; exit 0;;
    -v|--version)
      print_version; exit 0;;
    --) shift; break;;
    -*) echo "Unknown option: $1" >&2; exit 2;;
    *) ARGS+=("$1"); shift;;
  esac
done

ERR=0
ERRS=()
total=0
passed=0
failed=0

validate_content() {
  local path="$1" content="$2"
  local front body body_trim keys nonconforming whenVal tagsVal sentence_count msg

  front=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {exit} } ins==1{print}')
  # normalize CR characters which can break regex tests (Windows CRLF)
  front=$(printf '%s' "$front" | tr -d '\r')
  if [ -z "$front" ]; then
    msg="$path: missing required YAML front-matter (--- ... ---)"
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  fi

  keys=$(printf '%s' "$front" | sed -n 's/^\s*\([A-Za-z0-9_-]\+\)\s*:.*/\1/p' | tr '\n' ',' | sed 's/,$//')
  if [ "$keys" != "$REQUIRED_SEQ" ]; then
    msg="$path: YAML keys must be exactly in order: $REQUIRED_SEQ (found: ${keys:-<none>})"
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  fi

  # robust per-line validation of front-matter lines to avoid awk/locale surprises
  nonconforming=""
  i=0
  while IFS= read -r line; do
    i=$((i+1))
    # skip empty lines
    if [ -z "${line}" ]; then
      continue
    fi
    if ! [[ "${line}" =~ ^[A-Za-z0-9_-]+:[[:space:]]+.+$ ]]; then
      nonconforming+="$i: ${line}\n"
    fi
  done <<EOF
$(printf '%s' "$front" | sed -n '1,120p')
EOF
  if [ -n "$nonconforming" ]; then
    msg="$path: front-matter contains malformed lines:\n${nonconforming}"
    echo "  ✖ $path: front-matter malformed (showing block)"
    printf '%s\n' "$front" | sed 's/^/    /'
    ERRS+=("$msg")
    return 1
  fi

  whenVal=$(printf '%s' "$front" | sed -n 's/^\s*when:\s*\(.*\)/\1/p' | head -n1)
  if [ -z "$whenVal" ]; then
    msg="$path: 'when' key present but empty"
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  else
    if ! date -d "$whenVal" >/dev/null 2>&1; then
      msg="$path: 'when' value is not a valid ISO timestamp: $whenVal"
      echo "  ✖ $msg"
      ERRS+=("$msg")
      return 1
    fi
  fi

  tagsVal=$(printf '%s' "$front" | sed -n 's/^\s*tags:\s*\(.*\)/\1/p' | head -n1 | sed 's/^\s*//;s/\s*$//')
  if [ -z "$tagsVal" ]; then
    msg="$path: 'tags' key present but empty"
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  else
    if ! echo "$tagsVal" | grep -q '^\[.*\]$'; then
      msg="$path: 'tags' must be a list-like value, e.g. [a,b] (found: $tagsVal)"
      echo "  ✖ $msg"
      ERRS+=("$msg")
      return 1
    fi
  fi

  body=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {ins=2; next}} ins==2{print}')
  body_trim=$(printf '%s' "$body" | sed 's/^\s\+//;s/\s\+$//')
  if [ -z "$body_trim" ]; then
    msg="$path: body is empty; worklog body must be 1-3 sentences after front-matter"
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  fi
  sentence_count=$(printf '%s' "$body_trim" | grep -o '[\.\!?]' | wc -l | tr -d ' ')
  if [ "$sentence_count" -lt 1 ] || [ "$sentence_count" -gt 3 ]; then
    msg="$path: body should contain 1-3 sentences (found $sentence_count). Keep summary concise."
    echo "  ✖ $msg"
    ERRS+=("$msg")
    return 1
  fi

  echo "  ✓ ok"
  return 0
}

validate_path() {
  local path="$1"
  # only consider agent/worklogs/*.md
  case "$path" in
    agent/worklogs/*.md)
      total=$((total+1))
      echo "Validating worklog: $path"
      if echo "$path" | grep -q "/archived/"; then
        echo "  - skipped (archived)"
        return 0
      fi

      # read staged content if no explicit args (we'll check git index), else read workspace file
      local content
      if [ ${#ARGS[@]} -eq 0 ]; then
        if content=$(git show ":$path" 2>/dev/null); then :; else
          if ! content=$(cat "$path" 2>/dev/null); then
            ERRS+=("$path: cannot read staged or workspace file")
            echo "  ✖ $path: cannot read staged or workspace file"
            failed=$((failed+1))
            ERR=1
            return 1
          fi
        fi
      else
        if ! content=$(cat "$path" 2>/dev/null); then
          ERRS+=("$path: cannot read workspace file")
          echo "  ✖ $path: cannot read workspace file"
          failed=$((failed+1))
          ERR=1
          return 1
        fi
      fi

      if validate_content "$path" "$content"; then
        passed=$((passed+1))
      else
        failed=$((failed+1))
        ERR=1
      fi
      ;;
    *)
      # ignore other files
      ;;
  esac
}

if [ ${#ARGS[@]} -eq 0 ]; then
  # No arguments: validate staged files matching the pattern
  STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)
  if [ -z "$STAGED" ]; then
    echo "No staged files to validate.";
    exit 0
  fi
  for path in $STAGED; do
    validate_path "$path"
  done
else
  for p in "${ARGS[@]}"; do
    validate_path "$p"
  done
fi

echo
printf "Worklog validation summary: total=%d, passed=%d, failed=%d\n" "$total" "$passed" "$failed"
if [ "$ERR" -ne 0 ]; then
  echo
  echo "Errors:" >&2
  for e in "${ERRS[@]}"; do
    echo " - $e" >&2
  done
  echo
  echo "Fix worklogs to match agent/WORKLOG_TEMPLATE.md (front-matter keys in order: $REQUIRED_SEQ)" >&2
  exit 1
else
  exit 0
fi
