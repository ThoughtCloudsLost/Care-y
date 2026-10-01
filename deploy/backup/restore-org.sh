#!/usr/bin/env bash
# Restores one org's tenant schema from a backup-org.sh snapshot into an
# existing database. Run as root on the host whose db container receives
# the restore:
#
#   restore-org.sh [--replace] [--allow-no-telephony] [--i-mean-production] \
#     <snapshot-id> <org_schema> <target-db>
#
# A per-org dump holds the tenant schema only, not the public schema it
# refers to, so the target must already carry the platform rows. Before
# anything is written, all of these must pass, or the script exits 3 with
# one line per failure:
#   1. public.orgs in <target-db> has the row whose schema_name is
#      <org_schema>.
#   2. public.telephony_config has that org's row, sealed under a
#      key_version listed in /etc/care-y/ops-key-versions. An org created
#      without telephony has no row; pass --allow-no-telephony for it.
#   3. <org_schema> does not exist in <target-db>. With --replace it is
#      dropped (cascade) before the restore instead.
#
# <target-db> is a scratch database for drills. Restoring into the live
# database name (carey) is refused unless --i-mean-production is given.
#
# After a restore into the live database, the script runs
# `migrate.ts --schema=<org_schema>` (the dump may predate the newest tenant
# migration) and then `migrate.ts --grants`. A restore into any other
# database skips both: the schema there is left unmigrated, with no grants
# for the runtime role, and is for inspection only.
#
# Exit codes: 1 for usage errors and failed steps, 3 for a failed pre-flight
# check. Prints snapshot IDs, schema names and error lines only, never dump
# or row content.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

usage="usage: restore-org.sh [--replace] [--allow-no-telephony] [--i-mean-production] <snapshot-id> <org_schema> <target-db>"

replace="no"
allow_no_telephony="no"
production="no"
positional=()
for arg in "$@"; do
  case $arg in
    --replace) replace="yes" ;;
    --allow-no-telephony) allow_no_telephony="yes" ;;
    --i-mean-production) production="yes" ;;
    -*) die "unknown option $arg; $usage" ;;
    *) positional+=("$arg") ;;
  esac
done
((${#positional[@]} == 3)) || die "$usage"
snapshot="${positional[0]}"
schema="${positional[1]}"
target="${positional[2]}"

# restic snapshot IDs are hex, short (8) or full (64). "latest" is not
# accepted: a restore names the exact snapshot it restores.
[[ $snapshot =~ ^[0-9a-f]{8,64}$ ]] || die "snapshot ID must be a restic snapshot ID (hex); $usage"
# Same shape as orgSchemaNameSchema in @care-y/shared. The name reaches SQL
# only as a psql variable, quoted as a literal (:'schema') or through
# format('%I'), never spliced into the statement text.
[[ $schema =~ ^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] ||
  die "org schema must be org_<uuid> in lowercase"
[[ $target =~ ^[a-z_][a-z0-9_]{0,62}$ ]] ||
  die "target database name must match ^[a-z_][a-z0-9_]*\$ (at most 63 characters)"
if [[ $target == "$CAREY_DB_NAME" && $production != "yes" ]]; then
  die "refusing to restore into the live database $CAREY_DB_NAME without --i-mean-production"
fi

# target_sql: runs the SQL on stdin in the target database with :'schema'
# bound to the validated schema name. psql interpolates variables in script
# input but not in -c strings. That is why every query here goes on stdin.
target_sql() {
  compose exec -T db psql -U "$CAREY_DB_OWNER" -d "$target" -X -q -At \
    -v ON_ERROR_STOP=1 -v schema="$schema"
}

# --- Pre-flight, before any write -------------------------------------------
failures=()

# 1. The platform row for the org.
if org_rows=$(target_sql <<'SQL'
select count(*) from public.orgs where schema_name = :'schema';
SQL
); then
  [[ $org_rows == 1 ]] ||
    failures+=("public.orgs in $target has no row for $schema; restore the platform tables first (restore-full.sh)")
else
  failures+=("could not read public.orgs in $target")
fi

# 2. The org's telephony_config row and its key_version. A missing or empty
# inventory is a failure, so a fresh host cannot skip the check by accident.
held=""
if [[ -f $CAREY_KEY_INVENTORY && -r $CAREY_KEY_INVENTORY ]]; then
  # grep exits 1 when it selects nothing (handled below) and 2 on a read error.
  rc=0
  held=$(grep -vE '^[[:space:]]*(#|$)' "$CAREY_KEY_INVENTORY") || rc=$?
  if ((rc > 1)); then
    held=""
    failures+=("key inventory $CAREY_KEY_INVENTORY could not be read")
  elif [[ -z $held ]]; then
    failures+=("key inventory $CAREY_KEY_INVENTORY lists no versions")
  elif grep -qvxE '[0-9]+' <<<"$held"; then
    held=""
    failures+=("every non-comment line in $CAREY_KEY_INVENTORY must be one key_version number")
  fi
else
  failures+=("key inventory $CAREY_KEY_INVENTORY missing or unreadable")
fi
if [[ -n $held ]]; then
  if key_version=$(target_sql <<'SQL'
select t.key_version
  from public.telephony_config t
  join public.orgs o on o.id = t.org_id
 where o.schema_name = :'schema';
SQL
  ); then
    if [[ -z $key_version ]]; then
      [[ $allow_no_telephony == "yes" ]] ||
        failures+=("public.telephony_config in $target has no row for $schema; pass --allow-no-telephony for an org created without telephony")
    elif ! grep -qxF -f <(printf '%s\n' "$held") <<<"$key_version"; then
      failures+=("telephony_config for $schema is sealed under key_version $key_version, which $CAREY_KEY_INVENTORY does not list; retrieve the retired key from escrow (ops-key-rotation.md) first")
    fi
  else
    failures+=("could not read public.telephony_config in $target")
  fi
fi

# 3. The schema must not exist yet, unless --replace.
if schema_rows=$(target_sql <<'SQL'
select count(*) from pg_namespace where nspname = :'schema';
SQL
); then
  if [[ $schema_rows != 0 && $replace != "yes" ]]; then
    failures+=("schema $schema already exists in $target; pass --replace to drop it and restore over it")
  fi
else
  failures+=("could not read pg_namespace in $target")
fi

if ((${#failures[@]} > 0)); then
  for failure in "${failures[@]}"; do
    printf 'restore-org: %s\n' "$failure" >&2
  done
  exit 3
fi

# --- Restore ----------------------------------------------------------------
if [[ $schema_rows != 0 ]]; then
  # format('%I') quotes the schema name as an identifier.
  target_sql >/dev/null <<'SQL'
select format('drop schema %I cascade', :'schema') \gexec
SQL
  log "dropped schema $schema in $target (--replace)"
fi

restic dump "$snapshot" "$schema.dump" |
  compose exec -T db pg_restore -U "$CAREY_DB_OWNER" -d "$target" --no-owner --role="$CAREY_DB_OWNER"
log "snapshot $snapshot restored as $schema in $target"

# --- Migrations and grants --------------------------------------------------
# migrate.ts connects through DATABASE_ADMIN_URL from the secrets file, which
# names the live database, and the loader refuses environment overrides. Run
# for a scratch target, it would create and migrate a phantom tenant schema
# in the live database, so it runs only when the target is the live one
# (which the checks above allow only with --i-mean-production).
if [[ $target == "$CAREY_DB_NAME" ]]; then
  compose run --rm api \
    pnpm --filter @care-y/server exec tsx src/db/migrate.ts --schema="$schema"
  log "tenant migrations applied to $schema"
  compose run --rm api \
    pnpm --filter @care-y/server exec tsx src/db/migrate.ts --grants
  log "grants applied"
else
  log "$schema in $target is unmigrated and carries no grants for the runtime role; it is for inspection only"
fi
