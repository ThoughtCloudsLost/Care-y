#!/usr/bin/env bash
# Shared setup for the backup and restore scripts on the primary host.
# Source, do not execute. Checks for root, reads /etc/care-y/restic.env and
# defines the helpers the scripts share.
set -euo pipefail

CAREY_APP_DIR="/opt/care-y" # docker-compose.prod.yml and prod.env (deploy-root.sh)
CAREY_RESTIC_ENV="/etc/care-y/restic.env"
CAREY_KEY_INVENTORY="/etc/care-y/ops-key-versions"
CAREY_DB_NAME="carey"
CAREY_DB_OWNER="carey"
CAREY_SCRIPT="$(basename "$0" .sh)"
export CAREY_APP_DIR CAREY_RESTIC_ENV CAREY_KEY_INVENTORY CAREY_DB_NAME CAREY_DB_OWNER CAREY_SCRIPT

log() { printf '%s: %s\n' "$CAREY_SCRIPT" "$*"; }
die() {
  printf '%s: ERROR: %s\n' "$CAREY_SCRIPT" "$*" >&2
  exit 1
}

[[ $EUID -eq 0 ]] || die "run as root"

# restic.env holds the rest-server credential and the heartbeat URL, so it
# must be root's alone before bash reads it.
[[ -f $CAREY_RESTIC_ENV ]] || die "$CAREY_RESTIC_ENV not found; run deploy/backup/install-restic.sh"
read -r env_owner env_mode < <(stat -c '%u %a' "$CAREY_RESTIC_ENV")
[[ $env_owner == 0 && $env_mode == 600 ]] ||
  die "$CAREY_RESTIC_ENV must be owned by root with mode 0600"
unset env_owner env_mode

set -a
# shellcheck source-path=SCRIPTDIR
# shellcheck source=restic.env.example
source "$CAREY_RESTIC_ENV"
set +a

for var in RESTIC_REPOSITORY RESTIC_PASSWORD_FILE RESTIC_CACERT RESTIC_REST_USERNAME RESTIC_REST_PASSWORD; do
  [[ -n ${!var:-} ]] || die "$var is empty in $CAREY_RESTIC_ENV"
done
unset var
# restic takes the HTTP credential from RESTIC_REST_USERNAME and
# RESTIC_REST_PASSWORD, so the repository URL carries none.
[[ $RESTIC_REPOSITORY == rest:https://* ]] ||
  die "RESTIC_REPOSITORY must be a rest:https:// URL"
[[ $RESTIC_REPOSITORY != *@* ]] ||
  die "RESTIC_REPOSITORY must not carry credentials; set RESTIC_REST_USERNAME and RESTIC_REST_PASSWORD instead"
[[ -r $RESTIC_PASSWORD_FILE ]] || die "repository password file $RESTIC_PASSWORD_FILE missing or unreadable"
[[ -r $RESTIC_CACERT ]] || die "backup host certificate $RESTIC_CACERT missing or unreadable"
if [[ -n ${BACKUP_HEARTBEAT_URL:-} && ! $BACKUP_HEARTBEAT_URL =~ ^https://[^[:space:]\"\\]+$ ]]; then
  die "BACKUP_HEARTBEAT_URL must be a single https:// URL"
fi
command -v restic >/dev/null || die "restic not found; run deploy/backup/install-restic.sh"

# docker compose against the production stack. env -u keeps the HTTP
# credential and the heartbeat URL out of the docker processes, which never
# need them.
CAREY_COMPOSE=(
  env -u RESTIC_REST_PASSWORD -u BACKUP_HEARTBEAT_URL
  docker compose --env-file "$CAREY_APP_DIR/prod.env" -f "$CAREY_APP_DIR/docker-compose.prod.yml"
)
compose() { "${CAREY_COMPOSE[@]}" "$@"; }

# db_backup FILENAME TAGS COMMAND [ARG...]
# Runs COMMAND in the db container (-T: no TTY under systemd) and stores its
# stdout as FILENAME in a new snapshot tagged TAGS (tag[,tag,...]). restic
# starts the command itself (--stdin-from-command) and creates no snapshot
# when it exits non-zero. A pipe into --stdin would store a truncated dump
# as a snapshot, and the append-only repository could not delete it.
# The dump goes straight from the container to restic and never touches disk.
db_backup() {
  local filename="$1" tags="$2"
  shift 2
  restic backup --quiet --stdin-from-command --stdin-filename "$filename" --tag "$tags" -- \
    "${CAREY_COMPOSE[@]}" exec -T db "$@"
}

# heartbeat: pings the UptimeRobot heartbeat when one is configured. The URL
# is a credential, so curl reads it from stdin (-K -) rather than from its
# argument list, where ps would show it. A failed ping is reported and not
# retried: the monitor alerts on the missing heartbeat.
heartbeat() {
  [[ -n ${BACKUP_HEARTBEAT_URL:-} ]] || return 0
  if ! printf 'url = "%s"\n' "$BACKUP_HEARTBEAT_URL" |
    curl -fsS --proto '=https' --max-time 10 -o /dev/null -K -; then
    printf '%s: WARNING: heartbeat ping failed; the monitor will report a missed backup\n' "$CAREY_SCRIPT" >&2
  fi
}
