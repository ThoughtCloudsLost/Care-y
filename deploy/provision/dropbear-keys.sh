#!/usr/bin/env bash
# Registers the team's public keys with the Dropbear SSH server inside the
# initramfs, which answers on port 2222 before the encrypted root is unlocked.
#
#   dropbear-keys.sh sync [keys-dir]
#     Reads every *.pub in keys-dir (default: CAREY_TEAM_KEYS_DIR from
#     lib.sh), refuses a set smaller than two keys, writes the initramfs
#     authorized_keys whole, runs update-initramfs -u, and checks that the
#     rebuilt image carries exactly that set. An unchanged set is a harmless
#     rebuild. There is no force flag: to replace a key, commit the new key
#     first, then sync.
#   dropbear-keys.sh list
#     Prints the registered keys (fingerprint, comment, type) read back from
#     the boot initramfs, never from the source file, so a failed rebuild is
#     visible at once.
#
# Editing /etc/dropbear/initramfs/authorized_keys by hand changes nothing
# until the initramfs is rebuilt, and a mistake there only surfaces at the
# next reboot as a lockout. This script is the only sanctioned way to change
# the set.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

usage() {
  printf 'usage: %s sync [keys-dir] | list\n' "$(basename "$0")" >&2
  exit 2
}

WORK=""
cleanup() {
  if [ -n "$WORK" ]; then
    rm -rf "$WORK"
  fi
}
trap cleanup EXIT

# list_keys: unpacks the boot initramfs and prints the keys it carries.
list_keys() {
  local image tree="$WORK/listed" keys
  image="$(boot_initramfs_image)"
  extract_initramfs "$image" "$tree"
  keys="$(initramfs_keys_file "$tree")"
  log "boot initramfs: $image"
  ssh-keygen -l -f "$keys"
  log "$(count_keys "$keys") keys registered"
}

# sync_keys DIR: applies the tracked key set in DIR to the initramfs.
sync_keys() {
  local dir="$1" expected="$WORK/authorized_keys" tree="$WORK/rebuilt" image keys
  [ -f "$CAREY_DROPBEAR_DIR/dropbear.conf" ] ||
    die "dropbear-initramfs is not installed ($CAREY_DROPBEAR_DIR/dropbear.conf missing)"
  read_team_keys "$dir" >"$expected"
  install -m 0600 -o root -g root "$expected" "$CAREY_DROPBEAR_DIR/authorized_keys"
  log "wrote $(count_keys "$expected") keys to $CAREY_DROPBEAR_DIR/authorized_keys"

  update-initramfs -u ||
    die "initramfs rebuild failed: the boot image still carries the previous key set. Fix the error and re-run sync before any reboot."

  image="$(boot_initramfs_image)"
  extract_initramfs "$image" "$tree"
  initramfs_has_dropbear "$tree" ||
    die "the rebuilt initramfs has no Dropbear binary. Do NOT reboot until this is resolved."
  keys="$(initramfs_keys_file "$tree")"
  cmp -s "$expected" "$keys" ||
    die "the rebuilt initramfs does not carry the synced key set. Do NOT reboot until this is resolved."
  log "rebuilt initramfs verified: $image"
}

case "${1:-}" in
  sync)
    [ "$#" -le 2 ] || usage
    require_root
    WORK="$(mktemp -d)"
    sync_keys "${2:-$CAREY_TEAM_KEYS_DIR}"
    list_keys
    ;;
  list)
    [ "$#" -eq 1 ] || usage
    require_root
    WORK="$(mktemp -d)"
    list_keys
    ;;
  *)
    usage
    ;;
esac
