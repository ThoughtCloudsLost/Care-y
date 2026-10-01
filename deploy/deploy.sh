#!/usr/bin/env bash
# Forced command for the deploy key. Accepts "deploy <sha>" from
# SSH_ORIGINAL_COMMAND (or as arguments from an operator shell), refuses
# anything else, then hands the validated words to the root stage.
set -euo pipefail
read -r verb tag <<<"${SSH_ORIGINAL_COMMAND:-$*}"
[[ "$verb" == "deploy" && "$tag" =~ ^[0-9a-f]{40}$ ]] || { echo "refused" >&2; exit 2; }
exec sudo -n /usr/local/bin/care-y-deploy-root deploy "$tag"
