#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MESSAGE="${1:-Sync jucso-web from monorepo}"
WORKDIR="$(mktemp -d)"

cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

git clone --depth 1 https://github.com/stevechacha/jucso-web.git "$WORKDIR/web"
rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .DS_Store \
  "$ROOT/jucso-web/" "$WORKDIR/web/"

cd "$WORKDIR/web"
git add -A
if git diff --cached --quiet; then
  echo "jucso-web: no changes to push"
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main
echo "Pushed to https://github.com/stevechacha/jucso-web"
