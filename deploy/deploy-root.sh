#!/usr/bin/env bash
# Root stage. Re-validates its two arguments (defence in depth; the sudoers
# rule already pins the first word) and never reads SSH_ORIGINAL_COMMAND.
set -euo pipefail
# Everything after the log setup goes to a root-only log on the host. The
# caller (and so the public Actions log) gets one summary line on the original
# stdout, kept as fd 3: the tag and "ok", or the step that failed.
exec 3>&1
step='log-setup'
on_exit() {
  local rc=$?
  if [[ $rc -eq 0 ]]; then
    echo "deploy $tag: ok" >&3
  else
    echo "deploy ${tag:-?}: failed at $step" >&3
  fi
  exit "$rc"
}
trap on_exit EXIT
log_dir=/var/log/care-y
log=$log_dir/deploy.log
[[ -d $log_dir ]] || install -d -m 0700 -o root -g root "$log_dir"
[[ -e $log ]] || ( umask 077 && : >"$log" )
chmod 0600 "$log"
exec >>"$log" 2>&1
step=validate
[[ "${1:-}" == "deploy" && "${2:-}" =~ ^[0-9a-f]{40}$ ]] || { echo "refused" >&2; exit 2; }
tag=$2
echo "== $(date -u +%Y-%m-%dT%H:%M:%SZ) deploy $tag"
step=set-image-tag
cd /opt/care-y
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$tag/" prod.env
set -a
# shellcheck source-path=SCRIPTDIR
# shellcheck source=prod.env.example
. ./prod.env   # GHCR_OWNER, CAREY_APEX_HOST; non-secret by contract (deploy/prod.env.example)
set +a
step=pull
docker compose --env-file prod.env -f docker-compose.prod.yml pull
step=refresh-files
# Refresh the host copies of the deployable files from the pulled image.
cid=$(docker create "ghcr.io/${GHCR_OWNER}/care-y-api:${tag}")
docker cp "$cid:/opt/care-y-dist/docker-compose.prod.yml" docker-compose.prod.yml
docker cp "$cid:/opt/care-y-dist/Caddyfile" deploy/caddy/Caddyfile
docker cp "$cid:/opt/care-y-dist/apex.html" static/apex.html
docker rm "$cid" >/dev/null
step=migrate
docker compose --env-file prod.env -f docker-compose.prod.yml run --rm api \
  pnpm --filter @care-y/server exec tsx src/db/migrate.ts --all-schemas
step=up
docker compose --env-file prod.env -f docker-compose.prod.yml up -d --remove-orphans
step=apex-probe
curl -fsS --max-time 10 --resolve "${CAREY_APEX_HOST}:443:127.0.0.1" "https://${CAREY_APEX_HOST}/" >/dev/null   # apex page over TLS (staging CA during first setup: add -k only on that run, from the runbook, never in this file)
step=health-probe
# The API can still be starting after "up -d", so probe up to 30 times, 2 seconds apart.
for attempt in {1..30}; do
  if docker compose --env-file prod.env -f docker-compose.prod.yml exec -T api \
    node -e 'fetch("http://127.0.0.1:3000/health").then(r=>process.exit(r.ok?0:1))'; then   # tRPC publicProcedure "health" at the API root (routes/router.ts)
    break
  fi
  if (( attempt == 30 )); then exit 1; fi
  sleep 2
done
