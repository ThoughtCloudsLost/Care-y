#!/usr/bin/env bash
# Processes org deletion requests. Run as root on the primary host:
#
#   org-erase.sh               every request past its cooling-off (the timer)
#   org-erase.sh --now <slug>  emergency: make that org due now, then the same
#
# care-y-org-erase.timer starts the first form daily. The erasure itself runs
# in a one-off api container (src/cli/org-erase.ts) on the database owner
# role. The pre-deletion snapshot runs here instead, because backup-org.sh
# needs root, restic and restic.env, none of which the api container has:
#
#   1. with --now, `org-erase.ts --request-now <slug>` adopts the org's live
#      request or inserts one, due now
#   2. `org-erase.ts --due` prints "<request id> <org schema>" for every due
#      request whose snapshot is still owed
#   3. for each, backup-org.sh <schema>, then on success
#      `org-erase.ts --snapshot-recorded <request id>`
#   4. `org-erase.ts` processes every due request; one whose snapshot is
#      still owed is deferred, never erased without it
#
# Output carries request and org UUIDs, schema names, step names and error
# class names only; no line names the slug. Exits non-zero when any
# snapshot failed, after the erasure pass has run for the others.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=../backup/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../backup/lib.sh"

BACKUP_ORG="$(dirname "${BASH_SOURCE[0]}")/../backup/backup-org.sh"
UUID_RE='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
OWED_RE="^($UUID_RE) (org_$UUID_RE)\$"

now_slug=""
case $# in
  0) ;;
  2)
    [[ $1 == --now ]] || die "usage: org-erase.sh [--now <slug>]"
    now_slug="$2"
    ;;
  *) die "usage: org-erase.sh [--now <slug>]" ;;
esac

# org_erase [FLAG...]: one run of the erasure CLI in a one-off api container.
# The `--` ends option parsing, so the CLI's strict argument parser takes the
# flags as positionals (the org:erase pnpm script does the same). stdin is
# closed so the container cannot read anything meant for this script.
org_erase() {
  compose run --rm api pnpm --filter @care-y/server exec tsx src/cli/org-erase.ts -- "$@" </dev/null
}

if [[ -n $now_slug ]]; then
  org_erase --request-now "$now_slug"
fi

owed="$(org_erase --due)"
mapfile -t owed_lines <<<"$owed"

snapshot_failed=0
for line in "${owed_lines[@]}"; do
  [[ -n $line ]] || continue
  if [[ ! $line =~ $OWED_RE ]]; then
    # The secrets loader's summary line (key names only) and nothing else.
    printf '%s\n' "$line"
    continue
  fi
  request_id="${BASH_REMATCH[1]}"
  schema="${BASH_REMATCH[2]}"
  if "$BACKUP_ORG" "$schema" </dev/null; then
    org_erase --snapshot-recorded "$request_id"
    log "snapshot recorded for request $request_id"
  else
    # The erasure pass below defers this request until a later run stores
    # its snapshot.
    printf '%s: ERROR: snapshot failed for request %s\n' "$CAREY_SCRIPT" "$request_id" >&2
    snapshot_failed=1
  fi
done

org_erase

((snapshot_failed == 0)) || die "one or more pre-deletion snapshots failed; those requests stay deferred"
