#!/usr/bin/env bash
npx --yes lighthouse http://localhost:3131/ --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --form-factor=mobile --output=json --output-path="$1/lh-mobile.json" >/dev/null 2>&1
