#!/usr/bin/env bash
# Restores a nightly full backup from the restic repository into a new
# database. Run as root on the host whose db container receives the restore:
#
#   restore-full.sh [--skip-globals] [--i-mean-production] \
#     <full-snapshot-id> <globals-snapshot-id> <target-db>
#
# Each nightly run stores two snapshots: carey-full.dump (tag "full") and
# carey-globals.sql (tag "globals"). Pass the pair from the same night, as
# listed by `restic snapshots --tag full` and `restic snapshots --tag globals`.
#
# Steps, in order:
#   1. the roles from the globals snapshot, through psql with ON_ERROR_STOP,
#      so the first failed statement stops the restore. The one statement
#      dropped first is CREATE ROLE for the owner role, which the db image
#      has already created. Where the other roles already exist, pass
#      --skip-globals; psql never continues past an error. The snapshot
#      carries no passwords, so the runtime role comes back with a null
#      password; set it afterwards with deploy/db/create-app-role.sh.
#   2. createdb <target-db>, which fails if the database already exists.
#      With --i-mean-production, a target that exists and holds no user
#      tables (the empty database the db image creates) is used as it is;
#      one that holds tables stops the restore before anything is written.
#   3. pg_restore of the full dump into <target-db>, objects owned by carey.
#   4. every key_version in public.telephony_config and public.vapid_config
#      must be listed in /etc/care-y/ops-key-versions.
#
# <target-db> is a scratch database for drills. Restoring into the live
# database name (carey) is refused unless --i-mean-production is given.
#
# Exit codes: 1 for usage errors and failed steps, 2 when the key inventory
# is missing, unreadable or malformed, or when the restored rows carry a
# key_version it does not list. Prints snapshot IDs, the target and error
# lines only, never dump content.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

usage="usage: restore-full.sh [--skip-globals] [--i-mean-production] <full-snapshot-id> <globals-snapshot-id> <target-db>"

skip_globals="no"
production="no"
positional=()
for arg in "$@"; do
  case $arg in
    --skip-globals) skip_globals="yes" ;;
    --i-mean-production) production="yes" ;;
    -*) die "unknown option $arg; $usage" ;;
    *) positional+=("$arg") ;;
  esac
done
((${#positional[@]} == 3)) || die "$usage"
full_snapshot="${positional[0]}"
globals_snapshot="${positional[1]}"
target="${positional[2]}"

# restic snapshot IDs are hex, short (8) or full (64). "latest" is not
# accepted: a restore names the exact snapshot it restores.
for snapshot in "$full_snapshot" "$globals_snapshot"; do
  [[ $snapshot =~ ^[0-9a-f]{8,64}$ ]] || die "snapshot IDs must be restic snapshot IDs (hex); $usage"
done
[[ $target =~ ^[a-z_][a-z0-9_]{0,62}$ ]] ||
  die "target database name must match ^[a-z_][a-z0-9_]*\$ (at most 63 characters)"
if [[ $target == "$CAREY_DB_NAME" && $production != "yes" ]]; then
  die "refusing to restore into the live database $CAREY_DB_NAME without --i-mean-production"
fi

# --- Key inventory pre-flight -----------------------------------------------
# A missing or empty inventory is an error, so a fresh host cannot skip the
# key check by accident.
[[ -f $CAREY_KEY_INVENTORY && -r $CAREY_KEY_INVENTORY ]] || {
  echo "restore-full: key inventory $CAREY_KEY_INVENTORY missing or unreadable" >&2
  exit 2
}
# grep exits 1 when it selects nothing (handled below) and 2 on a read error.
rc=0
held=$(grep -vE '^[[:space:]]*(#|$)' "$CAREY_KEY_INVENTORY") || rc=$?
((rc <= 1)) || {
  echo "restore-full: key inventory $CAREY_KEY_INVENTORY could not be read" >&2
  exit 2
}
[[ -n $held ]] || {
  echo "restore-full: key inventory lists no versions" >&2
  exit 2
}
if grep -qvxE '[0-9]+' <<<"$held"; then
  echo "restore-full: every non-comment line in $CAREY_KEY_INVENTORY must be one key_version number" >&2
  exit 2
fi

# --- Target database pre-flight, before any write ----------------------------
# The db image creates an empty database named by POSTGRES_DB, the live name,
# so under --i-mean-production createdb would always fail. With the flag, an
# existing target with no user tables is restored into as it is, and one
# with tables stops the restore. Without the flag, createdb must succeed. Both queries
# only read, and go on stdin because psql interpolates :'target' in script
# input but not in -c strings.
create_target="yes"
if [[ $production == "yes" ]]; then
  target_exists=$(compose exec -T db psql -U "$CAREY_DB_OWNER" -d postgres -X -q -At \
    -v ON_ERROR_STOP=1 -v target="$target" <<'SQL'
select count(*) from pg_database where datname = :'target';
SQL
  ) || die "could not check whether database $target exists"
  if [[ $target_exists != 0 ]]; then
    user_tables=$(compose exec -T db psql -U "$CAREY_DB_OWNER" -d "$target" -X -q -At \
      -v ON_ERROR_STOP=1 <<'SQL'
select count(*) from pg_tables where schemaname not in ('pg_catalog', 'information_schema');
SQL
    ) || die "could not count the tables in database $target"
    [[ $user_tables == 0 ]] ||
      die "database $target is not empty ($user_tables tables); drop it first or restore under another name"
    create_target="no"
  fi
fi

# --- Restore ----------------------------------------------------------------
# drop_owner_create: copies stdin to stdout without the one line
# `CREATE ROLE <owner>;`, matched as a fixed string against the whole line.
# The db image already created the owner role from POSTGRES_USER, so that
# statement would fail on every host and stop psql under ON_ERROR_STOP.
# pg_dumpall emits the CREATE only so the ALTER ROLE after it sets the
# properties either way; its source (pg_dumpall.c, dumpRoles) says:
#   "We dump CREATE ROLE followed by ALTER ROLE to ensure that the role
#    will acquire the right properties even if it already exists (ie, it
#    won't hurt for the CREATE to fail)."
# grep exits 1 when it selects no line (an empty stream) and 2 on an error;
# only 2 fails the pipeline.
drop_owner_create() {
  local rc=0
  grep -vxF -e "CREATE ROLE $CAREY_DB_OWNER;" || rc=$?
  ((rc <= 1))
}

if [[ $skip_globals == "yes" ]]; then
  log "globals snapshot $globals_snapshot not restored (--skip-globals)"
else
  restic dump "$globals_snapshot" carey-globals.sql |
    drop_owner_create |
    compose exec -T db psql -U "$CAREY_DB_OWNER" -d postgres -X -q -v ON_ERROR_STOP=1
  log "roles restored from globals snapshot $globals_snapshot"
  log "restored roles have no password; set the runtime role password with deploy/db/create-app-role.sh 3< <password-file>"
fi

if [[ $create_target == "yes" ]]; then
  compose exec -T db createdb -U "$CAREY_DB_OWNER" "$target"
  log "created database $target"
else
  log "database $target exists and holds no tables; restoring into it"
fi

restic dump "$full_snapshot" carey-full.dump |
  compose exec -T db pg_restore -U "$CAREY_DB_OWNER" -d "$target" --no-owner --role="$CAREY_DB_OWNER"
log "full snapshot $full_snapshot restored into $target"

# --- Key version check --------------------------------------------------------
# key_version is a column, so only the inventory can say which versions the
# operator can still decrypt. The query runs on its own so a failure stops
# the script instead of reading as "no versions found".
versions=$(compose exec -T db psql -U "$CAREY_DB_OWNER" -d "$target" -X -Atc \
  "select distinct key_version from public.telephony_config union select distinct key_version from public.vapid_config")
missing=""
if [[ -n $versions ]]; then
  # grep exits 1 when every version is held (the passing case) and 2 on an
  # error.
  rc=0
  missing=$(grep -vxF -f <(printf '%s\n' "$held") <<<"$versions") || rc=$?
  ((rc <= 1)) || die "key version comparison failed"
fi
if [[ -n $missing ]]; then
  echo "restore-full: rows sealed under key_version(s) not in $CAREY_KEY_INVENTORY: ${missing//$'\n'/, }" >&2
  echo "restore-full: the database is restored but telephony and push config for those rows cannot be decrypted; retrieve the retired key from escrow (ops-key-rotation.md) before serving traffic" >&2
  exit 2
fi
log "every key_version in $target is listed in $CAREY_KEY_INVENTORY"
