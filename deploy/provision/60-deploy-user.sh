#!/usr/bin/env bash
# Creates the deploy user the release workflow connects as, and installs the
# two-stage host deploy script it is forced into.
#
#   deploy   SSH by one key only. The key is forced to
#            /usr/local/bin/care-y-deploy (deploy/deploy.sh), which accepts
#            "deploy <40-hex sha>" and nothing else, then runs the root stage
#            /usr/local/bin/care-y-deploy-root (deploy/deploy-root.sh) through
#            the one sudo rule this script writes. No supplementary groups
#            (docker membership is root-equivalent), no password.
#
# CAREY_DEPLOY_PUBKEY_FILE must name the public half of the deploy key: one
# ssh-ed25519 line. The private half exists only as a GitHub Actions secret.
# Keep the file out of the team key directory, where every *.pub file becomes
# an admin key. deploy.sh and deploy-root.sh are read from the directory that
# holds this provision directory, as in the repository's deploy/ layout.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

DEPLOY_USER="deploy"
DEPLOY_HOME="/home/$DEPLOY_USER"
DEPLOY_SRC_DIR="$(cd "$CAREY_PROVISION_DIR/.." && pwd)"
DEPLOY_BIN="/usr/local/bin/care-y-deploy"
DEPLOY_ROOT_BIN="/usr/local/bin/care-y-deploy-root"
SUDOERS_DROP_IN="/etc/sudoers.d/care-y-deploy"
SSHD_DEPLOY_DROP_IN="/etc/ssh/sshd_config.d/51-care-y-deploy.conf"
DEPLOY_KEY_RE='^ssh-ed25519 [A-Za-z0-9+/]+={0,3}( .*)?$'

require_root
command -v visudo >/dev/null || die "visudo not found (sudo package)"

# Validate every input before touching anything.
[ -n "${CAREY_DEPLOY_PUBKEY_FILE:-}" ] ||
  die "set CAREY_DEPLOY_PUBKEY_FILE to the file holding the deploy key's public half"
[ -f "$CAREY_DEPLOY_PUBKEY_FILE" ] || die "deploy public key not found: $CAREY_DEPLOY_PUBKEY_FILE"
[ "$(count_keys "$CAREY_DEPLOY_PUBKEY_FILE")" -eq 1 ] ||
  die "$CAREY_DEPLOY_PUBKEY_FILE must hold exactly one key"
key_line="$(awk '!/^[[:space:]]*(#|$)/' "$CAREY_DEPLOY_PUBKEY_FILE")"
key_line="${key_line%$'\r'}"
[[ "$key_line" =~ $DEPLOY_KEY_RE ]] ||
  die "the deploy key must be a single ssh-ed25519 public key with no options"
ssh-keygen -l -f - <<<"$key_line" >/dev/null 2>&1 || die "unparseable deploy key"
# Type and key only; the comment is dropped.
read -r key_type key_blob _ <<<"$key_line"

for script in deploy.sh deploy-root.sh; do
  [ -f "$DEPLOY_SRC_DIR/$script" ] ||
    die "$script not found in $DEPLOY_SRC_DIR; copy it next to the provision directory"
done

# --- Deploy user ------------------------------------------------------------
if getent passwd "$DEPLOY_USER" >/dev/null; then
  log "deploy user $DEPLOY_USER already present"
else
  useradd --system --user-group --shell /bin/sh --home-dir "$DEPLOY_HOME" \
    --no-create-home "$DEPLOY_USER"
  log "created deploy user $DEPLOY_USER"
fi
# The forced command runs through the login shell, so one must exist.
[ "$(getent passwd "$DEPLOY_USER" | cut -d: -f7)" = "/bin/sh" ] ||
  die "$DEPLOY_USER has a login shell other than /bin/sh; investigate before continuing"
[ "$(id -nG "$DEPLOY_USER")" = "$DEPLOY_USER" ] ||
  die "$DEPLOY_USER belongs to groups other than its own; it must be in none"
# passwd -S status field: P = usable password.
password_status="$(passwd -S "$DEPLOY_USER")"
read -r _ password_state _ <<<"$password_status"
[ "$password_state" != "P" ] ||
  die "$DEPLOY_USER has a usable password; it must have none"

# Home stays root-owned so the account cannot change anything beneath it.
install -d -m 0755 -o root -g root "$DEPLOY_HOME"
install -d -m 0700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$DEPLOY_HOME/.ssh"
write_file "$DEPLOY_HOME/.ssh/authorized_keys" 0600 "$DEPLOY_USER" "$DEPLOY_USER" <<EOF
restrict,command="$DEPLOY_BIN" $key_type $key_blob
EOF

# --- Deploy scripts ---------------------------------------------------------
# Installed before the sudo rule. The rule must never name a missing file.
write_file "$DEPLOY_BIN" 0755 <"$DEPLOY_SRC_DIR/deploy.sh"
write_file "$DEPLOY_ROOT_BIN" 0755 <"$DEPLOY_SRC_DIR/deploy-root.sh"

# --- sudo rule --------------------------------------------------------------
# The whole grant: the root stage, first argument fixed to "deploy". The root
# stage re-validates the SHA itself.
sudoers_tmp="$(mktemp)"
trap 'rm -f "$sudoers_tmp"' EXIT
cat >"$sudoers_tmp" <<EOF
# Managed by deploy/provision/60-deploy-user.sh. Do not edit by hand.
$DEPLOY_USER ALL=(root) NOPASSWD: $DEPLOY_ROOT_BIN deploy *
EOF
visudo -cf "$sudoers_tmp" >/dev/null || die "sudoers drop-in failed visudo -c, NOT installing"
write_file "$SUDOERS_DROP_IN" 0440 <"$sudoers_tmp"
sudo_rules="$(sudo -l -U "$DEPLOY_USER")"
grep -qF "$DEPLOY_ROOT_BIN deploy *" <<<"$sudo_rules" ||
  die "the sudo rule for $DEPLOY_USER is not in effect (is /etc/sudoers.d included?)"

# --- sshd -------------------------------------------------------------------
# AllowUsers entries from every file add to one list: OpenSSH servconf.c
# appends them instead of keeping the first value. This second drop-in
# therefore extends the list 10-users-ssh.sh writes.
write_file "$SSHD_DEPLOY_DROP_IN" 0644 <<EOF
# Managed by deploy/provision/60-deploy-user.sh. Do not edit by hand.
AllowUsers $CAREY_ADMIN_USER $DEPLOY_USER
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
for expected in "allowusers $CAREY_ADMIN_USER" "allowusers $DEPLOY_USER"; do
  grep -qx "$expected" <<<"$effective" ||
    die "effective sshd config lacks '$expected', NOT restarting"
done

if [ "$sshd_changed" = "yes" ]; then
  systemctl restart ssh
  log "sshd restarted with $DEPLOY_USER allowed"
else
  log "sshd configuration unchanged"
fi
