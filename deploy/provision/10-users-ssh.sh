#!/usr/bin/env bash
# Creates the two host users and hardens sshd.
#
#   care-y       service user. uid pinned to the container appuser uid so the
#                bind-mounted secrets file stays readable in-container at
#                mode 0600. No shell, no sudo, no home, no SSH key.
#   carey-admin  human operator. SSH by key only; the password exists only for
#                sudo (set interactively, stored in the team password manager).
#
# Keep the two separate: a sudo-capable uid-1001 account would turn a
# container escape into a root-capable host identity.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

SSHD_DROP_IN="/etc/ssh/sshd_config.d/50-care-y.conf"

require_root

# Validate the tracked key set before touching anything.
keys_tmp="$(mktemp)"
trap 'rm -f "$keys_tmp"' EXIT
read_team_keys "$CAREY_TEAM_KEYS_DIR" >"$keys_tmp"

# --- Service user ---------------------------------------------------------
if getent passwd "$CAREY_SERVICE_USER" >/dev/null; then
  [ "$(id -u "$CAREY_SERVICE_USER")" = "$CAREY_SERVICE_UID" ] ||
    die "$CAREY_SERVICE_USER exists with a uid other than $CAREY_SERVICE_UID; investigate before continuing"
  [ "$(getent passwd "$CAREY_SERVICE_USER" | cut -d: -f7)" = "/usr/sbin/nologin" ] ||
    die "$CAREY_SERVICE_USER has a login shell; investigate before continuing"
  log "service user $CAREY_SERVICE_USER already present"
else
  if getent passwd "$CAREY_SERVICE_UID" >/dev/null; then
    die "uid $CAREY_SERVICE_UID is taken by another account; the service user must own it"
  fi
  useradd --system --uid "$CAREY_SERVICE_UID" --user-group \
    --shell /usr/sbin/nologin --home-dir /nonexistent --no-create-home \
    "$CAREY_SERVICE_USER"
  log "created service user $CAREY_SERVICE_USER (uid $CAREY_SERVICE_UID)"
fi
service_groups=" $(id -nG "$CAREY_SERVICE_USER") "
[[ "$service_groups" != *" sudo "* ]] ||
  die "$CAREY_SERVICE_USER is in the sudo group; the uid-1001 identity must never be sudo-capable"

# --- Admin user -----------------------------------------------------------
if getent passwd "$CAREY_ADMIN_USER" >/dev/null; then
  log "admin user $CAREY_ADMIN_USER already present"
else
  adduser --disabled-password --comment "" "$CAREY_ADMIN_USER"
fi
[ "$(id -u "$CAREY_ADMIN_USER")" != "$CAREY_SERVICE_UID" ] ||
  die "$CAREY_ADMIN_USER has uid $CAREY_SERVICE_UID, which belongs to the service user"
usermod -aG sudo "$CAREY_ADMIN_USER"

admin_home="$(getent passwd "$CAREY_ADMIN_USER" | cut -d: -f6)"
[ -d "$admin_home" ] || die "home directory of $CAREY_ADMIN_USER not found"
install -d -m 0700 -o "$CAREY_ADMIN_USER" -g "$CAREY_ADMIN_USER" "$admin_home/.ssh"
# Same tracked key set that dropbear-keys.sh sync applies to the initramfs.
write_file "$admin_home/.ssh/authorized_keys" 0600 \
  "$CAREY_ADMIN_USER" "$CAREY_ADMIN_USER" <"$keys_tmp"

# Interactive sudo password, only when not already set. passwd -S status
# field: P = usable password, L = locked (what adduser --disabled-password
# leaves). Keeps re-runs non-interactive.
password_status="$(passwd -S "$CAREY_ADMIN_USER")"
read -r _ password_state _ <<<"$password_status"
if [ "$password_state" = "P" ]; then
  log "sudo password already set for $CAREY_ADMIN_USER, skipping"
else
  [ -t 0 ] || die "no terminal: run this script interactively to set the sudo password for $CAREY_ADMIN_USER"
  log "Set the sudo password for $CAREY_ADMIN_USER. Generate it in the team password manager and store it there."
  passwd "$CAREY_ADMIN_USER"
fi

# --- sshd hardening -------------------------------------------------------
# A drop-in survives package upgrades that rewrite the main sshd_config.
# sshd keeps the first value it reads for each keyword, and drop-ins are read
# in lexical order, so the effective values are checked below (SEC-221).
write_file "$SSHD_DROP_IN" 0644 <<EOF
# Managed by deploy/provision/10-users-ssh.sh. Do not edit by hand.
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
AllowUsers $CAREY_ADMIN_USER
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
EOF
sshd_changed="no"
if file_changed; then
  sshd_changed="yes"
fi

# sshd -t needs the privilege separation directory, which only exists while
# the service runs (socket activation can leave it absent).
install -d -m 0755 /run/sshd
sshd -t || die "sshd config invalid, NOT restarting"
effective="$(sshd -T)"
for expected in "permitrootlogin no" "passwordauthentication no" \
  "kbdinteractiveauthentication no" "allowusers $CAREY_ADMIN_USER"; do
  grep -qx "$expected" <<<"$effective" ||
    die "effective sshd config lacks '$expected' (another drop-in may set it first), NOT restarting"
done

if [ "$sshd_changed" = "yes" ]; then
  systemctl restart ssh
  log "sshd restarted with the hardened configuration"
  printf '\n\033[1m%s\033[0m\n\033[1m%s\033[0m\n\n' \
    "KEEP THIS SESSION OPEN. In a second terminal, log in as $CAREY_ADMIN_USER with your key and run 'sudo -v'." \
    "Close this session only after that login works. Root can no longer log in over SSH."
else
  log "sshd configuration unchanged"
fi
