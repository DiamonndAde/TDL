#!/usr/bin/env node
/**
 * First-load JS per route, as transferred (gzip), from a production server.
 * Next 16 dropped this from `next build` output, so this is the number the 200 KB budget is checked against.
 *
 *   npm run build && node scripts/first-load.mjs [/ /services ...]
 *
 * Starts `next start` on a free port, fetches each route's HTML, collects every <script src> and
 * <link rel="modulepreload"> that points at /_next/static, downloads each once, and reports raw + gzip totals.
 * Lazy chunks loaded later by dynamic import are excluded by construction â€” they are not first-load.
 */
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import { createServer } from "node:net";

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
// Budget (AGENTS.md): the framework floor plus 60 KB of our own code. Floor measured 2026-09-18 with an empty page.
const FLOOR_KB = 141.7;
const OWN_BUDGET_KB = 60;
const BUDGET_KB = FLOOR_KB + OWN_BUDGET_KB;

const port = await new Promise((res) => {
  const s = createServer();
  s.listen(0, () => {
    const p = s.address().port;
    s.close(() => res(p));
  });
});

const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  shell: process.platform === "win32",
});
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("next start timed out")), 30000);
  server.stdout.on("data", (d) => {
    if (String(d).includes("Ready")) {
      clearTimeout(t);
      res();
    }
  });
  server.stderr.on("data", (d) => process.stderr.write(d));
});

const base = `http://localhost:${port}`;
const cache = new Map();
async function sizeOf(url) {
  if (cache.has(url)) return cache.get(url);
  const buf = Buffer.from(await (await fetch(base + url)).arrayBuffer());
  const r = { raw: buf.length, gz: gzipSync(buf, { level: 6 }).length };
  cache.set(url, r);
  return r;
}

let worst = 0;
for (const route of routes) {
  const html = await (await fetch(base + route)).text();
  const urls = new Set();
  // nomodule scripts (core-js polyfills) are never downloaded by a browser that runs modules; skip them.
  for (const m of html.matchAll(/<script([^>]+)>/g)) {
    const attrs = m[1];
    if (/nomodule/i.test(attrs)) continue;
    const src = attrs.match(/src="([^"]+)"/)?.[1];
    if (src && src.startsWith("/_next/static")) urls.add(src);
  }
  for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g))
    if (m[1].startsWith("/_next/static")) urls.add(m[1]);
  let raw = 0,
    gz = 0;
  const rows = [];
  for (const u of urls) {
    const s = await sizeOf(u);
    raw += s.raw;
    gz += s.gz;
    rows.push([u.split("/").pop(), s.gz]);
  }
  rows.sort((a, b) => b[1] - a[1]);
  const kb = gz / 1024;
  worst = Math.max(worst, kb);
  const own = Math.max(0, kb - FLOOR_KB);
  console.log(`
${route}  -  ${urls.size} scripts, ${(raw / 1024).toFixed(1)} KB raw, ${kb.toFixed(1)} KB gzip = floor ${FLOOR_KB} + own ${own.toFixed(1)} KB  ${own > OWN_BUDGET_KB ? "OVER BUDGET" : "ok"}`);
  for (const [name, g] of rows) console.log(`   ${(g / 1024).toFixed(1).padStart(7)} KB  ${name}`);
}
console.log(`
Budget: floor ${FLOOR_KB} KB + ${OWN_BUDGET_KB} KB own code = ${BUDGET_KB.toFixed(1)} KB gzip. Worst route: ${worst.toFixed(1)} KB.`);
server.kill();
process.exit(worst > BUDGET_KB ? 1 : 0);
