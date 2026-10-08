/**
 * Lighthouse gate for Tier 3. Reads every Lighthouse JSON in a directory, prints one line per route, and fails
 * only on what the project actually gates on:
 *
 *   - accessibility below 100 (it is 100 on every route; a drop means a regression, not noise)
 *   - CLS at or above 0.1 (the brief's requirement; deterministic enough to gate)
 *
 * Performance score and simulated LCP are reported and NOT gated. The simulated (Lantern) LCP on localhost is a
 * known artefact — it treats every framework request as an LCP dependency — and was accepted as "recorded, not
 * targeted" on 2026-09-19. The LCP requirement is gated by the applied-throttling probe instead
 * (scripts/android-probe.py), which Tier 3 also runs.
 *
 * Usage: node scripts/lighthouse-gate.mjs <dir>
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node scripts/lighthouse-gate.mjs <dir>");
  process.exit(2);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) {
  console.error(`FAIL  no Lighthouse reports in ${dir}`);
  process.exit(1);
}

const failures = [];
for (const f of files) {
  const r = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const a = r.audits;
  const c = r.categories;
  const route = f.replace(/^clean-[a-z]+-|\.json$/g, "");
  const a11y = c.accessibility ? Math.round(c.accessibility.score * 100) : null;
  const perf = c.performance ? Math.round(c.performance.score * 100) : null;
  const cls = a["cumulative-layout-shift"]?.numericValue ?? null;
  const line =
    `${route.padEnd(30)} perf ${String(perf).padStart(3)} a11y ${String(a11y).padStart(3)} ` +
    `| LCP ${(a["largest-contentful-paint"]?.displayValue ?? "-").padStart(6)} ` +
    `CLS ${cls === null ? "-" : cls.toFixed(3)} TBT ${(a["total-blocking-time"]?.displayValue ?? "-").padStart(7)}`;
  console.log(line);
  if (a11y !== null && a11y < 100) failures.push(`${route}: accessibility ${a11y}`);
  if (cls !== null && cls >= 0.1) failures.push(`${route}: CLS ${cls.toFixed(3)}`);
}

console.log(`\nFAILURES: ${failures.length ? failures.join(", ") : "none"}`);
process.exit(failures.length ? 1 : 0);
