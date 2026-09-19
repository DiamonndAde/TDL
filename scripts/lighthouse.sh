#!/usr/bin/env bash
# mobile: Lighthouse's default simulated Moto G Power / slow 4G throttling
npx --yes lighthouse http://localhost:3131/ --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility --form-factor=mobile --output=json --output-path="$1/lh-mobile.json" >/dev/null 2>&1
npx --yes lighthouse http://localhost:3131/ --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility --preset=desktop --output=json --output-path="$1/lh-desktop.json" >/dev/null 2>&1
node -e '
for (const f of ["lh-mobile","lh-desktop"]) {
  const r = JSON.parse(require("fs").readFileSync(process.argv[1]+"/"+f+".json","utf8")); const a = r.audits;
  const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet || a["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.snippet || "?";
  console.log(f, "| perf", Math.round(r.categories.performance.score*100), "| a11y", Math.round(r.categories.accessibility.score*100),
    "| LCP", a["largest-contentful-paint"].displayValue, "| FCP", a["first-contentful-paint"].displayValue, "| CLS", a["cumulative-layout-shift"].displayValue, "| TBT", a["total-blocking-time"].displayValue);
  console.log("   LCP element:", String(lcpEl).slice(0,140).replace(/\s+/g," "));
  const fails = Object.values(a).filter(x => x.score !== null && x.score < 0.9 && !["largest-contentful-paint","first-contentful-paint","speed-index","interactive","total-blocking-time","cumulative-layout-shift"].includes(x.id)).map(x=>x.id+"("+x.score+")");
  console.log("   audits < 0.9:", fails.join(", ") || "none");
}' "$1"
