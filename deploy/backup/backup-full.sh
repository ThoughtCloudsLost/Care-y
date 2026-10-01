#!/usr/bin/env bash
# Nightly full backup of the CARE-Y database into the restic repository on
# the backup host. Started by care-y-backup.timer; runs as root.
#
# Two snapshots per run: a pg_dump -Fc of the carey database tagged "full",
# and pg_dumpall --globals-only tagged "globals" (the roles and their grants,
# which pg_dump leaves out, without their passwords). A sample of the repository is then read back and
# verified, and only after that does the heartbeat go out: the heartbeat
# means a verified snapshot exists, not that the script ran.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

db_backup carey-full.dump full pg_dump -U "$CAREY_DB_OWNER" -Fc "$CAREY_DB_NAME"
log "full dump stored"
# --no-role-passwords (pg_dumpall docs: "When restored, roles will have a null password"): a backup carries no host's role passwords and a restore never overwrites the target host's own.
db_backup carey-globals.sql globals pg_dumpall -U "$CAREY_DB_OWNER" --globals-only --no-role-passwords
log "globals stored"
restic check --read-data-subset=5% --quiet
log "repository check passed"
heartbeat
