#!/usr/bin/env bash
# Applied (observed) throttling: slow 4G + 4x CPU, the same profile as the simulated preset but measured, not modelled.
for i in 1 2; do
  powershell -NoProfile -Command "Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1
  npx --yes lighthouse http://localhost:3131/ --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --form-factor=mobile --throttling-method=devtools --output=json --output-path="$1/lh-devtools-$i.json" >/dev/null 2>&1
done
