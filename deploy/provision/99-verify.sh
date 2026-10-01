#!/usr/bin/env bash
# Post-provision assertions. One line per check, "PASS <name>" or
# "FAIL <name>", and a nonzero exit when any check fails. Check output is
# discarded: nothing here prints a secret value or file content.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require_root

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Unpack the boot initramfs once; its checks FAIL when this does not work.
INITRAMFS_TREE=""
if (extract_initramfs "$(boot_initramfs_image)" "$WORK/initramfs") >/dev/null 2>&1; then
  INITRAMFS_TREE="$WORK/initramfs"
fi

total=0
failures=0
# check NAME COMMAND...: runs COMMAND in a subshell with its output discarded.
check() {
  local name="$1"
  shift
  total=$((total + 1))
  if ("$@") >/dev/null 2>&1; then
    printf 'PASS %s\n' "$name"
  else
    printf 'FAIL %s\n' "$name"
    failures=$((failures + 1))
  fi
}

# --- Users and SSH --------------------------------------------------------
sshd_has() {
  local effective
  effective="$(sshd -T)" && grep -qx "$1" <<<"$effective"
}
passwd_field() { getent passwd "$1" | cut -d: -f"$2"; }
in_group() {
  local groups
  groups=" $(id -nG "$1") " && [[ "$groups" == *" $2 "* ]]
}
service_not_sudo() { ! in_group "$CAREY_SERVICE_USER" sudo; }
admin_keys_current() {
  local home
  home="$(passwd_field "$CAREY_ADMIN_USER" 6)" &&
    read_team_keys "$CAREY_TEAM_KEYS_DIR" >"$WORK/team-keys" &&
    cmp -s "$WORK/team-keys" "$home/.ssh/authorized_keys"
}

check sshd-permitrootlogin-no sshd_has "permitrootlogin no"
check sshd-passwordauthentication-no sshd_has "passwordauthentication no"
check sshd-kbdinteractiveauthentication-no sshd_has "kbdinteractiveauthentication no"
check sshd-allowusers-admin-only sshd_has "allowusers $CAREY_ADMIN_USER"
check service-user-uid test "$(passwd_field "$CAREY_SERVICE_USER" 3)" = "$CAREY_SERVICE_UID"
check service-user-nologin test "$(passwd_field "$CAREY_SERVICE_USER" 7)" = "/usr/sbin/nologin"
check service-user-not-sudo service_not_sudo
check admin-user-sudo in_group "$CAREY_ADMIN_USER" sudo
check admin-user-not-service-uid test "$(passwd_field "$CAREY_ADMIN_USER" 3)" != "$CAREY_SERVICE_UID"
check admin-keys-match-team-set admin_keys_current
check no-installimage-conf test ! -e /installimage.conf

# --- Firewall, Fail2ban, unattended upgrades ------------------------------
ufw_rules_exact() {
  local status actual expected
  status="$(ufw status)" || return 1
  grep -qx 'Status: active' <<<"$status" || return 1
  actual="$(sed -n '/^--/,$p' <<<"$status" | sed '1d' |
    sed -E 's/[[:space:]]+/ /g; s/ $//; /^$/d' | sort)"
  expected="$(ufw_expected_rules | sort)"
  [ "$actual" = "$expected" ]
}
ufw_default_deny() {
  local verbose
  verbose="$(ufw status verbose)" && grep -q 'Default: deny (incoming)' <<<"$verbose"
}
apt_value() {
  local value
  value="$(apt-config shell v "$1")" && [ "$value" = "v='$2'" ]
}

check ufw-active-exact-allowlist ufw_rules_exact
check ufw-default-deny-incoming ufw_default_deny
check fail2ban-sshd-jail fail2ban-client status sshd
check apt-periodic-update-lists apt_value APT::Periodic::Update-Package-Lists 1
check apt-periodic-unattended-upgrade apt_value APT::Periodic::Unattended-Upgrade 1
check unattended-automatic-reboot-false apt_value Unattended-Upgrade::Automatic-Reboot false
check unattended-overrides-file grep -qx 'Unattended-Upgrade::Automatic-Reboot "false";' \
  /etc/apt/apt.conf.d/52care-y-overrides

# --- Core dumps, swap, Docker ---------------------------------------------
docker_core_zero() {
  local core
  core="$(docker run --rm ubuntu:24.04 sh -c 'ulimit -c')" && [ "$core" = "0" ]
}
docker_from_docker_repo() {
  local policy
  policy="$(apt-cache policy docker-ce)" && grep -q 'download.docker.com' <<<"$policy"
}
fstab_has_no_swap() {
  ! awk '$1 !~ /^#/ && $3 == "swap" { found = 1 } END { exit !found }' /etc/fstab
}

check sysctl-suid-dumpable-0 test "$(sysctl -n fs.suid_dumpable)" = "0"
check sysctl-core-pattern-discard test "$(sysctl -n kernel.core_pattern)" = "|/bin/false"
check systemd-default-limit-core-0 test "$(systemctl show -p DefaultLimitCORE --value)" = "0"
check limits-hard-core-0 grep -qxF '* hard core 0' /etc/security/limits.d/50-care-y-coredump.conf
check swap-zram-only test "$(swapon --show=NAME --noheadings)" = "/dev/zram0"
check zram-zstd grep -qF '[zstd]' /sys/block/zram0/comp_algorithm
check fstab-no-swap fstab_has_no_swap
check docker-info docker info
check docker-from-docker-repo docker_from_docker_repo
check docker-container-core-0 docker_core_zero

# --- Secrets file ---------------------------------------------------------
check secrets-file-mode-owner test "$(stat -c '%a:%U' "$CAREY_SECRETS_FILE")" = "600:$CAREY_SERVICE_USER"
check validate-secrets bash "$CAREY_PROVISION_DIR/validate-secrets.sh"

# --- Initramfs Dropbear ---------------------------------------------------
initramfs_keys_min() {
  local keys
  [ -n "$INITRAMFS_TREE" ] &&
    keys="$(initramfs_keys_file "$INITRAMFS_TREE")" &&
    [ "$(count_keys "$keys")" -ge "$CAREY_MIN_TEAM_KEYS" ]
}
initramfs_keys_match_team() {
  local keys
  [ -n "$INITRAMFS_TREE" ] &&
    keys="$(initramfs_keys_file "$INITRAMFS_TREE")" &&
    read_team_keys "$CAREY_TEAM_KEYS_DIR" >"$WORK/team-keys-initramfs" &&
    cmp -s "$WORK/team-keys-initramfs" "$keys"
}
initramfs_dropbear_options() {
  local conf
  [ -n "$INITRAMFS_TREE" ] &&
    conf="$(find "$INITRAMFS_TREE" -type f -path '*/etc/dropbear/dropbear.conf' -print -quit)" &&
    [ -n "$conf" ] &&
    grep -qxF "DROPBEAR_OPTIONS=\"$CAREY_DROPBEAR_OPTIONS\"" "$conf"
}
initramfs_dropbear_present() {
  [ -n "$INITRAMFS_TREE" ] && initramfs_has_dropbear "$INITRAMFS_TREE"
}
nothing_on_dropbear_port() {
  local listening
  listening="$(ss -Htln "sport = :$CAREY_DROPBEAR_PORT")" && [ -z "$listening" ]
}

check initramfs-has-dropbear initramfs_dropbear_present
check initramfs-dropbear-options initramfs_dropbear_options
check initramfs-min-two-keys initramfs_keys_min
check initramfs-keys-match-team-set initramfs_keys_match_team
check nothing-listening-on-dropbear-port nothing_on_dropbear_port

printf '%d checks, %d failed\n' "$total" "$failures"
[ "$failures" -eq 0 ] || exit 1
