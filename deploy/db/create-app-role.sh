#!/usr/bin/env bash
# Creates the runtime database role the API connects as, or sets the
# password and attributes of the role when it already exists. Run as root on
# the primary host once at first deploy, from the first-deploy runbook, and
# again after any full restore (restore-full.sh brings the roles back from
# the globals snapshot with a null password):
#
#   deploy/db/create-app-role.sh [role] 3< /etc/care-y/app-role.password
#
# The role defaults to carey_app and must match DATABASE_APP_ROLE in
# secrets.env. The password file holds one line from `openssl rand -hex 32`
# (root:root 0600); delete it once DATABASE_URL in secrets.env carries it.
#
# The role owns nothing and gets no DDL rights. Table privileges come from
# `migrate.ts --grants`, which the deploy script runs after every migration.
#
# The password travels on psql's stdin, never in an argument list, so it
# stays out of `ps` and shell history. ALTER ROLE sends it to the server in
# cleartext, which the PostgreSQL CREATE ROLE notes warn a server log can
# capture; psql here talks to the server over the db container's local
# socket.
set -euo pipefail

CAREY_APP_DIR="/opt/care-y"
ROLE="${1:-carey_app}"

die() {
  printf '[create-app-role] ERROR: %s\n' "$*" >&2
  exit 1
}

[ "$(id -u)" -eq 0 ] || die "run as root"
# Same shape env.ts accepts for DATABASE_APP_ROLE.
[[ "$ROLE" =~ ^[a-z_][a-z0-9_]*$ ]] || die "role name must match ^[a-z_][a-z0-9_]*\$"
[ -e /dev/fd/3 ] || die "pass the password file on fd 3: 3< /etc/care-y/app-role.password"

# read is a shell builtin: the password enters no process argument list.
IFS= read -r pw <&3 || true
[[ "$pw" =~ ^[0-9a-f]{64}$ ]] || die "the password on fd 3 must be 64 hex characters (openssl rand -hex 32)"

cd "$CAREY_APP_DIR"
# printf is a shell builtin too, so the \set line carrying the password
# reaches psql through the pipe only. psql quotes :"role" as an identifier
# and :'pw' as a literal. PostgreSQL has no CREATE ROLE IF NOT EXISTS, so the
# select builds the CREATE only when the role is missing and \gexec runs it;
# format('%I') quotes the name. The password goes in the ALTER alone, which
# runs every time, so a role that already exists gets it too.
{
  printf '\\set role %s\n' "$ROLE"
  printf '\\set pw %s\n' "$pw"
  cat <<'SQL'
select format('create role %I nosuperuser nocreatedb nocreaterole noinherit', :'role') where not exists (select 1 from pg_roles where rolname = :'role') \gexec
alter role :"role" with login password :'pw' nosuperuser nocreatedb nocreaterole noinherit;
grant connect on database carey to :"role";
SQL
} | docker compose --env-file prod.env -f docker-compose.prod.yml exec -T db \
  psql -U carey -d carey -v ON_ERROR_STOP=1 -q
unset pw

printf '[create-app-role] created or updated role %s\n' "$ROLE"
