#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MESSAGE="${1:-Sync jucso-api from monorepo}"
WORKDIR="$(mktemp -d)"

cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

git clone --depth 1 https://github.com/stevechacha/jucso-api.git "$WORKDIR/api"
rsync -a \
  --exclude __pycache__ \
  --exclude .venv \
  --exclude db.sqlite3 \
  --exclude .DS_Store \
  "$ROOT/jucso-api/" "$WORKDIR/api/"

cd "$WORKDIR/api"
git add -A
if git diff --cached --quiet; then
  echo "jucso-api: no changes to push"
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main
echo "Pushed to https://github.com/stevechacha/jucso-api"
