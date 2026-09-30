#!/usr/bin/env bash
# Host firewall (UFW), Fail2ban for sshd, and security-only unattended
# upgrades with automatic reboots off.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require_root

apt_update
apt_install ufw fail2ban python3-systemd unattended-upgrades

# --- Firewall -------------------------------------------------------------
# Ports that Docker publishes bypass these rules, because Docker inserts its
# own iptables chains ahead of UFW's (SEC-216). Every non-public container
# port binds to 127.0.0.1 or an internal network instead; never "fix" a
# reachable container port with a UFW rule.
ufw default deny incoming
ufw default allow outgoing
for port in "${CAREY_PUBLIC_TCP_PORTS[@]}"; do
  ufw allow "$port/tcp"
done
# Telephony (self-hosted voice), documented and DISABLED until needed:
#   ufw allow 5060/udp          # SIP signaling
#   ufw allow 10000:20000/udp   # RTP media
# Port 2222 (initramfs Dropbear) is deliberately absent: Dropbear runs before
# this firewall exists, so a rule here would be dead config that misleads
# audits.
ufw --force enable

# --- Fail2ban -------------------------------------------------------------
# backend = systemd reads the journal directly, so the jail does not depend
# on rsyslog's auth.log existing (SEC-222).
write_file /etc/fail2ban/jail.local 0644 <<'EOF'
# Managed by deploy/provision/20-network.sh. Do not edit by hand.
[sshd]
enabled  = true
backend  = systemd
maxretry = 5
findtime = 10m
bantime  = 1h
EOF
fail2ban_changed="no"
if file_changed; then
  fail2ban_changed="yes"
fi
systemctl enable --now fail2ban
if [ "$fail2ban_changed" = "yes" ]; then
  systemctl restart fail2ban
fi

# --- Unattended upgrades --------------------------------------------------
# Allowed origins stay at the package default, the security pocket
# (SEC-218). Automatic reboots stay off: a reboot on this LUKS host halts at
# the unlock prompt until a registered team member unlocks it, so kernel
# updates that need one are applied in a planned maintenance window.
write_file /etc/apt/apt.conf.d/20auto-upgrades 0644 <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
write_file /etc/apt/apt.conf.d/52care-y-overrides 0644 <<'EOF'
// Managed by deploy/provision/20-network.sh. Do not edit by hand.
Unattended-Upgrade::Automatic-Reboot "false";
EOF
systemctl enable --now apt-daily.timer apt-daily-upgrade.timer unattended-upgrades.service

# Pending-reboot check referenced by the maintenance-window procedure.
if [ -f /var/run/reboot-required ]; then
  log "REBOOT PENDING (/var/run/reboot-required exists). Schedule it in a maintenance window with a registered team member ready to unlock."
else
  log "no reboot pending"
fi
