#!/usr/bin/env bash
# installimage post-install hook (Hetzner full-disk-encryption procedure,
# SEC-214). installimage runs it once inside the freshly installed system
# before the first boot:
#
#   installimage -a -c /tmp/setup.conf -x /tmp/post-install.sh
#
# Without -x the hook does not run: Dropbear stays uninstalled and the first
# boot stops at a LUKS prompt nobody can reach. The script adds Dropbear to the
# initramfs on the unencrypted /boot so the encrypted root can be unlocked
# over SSH on port 2222. lib.sh is not available here: installimage copies
# only this file into the new system.
set -euo pipefail

# Initramfs network configuration. The target is a cloud VM, where the kernel
# IP= parameter can use DHCP (SEC-214). A host that needs static addressing
# replaces this value with the static IP= stanza from the same procedure.
INITRAMFS_IP="dhcp"
# Same values as CAREY_DROPBEAR_OPTIONS in lib.sh: 600 s idle timeout, no port
# forwarding (-j -k), port 2222 to keep its host key apart from the booted
# sshd on 22, password logins disabled (-s).
DROPBEAR_OPTIONS_LINE='DROPBEAR_OPTIONS="-I 600 -j -k -p 2222 -s"'

INITRAMFS_CONF="/etc/initramfs-tools/initramfs.conf"
DROPBEAR_DIR="/etc/dropbear/initramfs"
NETPLAN_HOOK="/etc/initramfs-tools/scripts/init-bottom/remove_unwanted_netplan_config"

log() { printf '[post-install] %s\n' "$*"; }
die() {
  printf '[post-install] ERROR: %s\n' "$*" >&2
  exit 1
}

# installimage installs the SSHKEYS_URL keys here. Without them nobody can
# log in to Dropbear, so stop the install rather than produce a locked box.
[ -s /root/.ssh/authorized_keys ] ||
  die "/root/.ssh/authorized_keys is missing or empty; check SSHKEYS_URL in setup.conf"

# The vendor procedure removes the /run/netplan/<interface>.yaml that the
# initramfs network setup leaves behind, because it creates unwanted routes
# in the booted system.
install -d -m 0755 "$(dirname "$NETPLAN_HOOK")"
cat >"$NETPLAN_HOOK" <<'EOF'
#!/bin/sh
if [ -d "/run/netplan" ]; then
  interface=$(ls /run/netplan/ | cut -d'.' -f1)
  if [ ${interface:+x} ]; then
    rm -f /run/netplan/"${interface}".yaml
  fi
fi
EOF
chmod 0755 "$NETPLAN_HOOK"

export DEBIAN_FRONTEND=noninteractive
apt-get update >/dev/null
apt-get -y install cryptsetup-initramfs dropbear-initramfs

# Initramfs network: one IP= line in initramfs.conf.
if ! grep -qx "IP=$INITRAMFS_IP" "$INITRAMFS_CONF"; then
  sed -i '/^IP=/d' "$INITRAMFS_CONF"
  printf 'IP=%s\n' "$INITRAMFS_IP" >>"$INITRAMFS_CONF"
fi

# Unlock keys: the same team keys the rescue system installed for root.
install -m 0600 -o root -g root /root/.ssh/authorized_keys "$DROPBEAR_DIR/authorized_keys"

# Dropbear options: one uncommented DROPBEAR_OPTIONS line.
sed -i -E '/^#?DROPBEAR_OPTIONS=/d' "$DROPBEAR_DIR/dropbear.conf"
printf '%s\n' "$DROPBEAR_OPTIONS_LINE" >>"$DROPBEAR_DIR/dropbear.conf"

dpkg-reconfigure dropbear-initramfs
update-initramfs -u

initramfs_contents="$(lsinitramfs /boot/initrd.img)"
grep -q 'sbin/dropbear$' <<<"$initramfs_contents" ||
  die "the rebuilt initramfs has no Dropbear binary; do not reboot into this install"
log "Dropbear is in the initramfs on port 2222"
