#!/usr/bin/env bash
# Backs up one org's tenant schema into the restic repository on the backup
# host. Run as root on the primary host:
#
#   backup-org.sh <org_schema>
#
# <org_schema> is public.orgs.schema_name, of the form org_<uuid>. The
# snapshot holds a pg_dump -Fc of that schema only, stored as
# <org_schema>.dump and tagged "org" and <org_schema>. The public schema is
# not included, so restoring it needs a database that already has the
# platform tables (restore-org.sh checks this).
#
# Exits non-zero and prints only the error when anything fails. restic
# creates no snapshot when pg_dump fails.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

(($# == 1)) || die "usage: backup-org.sh <org_schema>"
schema="$1"
# Same shape as orgSchemaNameSchema in @care-y/shared. pg_dump -n reads its
# argument as a pattern, and this shape has no pattern characters in it.
[[ $schema =~ ^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] ||
  die "org schema must be org_<uuid> in lowercase"

db_backup "$schema.dump" "org,$schema" \
  pg_dump -U "$CAREY_DB_OWNER" -Fc -n "$schema" "$CAREY_DB_NAME"
log "$schema stored"
