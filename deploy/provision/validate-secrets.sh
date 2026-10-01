#!/usr/bin/env bash
# Checks /etc/care-y/secrets.env without printing any value or line of it:
# every check is a stat or a quiet pattern match. Prints the names of failed
# checks only and exits nonzero when any fails. Run after every edit.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require_root

failed=()
fail() { failed+=("$1"); }

file="$CAREY_SECRETS_FILE"
if [ -L "$file" ] || [ ! -f "$file" ]; then
  fail "secrets-file-present"
else
  [ "$(stat -c '%a:%U' "$file")" = "600:$CAREY_SERVICE_USER" ] || fail "secrets-file-mode-owner"
  [ "$(stat -c '%a:%U:%G' "$CAREY_SECRETS_DIR")" = "750:root:$CAREY_SERVICE_USER" ] ||
    fail "secrets-dir-mode-owner"
  grep -qE '^OPS_SECRETS_KEY=[0-9a-f]{64}$' "$file" || fail "ops-key-format"
  [ "$(grep -c '^OPS_SECRETS_KEY=' "$file")" = "1" ] || fail "ops-key-single"
  if grep -q $'\r' "$file"; then
    fail "no-crlf"
  fi
  if grep -qE "^[A-Za-z_][A-Za-z0-9_]*=[\"']" "$file"; then
    fail "no-quoted-values"
  fi
  [ -z "$(grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' "$file" | sort | uniq -d)" ] || fail "unique-keys"
fi

if [ "${#failed[@]}" -gt 0 ]; then
  for name in "${failed[@]}"; do
    printf 'FAIL %s\n' "$name"
  done
  die "secrets file validation failed (${#failed[@]} check(s))"
fi
log "secrets file checks passed"
