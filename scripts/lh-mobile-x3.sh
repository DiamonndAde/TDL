#!/usr/bin/env bash
# Three mobile runs, to see variance. Writes lh-mobile-1..3.json into $1.
for i in 1 2 3; do
  powershell -NoProfile -Command "Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1
  npx --yes lighthouse http://localhost:3131/ --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --form-factor=mobile --output=json --output-path="$1/lh-mobile-$i.json" >/dev/null 2>&1
done
