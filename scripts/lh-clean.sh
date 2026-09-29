#!/usr/bin/env bash
# Lighthouse with Chrome killed before every run — headless instances leak on Windows and inflate TBT
# (docs/DESIGN-DECISIONS.md, measurement hygiene). Usage:
#   bash scripts/serve-and-run.sh bash scripts/lh-clean.sh <outdir> <method: simulate|devtools> <route>...
OUT="$1"; METHOD="$2"; shift 2
for spec in "$@"; do
  route=$([ "$spec" = "_" ] && echo "" || echo "$spec")
  tag=$([ "$spec" = "_" ] && echo "home" || echo "$(echo "$spec" | tr '/' '-')")
  powershell -NoProfile -Command "Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1
  npx --yes lighthouse "http://localhost:3131/$route" --quiet --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility --form-factor=mobile --throttling-method="$METHOD" \
    --output=json --output-path="$OUT/clean-$METHOD-$tag.json" >/dev/null 2>&1
  echo "done $tag ($METHOD)"
done
powershell -NoProfile -Command "Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1
