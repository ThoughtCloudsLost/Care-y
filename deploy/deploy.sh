#!/usr/bin/env bash
# Forced command for the deploy key. Accepts "deploy <sha>" or "version"
# from SSH_ORIGINAL_COMMAND (or as arguments from an operator shell),
# refuses anything else.
#
# "deploy <sha>" hands the validated words to the root stage.
# "version" prints the SHA-256 of the two installed deploy scripts, which
# no release refreshes (provisioning installs them once). The release
# workflow compares them with the repository's copies before deploying,
# so a changed script fails the release instead of drifting on the host.
set -euo pipefail
read -r verb tag <<<"${SSH_ORIGINAL_COMMAND:-$*}"
case "$verb" in
  version)
    [[ -z "${tag:-}" ]] || { echo "refused" >&2; exit 2; }
    sha256sum /usr/local/bin/care-y-deploy /usr/local/bin/care-y-deploy-root
    ;;
  deploy)
    [[ "$tag" =~ ^[0-9a-f]{40}$ ]] || { echo "refused" >&2; exit 2; }
    exec sudo -n /usr/local/bin/care-y-deploy-root deploy "$tag"
    ;;
  *)
    echo "refused" >&2
    exit 2
    ;;
esac
