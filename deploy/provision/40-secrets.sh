#!/usr/bin/env bash
# Creates /etc/care-y/secrets.env, the operational secrets file the server
# reads at startup, with a freshly generated OPS_SECRETS_KEY and commented
# placeholders for the managed-telephony and platform SMTP credentials.
#
# Never overwrites an existing file. Regenerating OPS_SECRETS_KEY would
# orphan every row encrypted under it, so replacing the file is a deliberate
# manual act that belongs to the key rotation runbook, never a side effect of
# re-running provisioning. No secret value is ever printed.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require_root
getent passwd "$CAREY_SERVICE_USER" >/dev/null ||
  die "service user $CAREY_SERVICE_USER missing; run 10-users-ssh.sh first"
command -v openssl >/dev/null || die "openssl not found"

install -d -m 0750 -o root -g "$CAREY_SERVICE_USER" "$CAREY_SECRETS_DIR"

# generate_secrets_file: writes the file with owner-only permissions from the
# first byte. printf is a shell builtin: the key does not appear in any
# process argument list.
generate_secrets_file() {
  local ops_key
  ops_key="$(openssl rand -hex 32)"
  [[ "$ops_key" =~ ^[0-9a-f]{64}$ ]] || die "openssl returned a key in an unexpected format"
  (
    umask 077
    set -o noclobber
    printf '%s\n' \
      "# CARE-Y operational secrets. Never commit, never copy off-host." \
      "# Created by deploy/provision/40-secrets.sh. Key rotation follows the rotation runbook." \
      "OPS_SECRETS_KEY=$ops_key" \
      "# Managed telephony mode only (leave commented for BYOT orgs):" \
      "# TWILIO_MASTER_SID=" \
      "# TWILIO_MASTER_AUTH_TOKEN=" \
      "# TWILIO_API_KEY_SID=" \
      "# TWILIO_API_KEY_SECRET=" \
      "# Platform SMTP:" \
      "# SMTP_HOST=" \
      "# SMTP_PORT=" \
      "# SMTP_SECURE=" \
      "# SMTP_USER=" \
      "# SMTP_PASSWORD=" \
      >"$CAREY_SECRETS_FILE"
  ) || die "could not write $CAREY_SECRETS_FILE; inspect it before re-running (an existing file blocks regeneration)"
  unset ops_key
  chown "$CAREY_SERVICE_USER:$CAREY_SERVICE_USER" "$CAREY_SECRETS_FILE"
  chmod 0600 "$CAREY_SECRETS_FILE"
  log "created $CAREY_SECRETS_FILE with a new OPS_SECRETS_KEY (value not shown)"
}

if [ -L "$CAREY_SECRETS_FILE" ]; then
  die "$CAREY_SECRETS_FILE is a symlink, which the server refuses to read; investigate before continuing"
elif [ -e "$CAREY_SECRETS_FILE" ]; then
  log "$CAREY_SECRETS_FILE already exists; refusing to overwrite it (regenerating the ops key in place would orphan encrypted rows). Left untouched."
else
  generate_secrets_file
fi

bash "$CAREY_PROVISION_DIR/validate-secrets.sh"
