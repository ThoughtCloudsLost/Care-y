#!/usr/bin/env bash
# Keeps process memory off disk: core dumps disabled at every layer, swap on
# zram only, and Docker Engine installed with a daemon-wide core limit of 0.
#
# Disk swap and core dumps both defeat in-memory zeroing of secrets: a page
# copied out before the process zeroes it survives until overwritten.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

DOCKER_DAEMON_JSON="/etc/docker/daemon.json"
DOCKER_REPO_URL="https://download.docker.com/linux/ubuntu"
# Unofficial packages Docker's install documentation says to remove first.
DOCKER_CONFLICTS=(docker.io docker-compose docker-compose-v2 docker-doc
  docker-buildx podman-docker containerd runc)

require_root

# --- Core dumps -----------------------------------------------------------
# Dumps are governed by RLIMIT_CORE, kernel.core_pattern and
# fs.suid_dumpable (SEC-219). The sysctl pipes any residual dump to nowhere.
write_file /etc/sysctl.d/99-care-y-coredump.conf 0644 <<'EOF'
fs.suid_dumpable=0
kernel.core_pattern=|/bin/false
EOF
sysctl --system >/dev/null

# systemd services
install -d -m 0755 /etc/systemd/system.conf.d
write_file /etc/systemd/system.conf.d/50-care-y-coredump.conf 0644 <<'EOF'
[Manager]
DefaultLimitCORE=0
EOF
if file_changed; then
  systemctl daemon-reexec
fi

# PAM/login sessions
write_file /etc/security/limits.d/50-care-y-coredump.conf 0644 <<'EOF'
* hard core 0
EOF

# Ubuntu's crash reporter. On the 24.04 cloud image apport.service is enabled
# and, at boot, resets fs.suid_dumpable to 2 and kernel.core_pattern to its
# own pipe after sysctl.d has been applied, so enabled=0 in /etc/default/apport
# is not enough. A host that must never keep a dump has no use for a crash
# reporter: remove the package, then re-apply the sysctls.
if dpkg-query -W -f '${Status}' apport 2>/dev/null | grep -q 'install ok installed'; then
  DEBIAN_FRONTEND=noninteractive apt-get purge -y -q apport
  sysctl --system >/dev/null
  log "removed apport; core-dump sysctls re-applied"
fi

# --- Swap: zram only ------------------------------------------------------
# assert_no_disk_swap: dies on any active swap other than /dev/zram0 and on
# any swap entry in /etc/fstab. Drift means someone changed the host, so it
# is investigated, never switched off silently.
assert_no_disk_swap() {
  local active dev
  active="$(swapon --show=NAME --noheadings)"
  while IFS= read -r dev; do
    [ -z "$dev" ] || [ "$dev" = "/dev/zram0" ] ||
      die "disk-backed swap is active ($dev). This host allows swap on zram only; find out who added it before changing anything."
  done <<<"$active"
  if awk '$1 !~ /^#/ && $3 == "swap" { found = 1 } END { exit !found }' /etc/fstab; then
    die "/etc/fstab declares a swap entry. This host allows swap on zram only; find out who added it before changing anything."
  fi
}

assert_no_disk_swap
apt_update
apt_install zram-tools
# Keys and path are the ones zram-tools documents in the /etc/default/zramswap
# template it ships.
write_file /etc/default/zramswap 0644 <<'EOF'
# Managed by deploy/provision/30-memory-docker.sh. Do not edit by hand.
# One zram swap device sized at half of RAM, zstd compression. RAM only: no
# swapped page ever reaches the disk.
ALGO=zstd
PERCENT=50
EOF
zram_changed="no"
if file_changed; then
  zram_changed="yes"
fi
systemctl enable zramswap.service
active_swap="$(swapon --show=NAME --noheadings)"
if [ "$zram_changed" = "yes" ] || [ "$active_swap" != "/dev/zram0" ]; then
  systemctl restart zramswap.service
fi
assert_no_disk_swap
active_swap="$(swapon --show=NAME --noheadings)"
[ "$active_swap" = "/dev/zram0" ] ||
  die "expected exactly one swap device, /dev/zram0; swapon --show reports something else"
log "swap: /dev/zram0 only"

# --- Docker Engine --------------------------------------------------------
# Installed from Docker's own apt repository per its install documentation,
# never the Ubuntu archive or snap.
conflicts=()
for pkg in "${DOCKER_CONFLICTS[@]}"; do
  if [ "$(dpkg-query -W -f="\${Status}" "$pkg" 2>/dev/null)" = "install ok installed" ]; then
    conflicts+=("$pkg")
  fi
done
if [ "${#conflicts[@]}" -gt 0 ]; then
  log "removing packages that conflict with Docker Engine: ${conflicts[*]}"
  DEBIAN_FRONTEND=noninteractive apt-get remove -y -q "${conflicts[@]}"
fi

apt_install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
key_tmp="$(mktemp)"
trap 'rm -f "$key_tmp"' EXIT
curl -fsSL "$DOCKER_REPO_URL/gpg" -o "$key_tmp"
write_file /etc/apt/keyrings/docker.asc 0644 <"$key_tmp"

codename="$(sed -n 's/^UBUNTU_CODENAME=//p' /etc/os-release)"
[ -n "$codename" ] || die "UBUNTU_CODENAME missing from /etc/os-release"
arch="$(dpkg --print-architecture)"
write_file /etc/apt/sources.list.d/docker.sources 0644 <<EOF
Types: deb
URIs: $DOCKER_REPO_URL
Suites: $codename
Components: stable
Architectures: $arch
Signed-By: /etc/apt/keyrings/docker.asc
EOF
apt_update
apt_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Daemon-wide core limit of 0 for every container (SEC-220). Merged into any
# existing daemon.json so keys added later (log policy) survive re-runs.
install -d -m 0755 /etc/docker
daemon_result="$(
  python3 - "$DOCKER_DAEMON_JSON" <<'PY'
import json
import os
import sys

path = sys.argv[1]
wanted = {"Name": "core", "Hard": 0, "Soft": 0}
try:
    with open(path, encoding="utf-8") as handle:
        config = json.load(handle)
except FileNotFoundError:
    config = {}
if not isinstance(config, dict):
    sys.exit(f"{path} is not a JSON object")
ulimits = config.get("default-ulimits", {})
if not isinstance(ulimits, dict):
    sys.exit(f"default-ulimits in {path} is not a JSON object")
if ulimits.get("core") == wanted:
    print("unchanged")
    sys.exit(0)
ulimits["core"] = wanted
config["default-ulimits"] = ulimits
tmp = path + ".tmp"
with open(tmp, "w", encoding="utf-8") as handle:
    json.dump(config, handle, indent=2)
    handle.write("\n")
os.chmod(tmp, 0o644)
os.replace(tmp, path)
print("changed")
PY
)"
systemctl enable --now docker
if [ "$daemon_result" = "changed" ]; then
  log "updated $DOCKER_DAEMON_JSON"
  systemctl restart docker
fi

# Self-check: a container started on this host must report a core limit of 0.
docker info >/dev/null
docker pull -q ubuntu:24.04 >/dev/null
container_core="$(docker run --rm ubuntu:24.04 sh -c 'ulimit -c')"
[ "$container_core" = "0" ] ||
  die "a container on this host reports core limit '$container_core', expected 0"
log "docker: container core limit is 0"
