#!/usr/bin/env bash
set -euo pipefail

# fix_worklogs.sh
# Auto-fix worklog files staged for commit so they conform to agent/WORKLOG_TEMPLATE.md
# Usage: run during pre-commit. It reads staged files from git index and updates workspace
# files (then re-stages them) to ensure strict front-matter keys/order, valid timestamp,
# bracketed tags, and 1-3 sentence body.

REQUIRED_KEYS=(when why what model tags)
DEFAULT_MODEL="github-copilot/gpt-5-mini"

iso_now() { date -u +%Y-%m-%dT%H:%M:%SZ; }

STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)
if [ -z "$STAGED" ]; then
  # nothing staged
  exit 0
fi

updated_paths=()

for path in $STAGED; do
  case "$path" in
    agent/worklogs/*.md)
      echo "Checking worklog: $path"
      # read staged content if present, otherwise workspace file
      if content=$(git show ":$path" 2>/dev/null); then :; else content=$(cat "$path" 2>/dev/null || true); fi

      # extract front-matter and body
      front=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {exit} } ins==1{print}')
      front=$(printf '%s' "$front" | tr -d '\r')
      body=$(printf '%s' "$content" | awk 'BEGIN{ins=0} /^---$/ { if(ins==0){ins=1; next} else {ins=2; next}} ins==2{print}')
      body_trim=$(printf '%s' "$body" | sed 's/^\s\+//;s/\s\+$//')

      # parse existing front into associative array
      declare -A kv
      if [ -n "$front" ]; then
        while IFS= read -r line; do
          # skip empty lines
          [ -z "$line" ] && continue
          if echo "$line" | grep -qE "^[A-Za-z0-9_-]+:\s*.+"; then
            key=$(printf '%s' "$line" | sed -n 's/^\s*\([A-Za-z0-9_-]\+\)\s*:.*/\1/p')
            val=$(printf '%s' "$line" | sed -n 's/^\s*[A-Za-z0-9_-]\+:\s*\(.*\)/\1/p')
            kv["$key"]="$val"
          else
            # malformed line - ignore and treat as potential body
            :
          fi
        done <<EOF
${front}
EOF
      fi

      # ensure required keys exist and normalize values
      for k in "${REQUIRED_KEYS[@]}"; do
        v="${kv[$k]:-}"
        case "$k" in
          when)
            if [ -z "$v" ] || ! date -d "$v" >/dev/null 2>&1; then
              kv[when]="$(iso_now)"
            fi
            ;;
          why)
            if [ -z "$v" ]; then kv[why]="auto-fixed: concise why"; fi
            ;;
          what)
            if [ -z "$v" ]; then
              # derive a brief what from filename after timestamp
              base=$(basename "$path" .md)
              # remove leading date prefix 'YYYY-MM-DD-HH-mm-'
              what_default=$(printf '%s' "$base" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-//')
              kv[what]="$what_default"
            fi
            ;;
          model)
            if [ -z "$v" ]; then kv[model]="$DEFAULT_MODEL"; fi
            ;;
          tags)
            if [ -z "$v" ]; then kv[tags]="[auto-fixed]"; else
              # ensure bracketed list
              tv="$v"
              tv=$(printf '%s' "$tv" | sed 's/^\s*//;s/\s*$//')
              if ! echo "$tv" | grep -q '^\['; then
                # convert comma-separated words to bracketed form
                tv="[$(printf '%s' "$tv" | sed 's/^\[//;s/\]$//') ]"
                tv=$(printf '%s' "$tv" | sed 's/\s\+/,/g; s/, ,/,/g; s/,]/]/')
              fi
              kv[tags]="$tv"
            fi
            ;;
        esac
      done

      # truncate body to 1-3 sentences
      if [ -z "$body_trim" ]; then
        body_trim="Auto-fixed worklog body: concise summary added by pre-commit."
      else
        # capture sentence terminators, keep up to 3 sentences
        # split by sentence enders .!? followed by space or EOL
        SENTENCES=$(printf '%s' "$body_trim" | sed -n '1,120p' | awk '{gsub(/\r/,"") ; print}' | tr '\n' ' ' | perl -0777 -pe 's/\s+/ /g' | perl -0777 -ne 'while(/.*?[\.!?](?:\s|$)/g){print $&}"\n"' || true)
        if [ -n "$SENTENCES" ]; then
          # take first three sentences
          newbody=""
          i=0
          while IFS= read -r s; do
            [ -z "$s" ] && continue
            i=$((i+1))
            newbody+="$s"
            if [ "$i" -ge 3 ]; then break; fi
          done <<EOF
$SENTENCES
EOF
          # fallback: if newbody empty, fall back to original trimmed body
          if [ -n "$newbody" ]; then body_trim="$newbody"; fi
        fi
      fi

      # write normalized file: exact key order, then body
      tmp=$(mktemp)
      {
        echo "---"
        for k in "${REQUIRED_KEYS[@]}"; do
          printf '%s: %s\n' "$k" "${kv[$k]}"
        done
        echo "---"
        echo
        printf '%s\n' "$body_trim"
      } > "$tmp"

      # replace workspace file
      mv "$tmp" "$path"
      git add "$path"
      updated_paths+=("$path")
      ;;
    *)
      ;;
  esac
done

if [ ${#updated_paths[@]} -gt 0 ]; then
  echo "Re-validated and staged fixed worklogs:"; printf '%s\n' "${updated_paths[@]}"
  # run validator on the fixed files
  ./scripts/validate_worklogs.sh "${updated_paths[@]}"
  rc=$?
  if [ $rc -ne 0 ]; then
    echo "Validation still failing after auto-fix. Abort commit." >&2
    exit 1
  fi
fi

exit 0
