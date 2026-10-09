#!/usr/bin/env bash
set -euo pipefail
release=$(cd -- "$(dirname -- "$0")" && pwd)
root=$(cd -- "$release/../.." && pwd)
image=${1:?Usage: deploy.sh beresin:<commit>}
[[ $image =~ ^beresin:[a-f0-9]{40}$ ]] || { echo 'Invalid image tag' >&2; exit 1; }
cd "$root"
test -s .env
exec 9>.deploy.lock
flock -x 9
export BERESIN_IMAGE=$image
compose=(docker compose --project-name beresin --env-file "$root/.env" -f "$release/compose.yml")
previous=$(readlink "$root/current" || true)
rollback() {
  if [[ -n $previous && -s $previous/image ]]; then
    echo 'Deployment failed; restoring previous app image.' >&2
    BERESIN_IMAGE=$(cat "$previous/image") docker compose --project-name beresin \
      --env-file "$root/.env" -f "$previous/compose.yml" up -d --no-deps --wait app || true
  fi
}
trap rollback ERR
"${compose[@]}" up -d --wait db
# shortcut: migrations are forward-only; review destructive SQL before pushing master.
"${compose[@]}" run --rm --no-deps app node node_modules/drizzle-kit/bin.cjs migrate
"${compose[@]}" up -d --wait --wait-timeout 120 app
printf '%s\n' "$image" > "$release/image"
ln -sfn "$release" "$root/current"
trap - ERR
echo "Deployed $image"
