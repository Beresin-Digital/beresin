#!/usr/bin/env bash
# Runs ON the staging box, invoked by the staging CI workflow via SSM
# (AWS-RunShellScript). Mirrors deploy/deploy.sh from the repo, adapted:
# - image comes from GHCR, not from an scp'd tarball
# - compose.yml + init-db.sh are fetched from the exact commit being deployed
#   (tag staging-<sha> carries the sha), so the box never runs stale config
# - project name beresin-staging keeps containers/volumes apart from prod
#   patterns; the box itself is staging-only, so no prod collision is possible
# - the GHCR package is private, so this script logs in to GHCR and fetches
#   repo files with a token from .env (GHCR_TOKEN). The same token must cover
#   both: repo read (for raw.githubusercontent) and packages read (for the pull)
set -euo pipefail

image=${1:?Usage: deploy.sh ghcr.io/beresin-digital/beresin:staging-<sha>}
[[ $image =~ ^ghcr.io/beresin-digital/beresin:staging-[a-f0-9]{40}$ ]] || {
  echo 'Invalid image tag' >&2
  exit 1
}
sha=${image##*:staging-}
root=/opt/staging
cd "$root"

test -s .env
set -a
source "$root/.env"
set +a
if [[ -z ${GHCR_TOKEN:-} ]]; then
  echo 'GHCR_TOKEN is not set in /opt/staging/.env; cannot pull the private image.' >&2
  exit 1
fi
echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-x-access-token}" --password-stdin

previous=$(cat "$root/current-image" 2>/dev/null || true)
rollback() {
  if [[ -n $previous ]]; then
    echo 'Deployment failed; restoring previous app image.' >&2
    BERESIN_IMAGE=$previous docker compose --project-name beresin-staging \
      --env-file "$root/.env" -f "$root/compose.yml" up -d --no-deps --wait app || true
  fi
}
trap rollback ERR

auth=(-H "Authorization: Bearer $GHCR_TOKEN")
curl -fsSL "${auth[@]}" "https://raw.githubusercontent.com/Beresin-Digital/beresin/${sha}/deploy/compose.yml" -o "$root/compose.yml"
curl -fsSL "${auth[@]}" "https://raw.githubusercontent.com/Beresin-Digital/beresin/${sha}/deploy/init-db.sh" -o "$root/init-db.sh"
docker pull "$image"

compose=(docker compose --project-name beresin-staging --env-file "$root/.env" -f "$root/compose.yml")
export BERESIN_IMAGE=$image
"${compose[@]}" up -d --wait db
# Migrations are forward-only; review destructive SQL before merging staging.
"${compose[@]}" run --rm --no-deps app node node_modules/drizzle-kit/bin.cjs migrate
"${compose[@]}" up -d --wait --wait-timeout 120 app
printf '%s\n' "$image" > "$root/current-image"
trap - ERR
echo "Deployed $image"
