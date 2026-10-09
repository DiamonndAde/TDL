/**
 * Proof for scripts/posthog-setup.mjs and scripts/posthog-seed.mjs, against an in-memory stand-in for
 * PostHog's API. No real project is touched: the scripts are run with POSTHOG_SCRIPTS_NO_DOTENV=1, so the keys
 * in .env.local are never loaded, and every host points at the local stand-in.
 *
 *   node scripts/posthog-scripts-proof.mjs   (exits 1 on any failure)
 *
 * Setup: creates the dashboard, seven insights and two text tiles, label first; a second run changes nothing;
 * --production removes the label and keeps the rest; a second --production run changes nothing.
 * Seed: every lock refuses on its own and sends nothing; a valid run sends events that match the site's
 * contract, all tagged demo, none email- or phone-shaped; a rerun is refused by the rerun guard.
 *
 * What this cannot prove: that PostHog's real query engine accepts the insight queries. The setup script
 * checks that itself on its first real run, by running each query before saving it.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PROJECT = { id: 4242, name: "TDL Demo", api_token: "phc_proof_key" };
let state;
const reset = () => {
  state = { dashboards: [], insights: [], tiles: [], batches: [], mutations: 0, nextId: 100 };
};
reset();
const id = () => state.nextId++;

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const url = new URL(req.url, "http://x");
    const path = url.pathname;
    const json = body ? JSON.parse(body) : null;
    const send = (code, obj) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(obj));
    };
    const m = (re) => path.match(re);
    if (req.method !== "GET" && !path.endsWith("/query/")) state.mutations++;

    if (m(/^\/api\/organizations\/@current\/projects\/(\d+)\/$/))
      return Number(m(/(\d+)\/$/)[1]) === PROJECT.id ? send(200, PROJECT) : send(404, { detail: "Not found." });
    if (path === "/batch/") {
      state.batches.push(json);
      return send(200, { status: 1 });
    }
    if (path.endsWith("/query/")) {
      const q = json?.query ?? {};
      if (q.kind === "HogQLQuery") {
        const n = state.batches.flatMap((b) => b.batch).filter((e) => e.properties?.demo === true).length;
        return send(200, { results: [[n]] });
      }
      const ok = ["FunnelsQuery", "TrendsQuery"].includes(q.kind) && Array.isArray(q.series) && q.series.length > 0 &&
        q.series.every((s) => s.kind === "EventsNode" && typeof s.event === "string");
      return ok ? send(200, { results: [] }) : send(400, { detail: `stub rejected query kind ${q.kind}` });
    }
    const dashTiles = (dashId) => [
      ...state.insights.filter((i) => (i.dashboards ?? []).includes(dashId)).map((i) => ({ id: i.tileId, insight: { id: i.id } })),
      ...state.tiles.filter((t) => t.dashboard === dashId),
    ].sort((a, b) => (state.order?.[dashId]?.indexOf(a.id) ?? 0) - (state.order?.[dashId]?.indexOf(b.id) ?? 0));

    if (m(/\/dashboards\/$/) && req.method === "GET") {
      const q = url.searchParams.get("search") ?? "";
      return send(200, { results: state.dashboards.filter((d) => d.name.includes(q)), next: null });
    }
    if (m(/\/dashboards\/$/) && req.method === "POST") {
      const d = { id: id(), name: json.name, description: json.description ?? "", deleted: false };
      state.dashboards.push(d);
      return send(201, { ...d, tiles: [] });
    }
    const dm = m(/\/dashboards\/(\d+)\/(?:([a-z_]+)\/)?$/);
    if (dm) {
      const dash = state.dashboards.find((d) => d.id === Number(dm[1]));
      if (!dash) return send(404, { detail: "Not found." });
      const action = dm[2];
      if (!action && req.method === "GET") return send(200, { ...dash, tiles: dashTiles(dash.id) });
      if (!action && req.method === "PATCH") {
        Object.assign(dash, json);
        return send(200, dash);
      }
      if (action === "create_text_tile") {
        state.tiles.push({ id: id(), dashboard: dash.id, text: { body: json.body } });
        return send(200, {});
      }
      if (action === "update_text_tile") {
        const t = state.tiles.find((x) => x.id === json.tile_id);
        if (!t) return send(404, { detail: "no tile" });
        t.text.body = json.body;
        return send(200, {});
      }
      if (action === "delete_tile") {
        state.tiles = state.tiles.filter((x) => x.id !== json.tile_id);
        return send(200, {});
      }
      if (action === "reorder_tiles") {
        state.order = { ...(state.order ?? {}), [dash.id]: json.tile_order };
        return send(200, {});
      }
    }
    if (m(/\/insights\/$/) && req.method === "GET") {
      const q = url.searchParams.get("search") ?? "";
      return send(200, { results: state.insights.filter((i) => i.name.includes(q)), next: null });
    }
    if (m(/\/insights\/$/) && req.method === "POST") {
      const i = { id: id(), tileId: id(), deleted: false, ...json };
      state.insights.push(i);
      return send(201, i);
    }
    const im = m(/\/insights\/(\d+)\/$/);
    if (im && req.method === "PATCH") {
      const i = state.insights.find((x) => x.id === Number(im[1]));
      Object.assign(i, json);
      return send(200, i);
    }
    send(404, { detail: `stub has no route for ${req.method} ${path}` });
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const HOST = `http://127.0.0.1:${server.address().port}`;

const baseEnv = {
  PATH: process.env.PATH,
  SYSTEMROOT: process.env.SYSTEMROOT ?? "",
  POSTHOG_SCRIPTS_NO_DOTENV: "1",
  POSTHOG_APP_HOST: HOST,
  POSTHOG_INGEST_HOST: HOST,
  NEXT_PUBLIC_POSTHOG_HOST: HOST,
  POSTHOG_PROJECT_ID: String(PROJECT.id),
  POSTHOG_PERSONAL_API_KEY: "phx_proof",
  NEXT_PUBLIC_POSTHOG_KEY: PROJECT.api_token,
  POSTHOG_SEED_DEMO_PROJECT: PROJECT.name,
};
/** Async on purpose: the stand-in runs in this process, so a synchronous spawn would block it from answering. */
const run = (script, args = [], env = {}) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...args], { env: { ...baseEnv, ...env } });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    const timer = setTimeout(() => child.kill(), 120000);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out });
    });
  });

const failures = [];
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label}${detail ? `: ${detail}` : ""}`);
  if (!ok) failures.push(label);
};
const textTiles = () => state.tiles.map((t) => t.text.body.split("\n")[0]);

// ── setup ──────────────────────────────────────────────────────────────────────────────────────────────────
console.log("posthog-setup.mjs");
let r = await run("scripts/posthog-setup.mjs", ["--dry-run"]);
check(r.code === 0 && state.mutations === 0, "dry run changes nothing", `exit ${r.code}, ${state.mutations} writes`);

r = await run("scripts/posthog-setup.mjs");
const dash = state.dashboards[0];
check(r.code === 0, "first run succeeds", r.code === 0 ? "" : r.out.slice(-300));
check(state.dashboards.length === 1 && dash?.name === "TDL — Careers & enquiries", "creates the dashboard by name");
check(state.insights.length === 7, "creates seven insights", String(state.insights.length));
check(/SAMPLE DATA FOR DEMONSTRATION/.test(dash?.description ?? ""), "demo description carries the sample-data label");
check(textTiles().includes("## Sample data for demonstration") && textTiles().includes("### Per-role clicks"),
  "adds the sample-data label and the Q29 per-role note", JSON.stringify(textTiles()));
const order = state.order?.[dash?.id] ?? [];
const labelTile = state.tiles.find((t) => t.text.body.startsWith("## Sample"));
check(order[0] === labelTile?.id, "the sample-data label is the first tile");
check(state.insights.every((i) => /\[managed by scripts\/posthog-setup\.mjs · [0-9a-f]{10}\]$/.test(i.description)),
  "every insight is marked as managed, with its definition hash");

const before = state.mutations;
r = await run("scripts/posthog-setup.mjs");
check(r.code === 0 && state.mutations === before, "a second run changes nothing", `${state.mutations - before} writes; ${r.out.match(/Nothing needed changing|change\(s\) made/)?.[0]}`);
check(state.dashboards.length === 1 && state.insights.length === 7 && state.tiles.length === 2, "and creates no duplicates");

// A hand-made insight with the same name must not be touched.
state.insights.push({ id: 9001, tileId: 9002, name: "Scroll depth on /careers", description: "made by hand", dashboards: [], deleted: false, query: {} });
r = await run("scripts/posthog-setup.mjs");
check(state.insights.find((i) => i.id === 9001).description === "made by hand", "an unmanaged insight with the same name is left alone");
state.insights = state.insights.filter((i) => i.id !== 9001);

r = await run("scripts/posthog-setup.mjs", ["--production"]);
check(r.code === 0, "--production run succeeds", r.code === 0 ? "" : r.out.slice(-300));
check(!textTiles().includes("## Sample data for demonstration"), "--production removes the sample-data label tile", JSON.stringify(textTiles()));
check(textTiles().includes("### Per-role clicks"), "--production keeps the Q29 note");
check(!/SAMPLE DATA/.test(state.dashboards[0].description), "--production description has no sample-data label");
const beforeProd = state.mutations;
r = await run("scripts/posthog-setup.mjs", ["--production"]);
check(state.mutations === beforeProd, "a second --production run changes nothing", `${state.mutations - beforeProd} writes`);

// ── seed: the locks ────────────────────────────────────────────────────────────────────────────────────────
console.log("\nposthog-seed.mjs — every lock refuses, and nothing is sent");
const refuse = async (label, env, expect) => {
  const sent = state.batches.length;
  const res = await run("scripts/posthog-seed.mjs", [], env);
  const ok = res.code === 1 && expect.test(res.out) && state.batches.length === sent;
  check(ok, label, ok ? (res.out.match(/Lock \d/)?.[0] ?? "") : `exit ${res.code}, batches +${state.batches.length - sent}, ${res.out.slice(-160).trim()}`);
};
await refuse("POSTHOG_SEED_DEMO_PROJECT unset", { POSTHOG_SEED_DEMO_PROJECT: "" }, /Lock 1/);
await refuse("marker does not contain \"demo\"", { POSTHOG_SEED_DEMO_PROJECT: "Total Data Limited" }, /Lock 1/);
await refuse("marker names a different project", { POSTHOG_SEED_DEMO_PROJECT: "TDL Demo 2" }, /Lock 2/);
PROJECT.name = "Total Data Limited";
await refuse("real project, even with a demo-ish marker", { POSTHOG_SEED_DEMO_PROJECT: "Total Data Limited demo" }, /Lock 2/);
PROJECT.name = "TDL Demo";
await refuse("key belongs to a different project", { NEXT_PUBLIC_POSTHOG_KEY: "phc_someone_elses_project" }, /Lock 3/);

// ── seed: a valid run ──────────────────────────────────────────────────────────────────────────────────────
console.log("\nposthog-seed.mjs — valid run");
r = await run("scripts/posthog-seed.mjs", ["--dry-run"]);
check(r.code === 0 && state.batches.length === 0, "--dry-run passes the locks and sends nothing", r.out.match(/Generated [\d,]+ events/)?.[0] ?? r.out.slice(-200));
r = await run("scripts/posthog-seed.mjs");
const sent = state.batches.flatMap((b) => b.batch);
check(r.code === 0 && sent.length > 0, "sends events", `${sent.length.toLocaleString()} events in ${state.batches.length} batches`);
check(state.batches.every((b) => b.api_key === PROJECT.api_token && b.historical_migration === true), "with the project key, as a historical import");
check(sent.every((e) => e.properties.demo === true), "every event is tagged demo: true");
check(sent.every((e) => e.properties.$process_person_profile === false), "no event creates a person profile");
const text = JSON.stringify(sent.map((e) => e.properties));
check(!/@/.test(text) && !/(?<![0-9a-f-])\d{7,}(?![0-9a-f-])/.test(text), "nothing email- or phone-shaped in any event");
const contractNames = new Set([...readFileSync("src/lib/analytics/events.ts", "utf8").matchAll(/name:\s*"([a-z_]+)"/g)].map((m) => m[1]));
const custom = new Set(sent.map((e) => e.event).filter((n) => !n.startsWith("$")));
check([...custom].every((n) => contractNames.has(n)), "every event name is one the site sends", [...custom].filter((n) => !contractNames.has(n)).join(", "));
const n = (e, f = () => true) => sent.filter((x) => x.event === e && f(x.properties)).length;
check(n("careers_viewed") === 1500 && n("enquiry_viewed") === 150, "1,500 careers visits and 150 enquiry visits", `${n("careers_viewed")} / ${n("enquiry_viewed")}`);
const ts = sent.map((e) => Date.parse(e.timestamp));
const span = (Math.max(...ts) - Math.min(...ts)) / 86400000;
check(span > 25 && span <= 31 && Math.max(...ts) < Date.now(), "spread across the last month, nothing in the future", `${span.toFixed(1)} days`);
console.log("    " + (r.out.match(/\/careers .*\n.*\/become-a-client .*/)?.[0] ?? "").replace(/\n/g, "\n    "));

console.log("\nposthog-seed.mjs — rerun guard");
await refuse("a second seed is refused while sample events exist", {}, /Lock 4/);
r = await run("scripts/posthog-seed.mjs", ["--force", "--dry-run"]);
check(r.code === 0, "--force gets past the rerun guard (dry run here)");

server.close();
console.log(`\nFAILURES: ${failures.length ? failures.join("; ") : "none"}`);
process.exit(failures.length ? 1 : 0);
