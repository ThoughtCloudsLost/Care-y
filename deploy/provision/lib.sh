#!/usr/bin/env bash
# Shared helpers for CARE-Y host provisioning. Source, do not execute.
set -euo pipefail

# Target host parameters. A second host overrides these here, never
# mid-script.
CAREY_ADMIN_USER="carey-admin"
CAREY_SERVICE_USER="care-y"
CAREY_SERVICE_UID="1001" # must match container appuser uid (Dockerfile)
CAREY_PROVISION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Tracked public-key set. It lives outside this repository and is copied to
# the host next to these scripts (../team-keys). Feeds both the initramfs
# Dropbear server and carey-admin's authorized_keys.
CAREY_TEAM_KEYS_DIR="${CAREY_TEAM_KEYS_DIR:-$CAREY_PROVISION_DIR/../team-keys}"
CAREY_MIN_TEAM_KEYS="2"
# Initramfs Dropbear. installimage/post-install.sh carries its own copy of
# these options because installimage runs that script without this file.
CAREY_DROPBEAR_PORT="2222"
CAREY_DROPBEAR_OPTIONS="-I 600 -j -k -p $CAREY_DROPBEAR_PORT -s"
CAREY_DROPBEAR_DIR="/etc/dropbear/initramfs"
CAREY_SECRETS_DIR="/etc/care-y"
CAREY_SECRETS_FILE="$CAREY_SECRETS_DIR/secrets.env"
CAREY_BACKUP_DIR="/var/backups/care-y-provision"
# Public inbound TCP ports: 22 SSH, 80 ACME HTTP-01 and the HTTPS redirect,
# 443 HTTPS.
CAREY_PUBLIC_TCP_PORTS=(22 80 443)

# Exported so a CAREY_TEAM_KEYS_DIR override reaches every script that
# provision.sh runs.
export CAREY_ADMIN_USER CAREY_SERVICE_USER CAREY_SERVICE_UID \
  CAREY_PROVISION_DIR CAREY_TEAM_KEYS_DIR CAREY_MIN_TEAM_KEYS \
  CAREY_DROPBEAR_PORT CAREY_DROPBEAR_OPTIONS CAREY_DROPBEAR_DIR \
  CAREY_SECRETS_DIR CAREY_SECRETS_FILE CAREY_BACKUP_DIR

# One public key line with no authorized_keys options in front of it.
CAREY_KEY_LINE_RE='^(ssh-ed25519|ecdsa-sha2-nistp(256|384|521)|ssh-rsa) [A-Za-z0-9+/]+={0,3}( .*)?$'

log() { printf '[provision] %s\n' "$*"; }
die() {
  printf '[provision] ERROR: %s\n' "$*" >&2
  exit 1
}
require_root() { [ "$(id -u)" -eq 0 ] || die "run as root"; }

# backup_file FILE: copies FILE into CAREY_BACKUP_DIR before it is replaced.
# Backups stay out of config directories such as /etc/apt/apt.conf.d, which
# would parse a stray copy as live configuration.
backup_file() {
  local src="$1" name
  [ -f "$src" ] || return 0
  install -d -m 0700 "$CAREY_BACKUP_DIR"
  name="$(printf '%s' "$src" | tr '/' '_')"
  cp -a "$src" "$CAREY_BACKUP_DIR/${name#_}.$(date +%Y%m%d%H%M%S)"
}

# write_file DEST MODE [OWNER] [GROUP] < content
# Installs stdin as DEST with the given mode and ownership. Content that
# differs from the current file is backed up first, so re-runs converge.
# file_changed reports whether the last call changed the content.
CAREY_FILE_CHANGED="no"
write_file() {
  local dest="$1" mode="$2" owner="${3:-root}" group="${4:-root}" tmp
  tmp="$(mktemp)"
  cat >"$tmp"
  if [ -f "$dest" ] && cmp -s "$tmp" "$dest"; then
    CAREY_FILE_CHANGED="no"
  else
    backup_file "$dest"
    CAREY_FILE_CHANGED="yes"
    log "updated $dest"
  fi
  install -m "$mode" -o "$owner" -g "$group" "$tmp" "$dest"
  rm -f "$tmp"
}
file_changed() { [ "$CAREY_FILE_CHANGED" = "yes" ]; }

apt_update() { apt-get update -q; }
apt_install() { DEBIAN_FRONTEND=noninteractive apt-get install -y -q "$@"; }

# read_team_keys DIR: prints every validated key line from DIR/*.pub. Dies on
# a malformed line, a key registered twice, or fewer than CAREY_MIN_TEAM_KEYS
# keys. Redirect the output to a file, never pipe it into the destination, so
# a failure cannot leave a half-written authorized_keys behind.
read_team_keys() {
  local dir="$1" file line name blob count=0
  local -A seen=()
  [ -d "$dir" ] || die "team key directory not found: $dir"
  local files=("$dir"/*.pub)
  [ -f "${files[0]}" ] || die "no *.pub files in $dir"
  for file in "${files[@]}"; do
    name="$(basename "$file")"
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%$'\r'}"
      case "$line" in "" | "#"*) continue ;; esac
      [[ "$line" =~ $CAREY_KEY_LINE_RE ]] || die "malformed key line in $name"
      ssh-keygen -l -f - <<<"$line" >/dev/null 2>&1 || die "unparseable key in $name"
      read -r _ blob _ <<<"$line"
      [ -z "${seen[$blob]:-}" ] || die "a key in $name is already registered by ${seen[$blob]}"
      seen[$blob]="$name"
      printf '%s\n' "$line"
      count=$((count + 1))
    done <"$file"
  done
  [ "$count" -ge "$CAREY_MIN_TEAM_KEYS" ] ||
    die "only $count key(s) in $dir; at least $CAREY_MIN_TEAM_KEYS are required so one lost key cannot lock the team out"
}

# count_keys FILE: prints the number of non-comment, non-blank lines.
count_keys() { awk '!/^[[:space:]]*(#|$)/ { n++ } END { print n + 0 }' "$1"; }

# boot_initramfs_image: prints the initramfs the next default boot loads.
boot_initramfs_image() {
  local image
  image="$(readlink -f /boot/initrd.img)"
  [ -f "$image" ] || die "no boot initramfs behind /boot/initrd.img"
  printf '%s\n' "$image"
}

# extract_initramfs IMAGE DEST: unpacks IMAGE into DEST.
extract_initramfs() {
  command -v unmkinitramfs >/dev/null || die "unmkinitramfs not found (initramfs-tools-core)"
  unmkinitramfs "$1" "$2" || die "could not unpack $1"
}

# initramfs_keys_file TREE: prints the path of the Dropbear authorized_keys
# inside an unpacked initramfs (the dropbear-initramfs hook places it in a
# generated root home directory).
initramfs_keys_file() {
  local found
  found="$(find "$1" -type f -path '*/.ssh/authorized_keys')"
  [ -n "$found" ] || die "the initramfs carries no Dropbear authorized_keys"
  [ "$(wc -l <<<"$found")" -eq 1 ] || die "the initramfs carries more than one authorized_keys"
  printf '%s\n' "$found"
}

# initramfs_has_dropbear TREE: succeeds when the unpacked initramfs contains
# the Dropbear binary.
initramfs_has_dropbear() {
  [ -n "$(find "$1" -type f -path '*/sbin/dropbear' -print -quit)" ]
}

# ufw_expected_rules: prints the normalized `ufw status` rule lines this host
# must show, one IPv4 and one IPv6 line per public port.
ufw_expected_rules() {
  local port
  for port in "${CAREY_PUBLIC_TCP_PORTS[@]}"; do
    printf '%s/tcp ALLOW Anywhere\n%s/tcp (v6) ALLOW Anywhere (v6)\n' "$port" "$port"
  done
}
