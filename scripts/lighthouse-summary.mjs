// Summarise Lighthouse JSON reports produced by scripts/lighthouse.sh: node scripts/lighthouse-summary.mjs <dir>
import fs from "node:fs";
const dir = process.argv[2];
for (const f of ["lh-mobile", "lh-desktop"]) {
  const p = `${dir}/${f}.json`;
  if (!fs.existsSync(p)) { console.log(f, "missing"); continue; }
  const r = JSON.parse(fs.readFileSync(p, "utf8")); const a = r.audits;
  const el = a["largest-contentful-paint-element"]?.details?.items?.[0];
  const snippet = el?.items?.[0]?.node?.snippet ?? el?.node?.snippet ?? "?";
  console.log(`${f} | perf ${Math.round(r.categories.performance.score*100)} | a11y ${Math.round(r.categories.accessibility.score*100)} | LCP ${a["largest-contentful-paint"].displayValue} | FCP ${a["first-contentful-paint"].displayValue} | CLS ${a["cumulative-layout-shift"].displayValue} | TBT ${a["total-blocking-time"].displayValue}`);
  console.log("   LCP element:", String(snippet).replace(/\s+/g, " ").slice(0, 160));
  const skip = new Set(["largest-contentful-paint","first-contentful-paint","speed-index","interactive","total-blocking-time","cumulative-layout-shift"]);
  const fails = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && !skip.has(x.id)).map((x) => `${x.id}(${x.score})`);
  console.log("   audits < 0.9:", fails.join(", ") || "none");
}
