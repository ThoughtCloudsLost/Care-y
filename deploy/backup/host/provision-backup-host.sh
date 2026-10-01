#!/usr/bin/env bash
# Provisions the restic REST backend on the backup host: rest-server in
# append-only mode behind a pinned self-signed certificate, reachable only
# from the primary host, and an sftp-only SSH login for the operator
# workstation's monthly prune. Run as root from an interactive terminal, once
# deploy/provision/10-users-ssh.sh and deploy/provision/20-network.sh (with
# CAREY_SKIP_WEB_PORTS=1) have run on this host.
#
# Inputs. None of them come from the repository, and no credential is ever a
# command-line argument, where ps and shell history would expose it.
#   CAREY_BACKUP_HTTP_USER   rest-server user name for the primary host. With
#                            --private-repos it is also the repository
#                            directory under /srv/restic.
#   CAREY_PRUNE_PUBKEY_FILE  file holding the public half of the operator
#                            workstation's SSH key, one line.
#   fd 3                     the primary host's rest-server password, one
#                            line. Read only while that user is missing from
#                            the htpasswd file.
#   fd 4                     the primary host's public IP address. Asked for
#                            on the terminal when fd 4 is not open.
#   fd 5                     this host's public IP address, written into the
#                            certificate. Read only while no certificate
#                            exists; asked for on the terminal when fd 5 is
#                            not open.
#
# No restic binary and no repository password exist on this host: it stores
# ciphertext only. Re-running converges and keeps the existing certificate,
# htpasswd entry and firewall rule.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=../../provision/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../provision/lib.sh"

# Pinned release, checked against the release's SHA256SUMS file.
REST_SERVER_VERSION="0.14.0"
REST_SERVER_SHA256="4c9c95bc079a0334e81fad379b19dc5c3353c71c2c88d652cafce2081c2b1c66"
REST_SERVER_DIRNAME="rest-server_${REST_SERVER_VERSION}_linux_amd64"
REST_SERVER_TARBALL="$REST_SERVER_DIRNAME.tar.gz"
REST_SERVER_URL="https://github.com/restic/rest-server/releases/download/v$REST_SERVER_VERSION/$REST_SERVER_TARBALL"
REST_SERVER_BIN="/usr/local/bin/rest-server"

REST_USER="restic"
REST_HOME="/home/$REST_USER"
REST_DATA="/srv/restic"
REST_TLS="/etc/restic-server"
REST_CERT="$REST_TLS/cert.pem"
REST_KEY="$REST_TLS/key.pem"
REST_HTPASSWD="$REST_TLS/.htpasswd"
REST_PORT="8000"
REST_UNIT="/etc/systemd/system/rest-server.service"
REST_SERVICE_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/rest-server.service"
SSHD_RESTIC_DROP_IN="/etc/ssh/sshd_config.d/52-care-y-restic.conf"

# htpasswd rejects ':' in user names, and the name becomes a directory.
HTTP_USER_RE='^[a-z][a-z0-9_-]{0,31}$'
# bcrypt reads at most 72 bytes of the password.
HTTP_PASSWORD_MIN_LENGTH="32"
HTTP_PASSWORD_MAX_LENGTH="72"

# fd_open FD: succeeds when file descriptor FD is open for reading.
fd_open() { { true <&"$1"; } 2>/dev/null; }

# valid_ip VALUE: succeeds when VALUE is one IPv4 or IPv6 host address
# (no prefix length, not unspecified, loopback or multicast).
valid_ip() {
  python3 - "$1" <<'PY' 2>/dev/null
import ipaddress
import sys

address = ipaddress.ip_address(sys.argv[1])
sys.exit(address.is_unspecified or address.is_loopback or address.is_multicast)
PY
}

# read_ip FD DESCRIPTION: prints one IP address read from FD, or from the
# terminal when FD is not open.
read_ip() {
  local fd="$1" description="$2" value=""
  if fd_open "$fd"; then
    IFS= read -r value <&"$fd" || [ -n "$value" ] || die "fd $fd is empty; expected the $description"
  else
    [ -t 0 ] || die "fd $fd is not open and there is no terminal to ask for the $description"
    IFS= read -r -p "Enter the $description: " value || die "no input for the $description"
  fi
  value="${value%$'\r'}"
  valid_ip "$value" || die "the $description is not a single IPv4 or IPv6 host address"
  printf '%s\n' "$value"
}

require_root

# --- Validate every input before touching anything --------------------------
arch="$(dpkg --print-architecture)"
[ "$arch" = "amd64" ] ||
  die "the pinned rest-server release is the linux_amd64 build; this host is $arch"
[ -f "$REST_SERVICE_SRC" ] || die "rest-server.service not found next to this script"
grep -q -- '--append-only' "$REST_SERVICE_SRC" ||
  die "rest-server.service does not pass --append-only, NOT installing"
command -v python3 >/dev/null || die "python3 not found; run deploy/provision/20-network.sh first"

[ -n "${CAREY_BACKUP_HTTP_USER:-}" ] ||
  die "set CAREY_BACKUP_HTTP_USER to the primary host's rest-server user name"
[[ "$CAREY_BACKUP_HTTP_USER" =~ $HTTP_USER_RE ]] ||
  die "CAREY_BACKUP_HTTP_USER must match $HTTP_USER_RE"
http_user="$CAREY_BACKUP_HTTP_USER"

[ -n "${CAREY_PRUNE_PUBKEY_FILE:-}" ] ||
  die "set CAREY_PRUNE_PUBKEY_FILE to the file holding the operator workstation's public key"
[ -f "$CAREY_PRUNE_PUBKEY_FILE" ] || die "prune public key not found: $CAREY_PRUNE_PUBKEY_FILE"
[ "$(count_keys "$CAREY_PRUNE_PUBKEY_FILE")" -eq 1 ] ||
  die "$CAREY_PRUNE_PUBKEY_FILE must hold exactly one key"
key_line="$(awk '!/^[[:space:]]*(#|$)/' "$CAREY_PRUNE_PUBKEY_FILE")"
key_line="${key_line%$'\r'}"
[[ "$key_line" =~ $CAREY_KEY_LINE_RE ]] ||
  die "the prune key must be a single public key line with no options"
ssh-keygen -l -f - <<<"$key_line" >/dev/null 2>&1 || die "unparseable prune key"
# Type and key only; the comment is dropped.
read -r key_type key_blob _ <<<"$key_line"

# The network script must already have run, with the web ports left closed.
command -v ufw >/dev/null || die "ufw not found; run deploy/provision/20-network.sh first"
ufw_status="$(ufw status)"
grep -qx 'Status: active' <<<"$ufw_status" ||
  die "UFW is not active; run CAREY_SKIP_WEB_PORTS=1 deploy/provision/20-network.sh first"
if grep -qE '^(80|443)(/tcp)?[[:space:]]' <<<"$ufw_status"; then
  die "UFW allows port 80 or 443; this host runs no web server. Delete those rules and re-run 20-network.sh with CAREY_SKIP_WEB_PORTS=1"
fi

# The certificate is generated once. The primary host pins it, so a new one
# breaks every backup until the primary carries the new file.
need_cert="no"
if [ ! -e "$REST_CERT" ] && [ ! -e "$REST_KEY" ]; then
  need_cert="yes"
elif [ ! -f "$REST_CERT" ] || [ ! -f "$REST_KEY" ]; then
  die "only one of $REST_CERT and $REST_KEY exists; investigate before continuing"
fi

need_http_user="yes"
if [ -f "$REST_HTPASSWD" ] && cut -d: -f1 "$REST_HTPASSWD" | grep -qxF -- "$http_user"; then
  need_http_user="no"
fi

http_password=""
if [ "$need_http_user" = "yes" ]; then
  fd_open 3 || die "pass the primary host's rest-server password on fd 3, for example 3< <file>"
  IFS= read -r http_password <&3 || [ -n "$http_password" ] ||
    die "fd 3 is empty; expected the primary host's rest-server password"
  http_password="${http_password%$'\r'}"
  [ "${#http_password}" -ge "$HTTP_PASSWORD_MIN_LENGTH" ] ||
    die "the rest-server password on fd 3 is shorter than $HTTP_PASSWORD_MIN_LENGTH characters"
  [ "${#http_password}" -le "$HTTP_PASSWORD_MAX_LENGTH" ] ||
    die "the rest-server password on fd 3 is longer than $HTTP_PASSWORD_MAX_LENGTH characters, which bcrypt would truncate"
fi

primary_ip="$(read_ip 4 "public IP address of the primary host")"
public_ip=""
if [ "$need_cert" = "yes" ]; then
  public_ip="$(read_ip 5 "public IP address of this backup host")"
fi

restart_needed="no"

apt_update
apt_install apache2-utils ca-certificates curl openssl

# --- restic user ------------------------------------------------------------
# Runs rest-server and owns the repository. Its SSH login is sftp only, for
# the operator workstation's prune. No shell, no password, no other groups.
if getent passwd "$REST_USER" >/dev/null; then
  log "user $REST_USER already present"
else
  useradd --system --user-group --shell /usr/sbin/nologin --home-dir "$REST_HOME" \
    --no-create-home "$REST_USER"
  log "created user $REST_USER"
fi
[ "$(getent passwd "$REST_USER" | cut -d: -f7)" = "/usr/sbin/nologin" ] ||
  die "$REST_USER has a login shell; investigate before continuing"
[ "$(id -nG "$REST_USER")" = "$REST_USER" ] ||
  die "$REST_USER belongs to groups other than its own; it must be in none"
# passwd -S status field: P = usable password.
password_status="$(passwd -S "$REST_USER")"
read -r _ password_state _ <<<"$password_status"
[ "$password_state" != "P" ] || die "$REST_USER has a usable password; it must have none"

install -d -m 0700 -o "$REST_USER" -g "$REST_USER" "$REST_DATA"
install -d -m 0700 -o "$REST_USER" -g "$REST_USER" "$REST_TLS"

# --- rest-server binary -----------------------------------------------------
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
log "downloading rest-server $REST_SERVER_VERSION"
curl -fsSL -o "$work_dir/$REST_SERVER_TARBALL" "$REST_SERVER_URL"
printf '%s  %s\n' "$REST_SERVER_SHA256" "$work_dir/$REST_SERVER_TARBALL" |
  sha256sum --check --quiet - || die "rest-server checksum mismatch, NOT installing"
tar -xzf "$work_dir/$REST_SERVER_TARBALL" -C "$work_dir" "$REST_SERVER_DIRNAME/rest-server"
write_file "$REST_SERVER_BIN" 0755 <"$work_dir/$REST_SERVER_DIRNAME/rest-server"
if file_changed; then
  restart_needed="yes"
fi

# --- TLS certificate --------------------------------------------------------
if [ "$need_cert" = "yes" ]; then
  (
    umask 077
    openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -noenc \
      -keyout "$REST_KEY" -out "$REST_CERT" -days 3650 \
      -subj "/CN=care-y-backup" -addext "subjectAltName=IP:${public_ip}"
  ) || die "certificate generation failed"
  restart_needed="yes"
  log "created a self-signed certificate valid for 10 years"
else
  log "keeping the existing certificate; the primary host pins it"
fi
chown "$REST_USER:$REST_USER" "$REST_KEY" "$REST_CERT"
chmod 0600 "$REST_KEY"
chmod 0644 "$REST_CERT"

# --- htpasswd ---------------------------------------------------------------
# bcrypt, the scheme rest-server recommends. -i reads the password from stdin.
# printf is a shell builtin and starts no process whose arguments ps could
# show. -c creates the file on the first run; without it htpasswd adds the
# user to the existing file.
if [ "$need_http_user" = "yes" ]; then
  if [ -f "$REST_HTPASSWD" ]; then
    (
      umask 077
      printf '%s\n' "$http_password" | htpasswd -B -C 12 -i "$REST_HTPASSWD" "$http_user"
    ) || die "htpasswd failed to add $http_user"
  else
    (
      umask 077
      printf '%s\n' "$http_password" | htpasswd -c -B -C 12 -i "$REST_HTPASSWD" "$http_user"
    ) || die "htpasswd failed to create $REST_HTPASSWD"
  fi
  restart_needed="yes"
  log "added rest-server user $http_user"
else
  log "rest-server user $http_user already present"
fi
http_password=""
unset http_password
chown "$REST_USER:$REST_USER" "$REST_HTPASSWD"
chmod 0600 "$REST_HTPASSWD"

# --- Firewall ---------------------------------------------------------------
# The rest-server port is open to the primary host's address only. UFW skips
# a rule that already exists, so re-runs add nothing.
ufw allow from "$primary_ip" to any port "$REST_PORT" proto tcp comment 'rest-server, primary host only'

# --- sftp-only SSH for the operator's prune ---------------------------------
# The prune runs from the operator workstation over restic's sftp backend,
# which reaches the repository files directly and so is not bound by
# rest-server's server-wide --append-only. The workstation key is the only
# key this user has. The home directory, .ssh and authorized_keys are
# root-owned, so an sftp session cannot add keys of its own.
install -d -m 0755 -o root -g root "$REST_HOME"
install -d -m 0755 -o root -g root "$REST_HOME/.ssh"
write_file "$REST_HOME/.ssh/authorized_keys" 0644 <<EOF
restrict $key_type $key_blob
EOF

# AllowUsers entries from every file add to one list (sshd_config(5)), so this
# drop-in extends the list 10-users-ssh.sh writes. sshd ends a Match block at
# the end of the included file, so the block below covers only this file.
write_file "$SSHD_RESTIC_DROP_IN" 0644 <<EOF
# Managed by deploy/backup/host/provision-backup-host.sh. Do not edit by hand.
AllowUsers $CAREY_ADMIN_USER $REST_USER

Match User $REST_USER
  ForceCommand internal-sftp
  DisableForwarding yes
  PermitTTY no
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
for expected in "allowusers $CAREY_ADMIN_USER" "allowusers $REST_USER"; do
  grep -qx "$expected" <<<"$effective" ||
    die "effective sshd config lacks '$expected', NOT restarting"
done
effective_restic="$(sshd -T -C "user=$REST_USER,host=localhost,addr=127.0.0.1")"
for expected in "forcecommand internal-sftp" "disableforwarding yes" "permittty no"; do
  grep -qx "$expected" <<<"$effective_restic" ||
    die "effective sshd config for $REST_USER lacks '$expected', NOT restarting"
done

if [ "$sshd_changed" = "yes" ]; then
  systemctl restart ssh
  log "sshd restarted with $REST_USER allowed for sftp only"
else
  log "sshd configuration unchanged"
fi

# --- rest-server service ----------------------------------------------------
write_file "$REST_UNIT" 0644 <"$REST_SERVICE_SRC"
if file_changed; then
  restart_needed="yes"
fi
systemctl daemon-reload
systemctl enable rest-server.service
if [ "$restart_needed" = "yes" ]; then
  systemctl restart rest-server.service
else
  systemctl start rest-server.service
fi
systemctl is-active --quiet rest-server.service ||
  die "rest-server is not running; check journalctl -u rest-server"

fingerprint="$(openssl x509 -in "$REST_CERT" -noout -fingerprint -sha256)"
log "certificate $fingerprint"
log "record this fingerprint in the backups runbook and compare it on the primary host after copying the certificate"
log "rest-server listening on :$REST_PORT with append-only mode; copy $REST_CERT to the primary"
