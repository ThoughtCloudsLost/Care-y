#!/usr/bin/env bash
# Installs the host log policy: a persistent journal that keeps 14 days,
# readable by root and the systemd-journal group, forwarded nowhere. Every
# container in docker-compose.prod.yml logs through Docker's journald driver,
# so this one drop-in governs the api, web, Caddy, PostgreSQL and OPRF logs.
#
# care-y.conf is read from ../journald, as in the repository's deploy/ layout.
# Copy that directory next to the provision directory before running.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

JOURNALD_SRC="$(cd "$CAREY_PROVISION_DIR/.." && pwd)/journald/care-y.conf"
JOURNALD_DROP_IN_DIR="/etc/systemd/journald.conf.d"
JOURNALD_DROP_IN="$JOURNALD_DROP_IN_DIR/care-y.conf"
JOURNAL_DIR="/var/log/journal"
JOURNAL_DIR_EXPECTED="root:systemd-journal:2755"

require_root
[ -f "$JOURNALD_SRC" ] ||
  die "care-y.conf not found at $JOURNALD_SRC; copy deploy/journald next to the provision directory"
command -v systemd-analyze >/dev/null || die "systemd-analyze not found"

# --- Drop-in ----------------------------------------------------------------
# Carriage returns are stripped so a copy from a Windows checkout installs the
# same bytes as one from Linux, and re-runs compare equal.
install -d -m 0755 "$JOURNALD_DROP_IN_DIR"
write_file "$JOURNALD_DROP_IN" 0644 < <(tr -d '\r' <"$JOURNALD_SRC")
journald_changed="no"
if file_changed; then
  journald_changed="yes"
fi

# Persistent storage lives in /var/log/journal. Its ownership, mode and any
# ACLs come from systemd's own tmpfiles rules, the documented way to create
# the directory (systemd-journald.service(8)), not from a mode set here.
mkdir -p "$JOURNAL_DIR"
systemd-tmpfiles --create --prefix "$JOURNAL_DIR"

if [ "$journald_changed" = "yes" ]; then
  # restart, never stop then start: a restart keeps every service's log
  # stream connected, a stop cuts them (systemd-journald.service(8)).
  systemctl restart systemd-journald
  log "systemd-journald restarted with the CARE-Y log policy"
else
  log "journald configuration unchanged"
fi
# Moves anything still in the volatile journal under /run into /var/log/journal.
journalctl --flush

# --- Checks -----------------------------------------------------------------
# effective_journald_value KEY: prints the value of the last assignment of KEY
# across journald.conf and its drop-ins, in the order journald applies them.
# The last assignment wins for single-value options (journald.conf(5)).
effective_journald_value() {
  local merged
  merged="$(systemd-analyze cat-config systemd/journald.conf)"
  awk -F= -v key="$1" '$1 == key { value = substr($0, length(key) + 2) } END { print value }' <<<"$merged"
}

# Every setting in care-y.conf must be the one journald applies. A drop-in
# that sorts after care-y.conf would silently override it.
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  case "$line" in "" | "#"* | "["*) continue ;; esac
  key="${line%%=*}"
  expected="${line#*=}"
  actual="$(effective_journald_value "$key")"
  [ "$actual" = "$expected" ] ||
    die "journald applies $key=$actual, expected $expected; another drop-in overrides $JOURNALD_DROP_IN"
done <"$JOURNALD_SRC"

journal_dir_state="$(stat -c '%U:%G:%a' "$JOURNAL_DIR")"
[ "$journal_dir_state" = "$JOURNAL_DIR_EXPECTED" ] ||
  die "$JOURNAL_DIR is $journal_dir_state, expected $JOURNAL_DIR_EXPECTED"
log "journal: $JOURNAL_DIR is $JOURNAL_DIR_EXPECTED; 14-day retention, no forwarding"
