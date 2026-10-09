/**
 * Sends a month of SAMPLE events to a PostHog **demo** project, so the dashboard has something to show before
 * real traffic exists.
 *
 *   node scripts/posthog-seed.mjs            check the locks, then send
 *   node scripts/posthog-seed.mjs --dry-run  check the locks, generate, print the totals, send nothing
 *   node scripts/posthog-seed.mjs --force    send even if demo events from a previous run are already there
 *
 * ── It refuses to run unless every lock holds ────────────────────────────────────────────────────────────────
 *   1. POSTHOG_SEED_DEMO_PROJECT is set, and contains the word "demo".
 *   2. It is exactly the project's real name, fetched live from PostHog with the personal API key.
 *   3. That project's own project key is NEXT_PUBLIC_POSTHOG_KEY — the key the events are sent with — so the
 *      project that was checked is the project that receives them.
 *   4. No sample events from the last 31 days are already there (rerun guard; --force overrides).
 * TDL's real project fails lock 1 or 2 by name. A mismatched key fails lock 3. There is no way to point this
 * at a project that is not named as a demo.
 *
 * ── What it sends ────────────────────────────────────────────────────────────────────────────────────────────
 * The same events, with the same properties, that src/lib/analytics/events.ts defines and the site sends —
 * checked against that file at startup, so the two cannot drift. Plus PostHog's own $pageview and $pageleave
 * (with the scroll-depth property the site's SDK attaches). Every event carries `demo: true`.
 *
 * No personal data: no names, no emails, no phone numbers, no free text. Field events carry field *names* and a
 * state, exactly as the site does. Each visitor is a random UUID with no person profile
 * (`$process_person_profile: false`), matching the site's `person_profiles: "never"`. The payload is scanned for
 * anything shaped like an email or phone number before a single request is made.
 *
 * Volumes (one month, approved 2026-10-09): ~1,500 visits to /careers, ~150 to /become-a-client. The drop-off
 * rates below are INVENTED to make the charts legible. They are not estimates of TDL's traffic and must not be
 * presented as findings — the dashboard says so in its own sample-data tile.
 *
 * Deterministic: a fixed random seed, so the same day's run produces the same events with the same UUIDs.
 */
import { readFileSync } from "node:fs";
import { api, config, getProject, hasFlag, loadEnv, need } from "./posthog-api.mjs";

loadEnv();
const DRY = hasFlag("--dry-run");
const FORCE = hasFlag("--force");

// ── volumes and invented rates ─────────────────────────────────────────────────────────────────────────────
const CAREERS_VISITS = 1500;
const ENQUIRY_VISITS = 150;
const P = {
  careers: { openings: 0.35, talentPool: 0.12 },
  // Chance of leaving the talent-pool form AT this field, leaving it empty. Highest at phone and message.
  tpAbandon: { name: 0.05, email: 0.08, phone: 0.22, location: 0.06, area: 0.05, message: 0.18 },
  tpAbandonBeforeSubmit: 0.05,
  tpMessageSkipped: 0.3, // optional field left blank by people who carry on
  invalidFirstTry: { email: 0.06, phone: 0.06 },
  enquiry: { step1: 0.55, step2: 0.7, step3: 0.75, blockedBeforeStep1: 0.15, back: 0.05, preselected: 0.3 },
  submitFailure: 0.02, // of submission attempts, on either form
};

// ── the contract: read the site's own definitions, so the seed cannot send what the site cannot ─────────────
const eventsTs = readFileSync("src/lib/analytics/events.ts", "utf8");
const contract = new Map();
for (const m of eventsTs.matchAll(/\|\s*\{\s*name:\s*"([a-z_]+)"\s*;?\s*([^}]*)\}/g)) {
  const keys = [...m[2].matchAll(/([a-z_]+)\s*:/g)].map((k) => k[1]).sort();
  contract.set(m[1], keys);
}
const fieldBlock = eventsTs.match(/export type FieldName =([\s\S]*?);/)?.[1] ?? "";
const fieldNames = new Set([...fieldBlock.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]));
const serviceSlugs = [...readFileSync("src/content/services.ts", "utf8").matchAll(/slug:\s*"([a-z-]+)"/g)].map((m) => m[1]);
const headcountBands = [...readFileSync("src/components/enquiry/schema.ts", "utf8").matchAll(/value:\s*"([0-9+-]+)"/g)].map((m) => m[1]);
if (contract.size < 10 || serviceSlugs.length !== 7 || headcountBands.length !== 4) {
  console.error(`Could not read the site's event contract (events=${contract.size}, services=${serviceSlugs.length}, bands=${headcountBands.length}).`);
  process.exit(2);
}

// ── deterministic randomness ───────────────────────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const rand = mulberry32(0x7d1 ^ Math.floor(today.getTime() / 86400000));
const chance = (p) => rand() < p;
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const between = (a, b) => a + rand() * (b - a);
const uuid = () => {
  const h = Array.from({ length: 32 }, () => Math.floor(rand() * 16).toString(16)).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20)}`;
};

/** A plausible moment in the last 30 days: weekdays busier, Lagos working hours (UTC+1) busiest. */
function sessionStart() {
  for (;;) {
    const dayOffset = Math.floor(rand() * 30) + 1;
    const d = new Date(today.getTime() - dayOffset * 86400000);
    const dow = d.getUTCDay();
    const dayWeight = dow === 0 ? 0.35 : dow === 6 ? 0.45 : 1;
    if (!chance(dayWeight)) continue;
    const lagosHour = rand() < 0.75 ? Math.floor(between(8, 18)) : Math.floor(between(0, 24));
    d.setUTCHours((lagosHour + 23) % 24, Math.floor(rand() * 60), Math.floor(rand() * 60));
    return d.getTime();
  }
}

// ── generation ─────────────────────────────────────────────────────────────────────────────────────────────
const SITE = (process.env.POSTHOG_SEED_SITE_URL || "https://totaldatalimited.com").replace(/\/+$/, "");
const events = [];

function session() {
  const distinctId = uuid();
  const sessionId = uuid();
  let t = sessionStart();
  return {
    emit(event, props = {}, gapSeconds = between(2, 25)) {
      t += Math.round(gapSeconds * 1000);
      events.push({
        event,
        distinct_id: distinctId,
        uuid: uuid(),
        timestamp: new Date(t).toISOString(),
        properties: { ...props, demo: true, $session_id: sessionId, $process_person_profile: false, $lib: "tdl-demo-seed" },
      });
    },
  };
}

const page = (path) => ({ $current_url: `${SITE}${path}`, $pathname: path, $host: new URL(SITE).host });
const leave = (s, path, scroll) =>
  s.emit("$pageleave", { ...page(path), $prev_pageview_pathname: path, $prev_pageview_max_scroll_percentage: Math.round(scroll * 100) / 100 });

/** Walks the fields in order. Returns `{ abandoned: field | null, filled: number }`. */
function fieldFlow(s, form, fields, abandon, index0 = 0) {
  let filled = 0;
  for (const [i, field] of fields.entries()) {
    s.emit("form_field_focused", { form, field, index: index0 + i }, between(2, 9));
    if (chance(abandon[field] ?? 0)) {
      s.emit("form_field_left", { form, field, index: index0 + i, state: "empty" }, between(3, 30));
      return { abandoned: field, filled };
    }
    if (chance(P.invalidFirstTry[field] ?? 0)) {
      s.emit("form_field_left", { form, field, index: index0 + i, state: "invalid" }, between(4, 14));
      s.emit("form_field_focused", { form, field, index: index0 + i }, between(1, 4));
    }
    const skipped = field === "message" && chance(P.tpMessageSkipped);
    s.emit("form_field_left", { form, field, index: index0 + i, state: skipped ? "empty" : "filled" }, between(3, 40));
    if (!skipped) filled += 1;
  }
  return { abandoned: null, filled };
}

// Careers
for (let v = 0; v < CAREERS_VISITS; v++) {
  const s = session();
  s.emit("$pageview", page("/careers"), 0);
  s.emit("careers_viewed", {}, 0.2);
  const r = rand();
  if (r < P.careers.openings) {
    s.emit("openings_clicked", { destination: "ats", cta_variant: "control" }, between(4, 40));
    leave(s, "/careers", between(0.1, 0.45));
  } else if (r < P.careers.openings + P.careers.talentPool) {
    s.emit("talent_pool_started", {}, between(15, 90));
    const TP = ["name", "email", "phone", "location", "area", "message"];
    const flow = fieldFlow(s, "talent_pool", TP, P.tpAbandon);
    if (flow.abandoned === null && !chance(P.tpAbandonBeforeSubmit)) {
      if (chance(0.05)) s.emit("form_validation_failed", { form: "talent_pool", field: pick(["email", "phone"]), reason: "invalid" }, between(1, 3));
      if (chance(P.submitFailure)) s.emit("talent_pool_failed", { reason: pick(["delivery", "network"]) }, between(1, 4));
      else s.emit("talent_pool_submitted", { fields_completed: flow.filled }, between(1, 4));
    }
    leave(s, "/careers", between(0.75, 1));
  } else {
    const b = rand();
    leave(s, "/careers", b < 0.5 ? between(0.05, 0.3) : b < 0.85 ? between(0.3, 0.7) : between(0.7, 1));
  }
}

// Become a client
const STEP2 = ["organisation", "industry", "location", "arrangement"];
const STEP3 = ["name", "role", "email", "phone", "contactTime"];
const flat = (names, p) => Object.fromEntries(names.map((n) => [n, p]));
for (let v = 0; v < ENQUIRY_VISITS; v++) {
  const s = session();
  const pre = chance(P.enquiry.preselected) ? pick(serviceSlugs) : "none";
  const path = "/become-a-client";
  s.emit("$pageview", page(path), 0);
  s.emit("enquiry_viewed", { preselected_service: pre }, 0.3);
  s.emit("enquiry_step_viewed", { step: 1 }, 0.1);
  if (!chance(P.enquiry.step1)) {
    if (chance(0.2)) s.emit("enquiry_step_blocked", { step: 1, first_invalid_field: pick(["services", "headcount"]) }, between(10, 60));
    leave(s, path, between(0.1, 0.6));
    continue;
  }
  if (chance(P.enquiry.blockedBeforeStep1)) s.emit("enquiry_step_blocked", { step: 1, first_invalid_field: pick(["services", "headcount"]) }, between(10, 50));
  s.emit("enquiry_step_completed", { step: 1 }, between(8, 60));
  s.emit("enquiry_step_viewed", { step: 2 }, 0.3);
  // Spread step 2's losses across its fields so the step-2 rate lands near P.enquiry.step2.
  if (fieldFlow(s, "enquiry", STEP2, flat(STEP2, 1 - Math.pow(P.enquiry.step2, 1 / STEP2.length)), 2).abandoned !== null) {
    leave(s, path, between(0.3, 0.8));
    continue;
  }
  if (chance(P.enquiry.back)) {
    s.emit("enquiry_step_back", { step: 2 }, between(2, 10));
    s.emit("enquiry_step_viewed", { step: 1 }, 0.3);
    s.emit("enquiry_step_completed", { step: 1 }, between(5, 30));
    s.emit("enquiry_step_viewed", { step: 2 }, 0.3);
  }
  s.emit("enquiry_step_completed", { step: 2 }, between(2, 10));
  s.emit("enquiry_step_viewed", { step: 3 }, 0.3);
  if (fieldFlow(s, "enquiry", STEP3, flat(STEP3, 1 - Math.pow(P.enquiry.step3, 1 / STEP3.length)), 6).abandoned !== null) {
    leave(s, path, between(0.4, 0.9));
    continue;
  }
  if (chance(P.submitFailure)) s.emit("enquiry_failed", { reason: pick(["delivery", "network"]) }, between(2, 6));
  else
    s.emit("enquiry_submitted", {
      services_count: 1 + Math.floor(rand() * 3),
      headcount_band: pick(headcountBands),
    }, between(2, 6));
  leave(s, path, between(0.6, 1));
}

// ── checks before anything is sent ─────────────────────────────────────────────────────────────────────────
const problems = [];
const STANDARD = new Set(["demo", "$session_id", "$process_person_profile", "$lib", "$current_url", "$pathname", "$host",
  "$prev_pageview_pathname", "$prev_pageview_max_scroll_percentage"]);
for (const e of events) {
  if (e.event.startsWith("$")) continue;
  const keys = Object.keys(e.properties).filter((k) => !STANDARD.has(k)).sort();
  const expected = contract.get(e.event);
  if (!expected) problems.push(`"${e.event}" is not an event the site sends (src/lib/analytics/events.ts)`);
  else if (JSON.stringify(keys) !== JSON.stringify(expected)) problems.push(`"${e.event}" sends {${keys}} but the site sends {${expected}}`);
  if (e.properties.field && !fieldNames.has(e.properties.field)) problems.push(`unknown field "${e.properties.field}"`);
}
// The no-personal-data rule, checked rather than promised: nothing email-shaped, nothing phone-shaped.
const payloadText = JSON.stringify(events.map((e) => e.properties));
if (/@/.test(payloadText)) problems.push("something email-shaped is in the payload");
if (/(?<![0-9a-f-])\d{7,}(?![0-9a-f-])/.test(payloadText)) problems.push("a run of seven or more digits is in the payload");
if (problems.length) {
  console.error("Refusing to send — the generated events do not match the site:\n  " + [...new Set(problems)].slice(0, 10).join("\n  "));
  process.exit(2);
}

const count = (name, pred = () => true) => events.filter((e) => e.event === name && pred(e.properties)).length;
function totals() {
  const tpStarted = count("talent_pool_started");
  console.log(`Generated ${events.length.toLocaleString()} events (all tagged demo: true):`);
  console.log(`  /careers          ${count("careers_viewed")} visits, ${count("openings_clicked")} clicked through to openings, ` +
    `${tpStarted} started the talent pool, ${count("talent_pool_submitted")} submitted, ${count("talent_pool_failed")} failed`);
  console.log(`  /become-a-client  ${count("enquiry_viewed")} visits, step 1 done ${count("enquiry_step_completed", (p) => p.step === 1)}, ` +
    `step 2 done ${count("enquiry_step_completed", (p) => p.step === 2)}, ${count("enquiry_submitted")} submitted, ${count("enquiry_failed")} failed`);
}

// ── the locks ──────────────────────────────────────────────────────────────────────────────────────────────
async function locks() {
  const marker = (process.env.POSTHOG_SEED_DEMO_PROJECT ?? "").trim();
  if (!marker) throw new Error("Lock 1: POSTHOG_SEED_DEMO_PROJECT is not set. It must name the demo project exactly.");
  if (!/demo/i.test(marker)) throw new Error(`Lock 1: POSTHOG_SEED_DEMO_PROJECT ("${marker}") does not contain the word "demo". This script only seeds demo projects.`);
  const cfg = config();
  const project = await getProject(cfg);
  if (project.name !== marker)
    throw new Error(`Lock 2: the project is named "${project.name}", not "${marker}". Refusing to seed a project that is not the named demo.`);
  const key = need("NEXT_PUBLIC_POSTHOG_KEY");
  if (project.api_token !== key)
    throw new Error(`Lock 3: NEXT_PUBLIC_POSTHOG_KEY is not "${project.name}"'s project key. Events would land in a different project than the one checked.`);
  if (!FORCE) {
    const res = await api(cfg, "POST", `/api/projects/${cfg.projectId}/query/`, {
      query: { kind: "HogQLQuery", query: "SELECT count() FROM events WHERE toString(properties.demo) = 'true' AND timestamp > now() - INTERVAL 31 DAY" },
    });
    const existing = Number(res?.results?.[0]?.[0] ?? 0);
    if (existing > 0)
      throw new Error(`Lock 4: "${project.name}" already has ${existing.toLocaleString()} sample events from the last 31 days. ` +
        "Seeding again would double the demo's numbers. Use --force to send anyway.");
  }
  return { cfg, project, key };
}

async function send({ key }) {
  const ingest = (process.env.POSTHOG_INGEST_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com").replace(/\/+$/, "");
  const BATCH = 500;
  for (let i = 0; i < events.length; i += BATCH) {
    const res = await fetch(`${ingest}/batch/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // historical_migration: backdated events are processed in order, without tripping spike detection.
      body: JSON.stringify({ api_key: key, historical_migration: true, batch: events.slice(i, i + BATCH) }),
    });
    if (!res.ok) throw new Error(`batch ${i / BATCH + 1} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
    process.stdout.write(`\r  sent ${Math.min(i + BATCH, events.length).toLocaleString()} / ${events.length.toLocaleString()}`);
  }
  process.stdout.write("\n");
}

try {
  const ctx = await locks();
  console.log(`All locks hold: "${ctx.project.name}" (${ctx.cfg.projectId}) is a named demo project, and the key matches.\n`);
  totals();
  if (DRY) {
    console.log("\nDry run: nothing sent.");
  } else {
    await send(ctx);
    console.log("Done. Events can take a minute or two to appear; the dashboard's date range is the last 30 days.");
  }
} catch (err) {
  console.error(`\nRefused: ${err.message}`);
  process.exit(1);
}
