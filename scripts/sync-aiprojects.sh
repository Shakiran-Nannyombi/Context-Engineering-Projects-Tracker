#!/usr/bin/env bash
# Sync Context Engineering showroom (docs/) into the portfolio GitHub Pages path:
#   Shakiran-myPortfolio/public/aiprojects/
# Live URL after portfolio deploy: https://www.shakiran.dev/aiprojects/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$TRACKER_ROOT/docs/"
DEST_DEFAULT="$(cd "$TRACKER_ROOT/../Shakiran-myPortfolio/public/aiprojects" 2>/dev/null && pwd || true)"
DEST="${1:-$DEST_DEFAULT}"

if [[ -z "$DEST" || ! -d "$(dirname "$DEST")" ]]; then
  echo "Usage: $0 /path/to/Shakiran-myPortfolio/public/aiprojects"
  echo "Could not find sibling Shakiran-myPortfolio/public/aiprojects"
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete \
  --exclude 'node_modules/' \
  --exclude '__tests__/' \
  --exclude 'CNAME' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude 'minify.js' \
  --exclude 'types.ts' \
  --exclude 'reads/' \
  "$SRC" "$DEST/"

echo "Synced $SRC -> $DEST/"
echo "Next: commit & push Shakiran-myPortfolio so GitHub Pages serves https://www.shakiran.dev/aiprojects/"
