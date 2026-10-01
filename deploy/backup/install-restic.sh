#!/usr/bin/env bash
# Installs the restic backup client on the primary host. Run as root from a
# copy of the repository's deploy directory (deploy/backup next to
# deploy/provision):
#
#   bash backup/install-restic.sh <certificate>
#
# <certificate> is the backup host's /etc/restic-server/cert.pem, copied to
# this host. It may be left out on a re-run once /etc/care-y/backup-ca.pem
# exists.
#
# Installs the pinned restic release to /usr/local/bin/restic, the backup
# scripts to /opt/care-y/deploy/backup (root-only, because the timer runs
# them as root), the certificate to /etc/care-y/backup-ca.pem, and the
# systemd service and timer, then enables the timer. Creates
# /etc/care-y/restic.env from restic.env.example when it does not exist yet
# and never overwrites it. Re-running converges.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=../provision/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../provision/lib.sh"

# Pinned release, checked against the release's SHA256SUMS file.
RESTIC_VERSION="0.19.1"
RESTIC_SHA256="f415415624dcc452f2a02b8c33641791a8c6d6d3b65bbb3543fcf9a25151585c"
RESTIC_ASSET="restic_${RESTIC_VERSION}_linux_amd64.bz2"
RESTIC_URL="https://github.com/restic/restic/releases/download/v$RESTIC_VERSION/$RESTIC_ASSET"
RESTIC_BIN="/usr/local/bin/restic"

BACKUP_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAREY_APP_DIR="/opt/care-y"
BACKUP_INSTALL_DIR="$CAREY_APP_DIR/deploy/backup"
RESTIC_ENV="$CAREY_SECRETS_DIR/restic.env"
BACKUP_CA="$CAREY_SECRETS_DIR/backup-ca.pem"
UNIT_DIR="/etc/systemd/system"
BACKUP_UNITS=(care-y-backup.service care-y-backup.timer)

require_root

# --- Validate every input before touching anything --------------------------
arch="$(dpkg --print-architecture)"
[ "$arch" = "amd64" ] ||
  die "the pinned restic release is the linux_amd64 build; this host is $arch"
for required in lib.sh backup-full.sh restic.env.example "${BACKUP_UNITS[@]}"; do
  [ -f "$BACKUP_SRC_DIR/$required" ] || die "$required not found next to this script"
done
grep -qxF "ExecStart=$BACKUP_INSTALL_DIR/backup-full.sh" "$BACKUP_SRC_DIR/care-y-backup.service" ||
  die "care-y-backup.service does not start $BACKUP_INSTALL_DIR/backup-full.sh, NOT installing"
[ -d "$CAREY_APP_DIR" ] ||
  die "$CAREY_APP_DIR not found; set up the application directory first"
[ -d "$CAREY_SECRETS_DIR" ] ||
  die "$CAREY_SECRETS_DIR not found; run deploy/provision/40-secrets.sh first"
command -v openssl >/dev/null || die "openssl not found"

cert_src="${1:-}"
if [ -n "$cert_src" ]; then
  [ -f "$cert_src" ] || die "certificate not found: $cert_src"
  if grep -q 'PRIVATE KEY' "$cert_src"; then
    die "$cert_src contains a private key; copy only the backup host's cert.pem"
  fi
  [ "$(grep -c -- '-----BEGIN CERTIFICATE-----' "$cert_src")" -eq 1 ] ||
    die "$cert_src must hold exactly one certificate"
  openssl x509 -in "$cert_src" -noout 2>/dev/null ||
    die "$cert_src is not a PEM certificate"
elif [ ! -f "$BACKUP_CA" ]; then
  die "usage: install-restic.sh <certificate>, the backup host's /etc/restic-server/cert.pem"
fi

apt_update
apt_install bzip2 ca-certificates curl openssl

# --- restic binary ----------------------------------------------------------
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
log "downloading restic $RESTIC_VERSION"
curl -fsSL -o "$work_dir/$RESTIC_ASSET" "$RESTIC_URL"
printf '%s  %s\n' "$RESTIC_SHA256" "$work_dir/$RESTIC_ASSET" |
  sha256sum --check --quiet - || die "restic checksum mismatch, NOT installing"
bunzip2 -c "$work_dir/$RESTIC_ASSET" >"$work_dir/restic"
write_file "$RESTIC_BIN" 0755 <"$work_dir/restic"
installed_version="$("$RESTIC_BIN" version)"
[[ "$installed_version" == "restic $RESTIC_VERSION "* ]] ||
  die "$RESTIC_BIN reports '$installed_version', expected restic $RESTIC_VERSION"

# --- Backup scripts ---------------------------------------------------------
# The timer runs these as root, so only root may write them.
install -d -m 0700 -o root -g root "$BACKUP_INSTALL_DIR"
for script in "$BACKUP_SRC_DIR"/*.sh; do
  name="$(basename "$script")"
  if [ "$name" = "install-restic.sh" ]; then
    continue
  fi
  write_file "$BACKUP_INSTALL_DIR/$name" 0700 <"$script"
done

# --- Backup host certificate ------------------------------------------------
# restic verifies rest-server against this certificate only (RESTIC_CACERT).
if [ -n "$cert_src" ]; then
  ca_existed="no"
  if [ -f "$BACKUP_CA" ]; then
    ca_existed="yes"
  fi
  write_file "$BACKUP_CA" 0644 <"$cert_src"
  if file_changed && [ "$ca_existed" = "yes" ]; then
    log "WARNING: the pinned backup host certificate changed; the previous one is in $CAREY_BACKUP_DIR"
  fi
fi
fingerprint="$(openssl x509 -in "$BACKUP_CA" -noout -fingerprint -sha256)"
log "backup host certificate $fingerprint"
log "compare it with the fingerprint recorded when the backup host was provisioned"

# --- restic.env -------------------------------------------------------------
if [ -e "$RESTIC_ENV" ]; then
  [ -f "$RESTIC_ENV" ] || die "$RESTIC_ENV exists but is not a regular file"
  chown root:root "$RESTIC_ENV"
  chmod 0600 "$RESTIC_ENV"
  log "keeping the existing $RESTIC_ENV"
else
  write_file "$RESTIC_ENV" 0600 <"$BACKUP_SRC_DIR/restic.env.example"
  log "created $RESTIC_ENV from the example; fill in its empty values before the first backup"
fi

# --- systemd units ----------------------------------------------------------
for unit in "${BACKUP_UNITS[@]}"; do
  write_file "$UNIT_DIR/$unit" 0644 <"$BACKUP_SRC_DIR/$unit"
done
systemctl daemon-reload
systemctl enable --now care-y-backup.timer
systemctl is-active --quiet care-y-backup.timer ||
  die "care-y-backup.timer is not active; check systemctl status care-y-backup.timer"

log "restic $RESTIC_VERSION installed; the nightly backup timer is active"
log "before the first run: write the repository password to /etc/care-y/restic.password (root:root 0600), fill in $RESTIC_ENV and initialise the repository as the backups runbook describes"
