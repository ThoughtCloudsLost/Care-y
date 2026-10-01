#!/usr/bin/env bash
# Runs the numbered provisioning scripts in order, then the verification
# script. Every step is safe to re-run and converges on the same host state.
# Stops at the first failing step.
#
# Run as root from an interactive terminal: 10-users-ssh.sh asks for the
# carey-admin sudo password on the first run.
set -euo pipefail
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

STEPS=(
  10-users-ssh.sh
  20-network.sh
  30-memory-docker.sh
  40-secrets.sh
  50-logging.sh
  99-verify.sh
)

require_root

# Fail before changing anything when the tracked key set is missing or short.
read_team_keys "$CAREY_TEAM_KEYS_DIR" >/dev/null
log "team key set: $CAREY_TEAM_KEYS_DIR"

for step in "${STEPS[@]}"; do
  log "=== $step"
  bash "$CAREY_PROVISION_DIR/$step"
done
log "provisioning complete"
