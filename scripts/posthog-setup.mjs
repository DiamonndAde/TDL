/**
 * Creates — or brings up to date — the dashboard "TDL — Careers & enquiries" in a PostHog project.
 *
 *   node scripts/posthog-setup.mjs               demo: sample-data label on the dashboard and as the top tile
 *   node scripts/posthog-setup.mjs --production  TDL's own project: no label, and removes it if present
 *   node scripts/posthog-setup.mjs --dry-run     reads only; prints what it would create or change
 *
 * Needs in .env.local: POSTHOG_PERSONAL_API_KEY (scopes dashboard:write, insight:write, project:read,
 * query:read), POSTHOG_PROJECT_ID, and POSTHOG_APP_HOST if not the EU cloud.
 *
 * SAFE TO RERUN. The dashboard is found by its exact name; each insight by its exact name plus a marker in its
 * description, so an insight someone made by hand with the same name is never touched; each text tile by the
 * first line of its body. What exists is updated, what is missing is created, and nothing is deleted except
 * the sample-data label when --production asks for it. Run it again on TDL's account and it builds the same
 * dashboard there.
 *
 * Every insight's query is run once against the project's query API before it is saved, so a query PostHog
 * rejects fails loudly here, with PostHog's own error, instead of saving a broken tile.
 *
 * The events and properties queried are exactly those in src/lib/analytics/events.ts, plus PostHog's own
 * $pageleave scroll-depth properties. Nothing here can produce a per-role chart: the site sends no role,
 * because openings are listed on TDL's ATS rather than on our page (CLIENT-QUESTIONS.md Q29).
 */
import { createHash } from "node:crypto";
import { api, config, getProject, hasFlag, listAll, loadEnv } from "./posthog-api.mjs";

loadEnv();
const PRODUCTION = hasFlag("--production");
const DRY = hasFlag("--dry-run");
const cfg = config();

const DASHBOARD_NAME = "TDL — Careers & enquiries";
const MARKER = "[managed by scripts/posthog-setup.mjs";
/**
 * The marker carries a hash of our own definition. PostHog normalises a saved query (adds versions and
 * defaults), so comparing queries would always report a change; comparing our hash says exactly whether this
 * script's definition has changed since the insight was last written.
 */
const marked = (def) =>
  `${def.description} ${MARKER} · ${createHash("sha1").update(JSON.stringify([def.name, def.query])).digest("hex").slice(0, 10)}]`;
const LAST_30 = { date_from: "-30d" };

const SAMPLE_LABEL_FIRST_LINE = "## Sample data for demonstration";
const SAMPLE_LABEL = [
  SAMPLE_LABEL_FIRST_LINE,
  "",
  "Most of what this dashboard shows was **generated** by `scripts/posthog-seed.mjs` to demonstrate the charts.",
  "The volumes and the drop-off patterns are **invented**. They are not findings about TDL's visitors and must not",
  "be read or quoted as such. Only clicks made during a live demo are real.",
].join("\n");

const ROLES_NOTE_FIRST_LINE = "### Per-role clicks";
const ROLES_NOTE = [
  ROLES_NOTE_FIRST_LINE,
  "",
  "This dashboard counts clicks through to the openings board, not clicks on individual roles. Openings are listed",
  "on TDL's applicant tracking system rather than on our own careers page, so the site never knows which role",
  "someone went on to look at. Per-role clicks arrive once openings are listed on our own page",
  "(CLIENT-QUESTIONS.md Q29).",
].join("\n");

const DESCRIPTION_DEMO =
  "SAMPLE DATA FOR DEMONSTRATION — the volumes and drop-off patterns are invented and must not be read as findings. " +
  "The careers and enquiry funnels of totaldatalimited.com.";
const DESCRIPTION_PROD =
  "The careers and enquiry funnels of totaldatalimited.com: where visitors go, where they stop, and when a submission fails.";

/** Event-property filter. */
const prop = (key, value, operator = "exact") => ({ key, value, operator, type: "event" });
const ev = (event, properties, custom_name) => ({
  kind: "EventsNode",
  event,
  name: event,
  ...(custom_name ? { custom_name } : {}),
  ...(properties ? { properties } : {}),
});
const funnel = (series) => ({
  kind: "InsightVizNode",
  source: {
    kind: "FunnelsQuery",
    series,
    dateRange: LAST_30,
    funnelsFilter: { funnelVizType: "steps", funnelOrderType: "ordered", funnelWindowInterval: 1, funnelWindowIntervalUnit: "day" },
  },
});
const bars = (series, breakdown, extra = {}) => ({
  kind: "InsightVizNode",
  source: {
    kind: "TrendsQuery",
    series,
    dateRange: LAST_30,
    interval: "day",
    breakdownFilter: { breakdown, breakdown_type: "event", ...extra.breakdownFilter },
    trendsFilter: { display: "ActionsBarValue" },
    ...(extra.properties ? { properties: extra.properties } : {}),
  },
});

/** In display order, after the sample-data label. `note: true` is the Q29 text tile's slot. */
const INSIGHTS = [
  {
    name: "Careers: view → openings clicked",
    description: "Of the people who viewed /careers, how many clicked through to the openings board. That click is where our view ends — the application itself happens in TDL's ATS (Q29f).",
    query: funnel([ev("careers_viewed", null, "Viewed /careers"), ev("openings_clicked", null, "Clicked through to openings")]),
  },
  {
    name: "Careers: view → talent pool submitted",
    description: "The second route: people whose role was not listed, from viewing /careers to joining the talent pool.",
    query: funnel([
      ev("careers_viewed", null, "Viewed /careers"),
      ev("talent_pool_started", null, "Started the talent-pool form"),
      ev("talent_pool_submitted", null, "Submitted"),
    ]),
  },
  {
    name: "Openings clicks by CTA wording",
    description: "Clicks through to the openings board, by the wording of the button. Only \"control\" appears until the CTA experiment is switched on (ANALYTICS-PROPOSAL.md §9).",
    query: bars([ev("openings_clicked")], "cta_variant"),
  },
  { note: true },
  {
    name: "Talent pool: fields left empty",
    description: "Which question people left blank when they moved on or gave up, on the talent-pool form. Counts fields, never their contents — the site sends whether a field was filled, not what was typed.",
    query: bars([ev("form_field_left")], "field", {
      properties: [prop("form", ["talent_pool"]), prop("state", ["empty"])],
    }),
  },
  {
    name: "Become a client: step funnel",
    description: "The three-step enquiry form, from arriving to submitting.",
    query: funnel([
      ev("enquiry_viewed", null, "Viewed /become-a-client"),
      // `step` is sent as a number (events.ts), so it is filtered as one.
      ev("enquiry_step_completed", [prop("step", [1])], "Completed step 1 — what you need"),
      ev("enquiry_step_completed", [prop("step", [2])], "Completed step 2 — your organisation"),
      ev("enquiry_submitted", null, "Submitted"),
    ]),
  },
  {
    name: "Form submission errors by reason",
    description: "Submissions that failed, on either form, by reason: delivery (the ATS or webhook refused), unconfigured (nothing wired to receive it), validation (the server disagreed with the browser), network (never arrived). Never contains what was entered.",
    query: bars([ev("talent_pool_failed", null, "Talent pool"), ev("enquiry_failed", null, "Enquiry")], "reason"),
  },
  {
    name: "Scroll depth on /careers",
    description: "How far down /careers people had scrolled when they left, in quarters of the page (0 = top, 1 = bottom). The talent-pool form is near the bottom.",
    query: bars([ev("$pageleave")], "$prev_pageview_max_scroll_percentage", {
      properties: [prop("$prev_pageview_pathname", ["/careers"])],
      breakdownFilter: { breakdown_histogram_bin_count: 4 },
    }),
  },
];

const log = (...a) => console.log(...a);
const plan = [];
const act = async (what, fn) => {
  plan.push(what);
  if (DRY) {
    log(`  would ${what}`);
    return null;
  }
  const out = await fn();
  log(`  ${what}`);
  return out;
};

async function main() {
  const project = await getProject(cfg);
  log(`Project: "${project.name}" (${cfg.projectId}) on ${cfg.appHost}${DRY ? "  — DRY RUN, nothing will change" : ""}`);
  log(`Mode: ${PRODUCTION ? "production (no sample-data label)" : "demo (sample-data label on)"}\n`);
  const base = `/api/projects/${cfg.projectId}`;

  // ── dashboard ─────────────────────────────────────────────────────────────────────────────────────────────
  const description = PRODUCTION ? DESCRIPTION_PROD : DESCRIPTION_DEMO;
  const dashboards = await listAll(cfg, `${base}/dashboards/?search=${encodeURIComponent(DASHBOARD_NAME)}`);
  let dashboard = dashboards.find((d) => d.name === DASHBOARD_NAME && !d.deleted) ?? null;
  if (!dashboard) {
    dashboard = (await act(`create dashboard "${DASHBOARD_NAME}"`, () =>
      api(cfg, "POST", `${base}/dashboards/`, { name: DASHBOARD_NAME, description }))) ?? { id: "(new)", tiles: [] };
  } else if (dashboard.description !== description) {
    await act(`update the dashboard description`, () => api(cfg, "PATCH", `${base}/dashboards/${dashboard.id}/`, { description }));
  } else {
    log(`  dashboard "${DASHBOARD_NAME}" exists and is current`);
  }

  // ── insights ──────────────────────────────────────────────────────────────────────────────────────────────
  const insightIds = [];
  const failures = [];
  for (const def of INSIGHTS) {
    if (def.note) continue;
    // Validate against the real query engine first, so a query PostHog rejects never becomes a broken tile.
    try {
      await api(cfg, "POST", `${base}/query/`, { query: def.query.source });
    } catch (err) {
      failures.push(`${def.name}: PostHog rejected the query — ${err.message}`);
      log(`  FAIL "${def.name}": ${err.message}`);
      continue;
    }
    const fullDescription = marked(def);
    const found = (await listAll(cfg, `${base}/insights/?saved=true&search=${encodeURIComponent(def.name)}`)).find(
      (i) => i.name === def.name && !i.deleted && (i.description ?? "").includes(MARKER),
    );
    const onDash = dashboard.id === "(new)" ? [] : [dashboard.id];
    if (found) {
      const dashIds = Array.from(new Set([...(found.dashboards ?? []), ...onDash]));
      const same = found.description === fullDescription && onDash.every((id) => (found.dashboards ?? []).includes(id));
      if (same) log(`  insight "${def.name}" is current`);
      else await act(`update insight "${def.name}"`, () =>
        api(cfg, "PATCH", `${base}/insights/${found.id}/`, { query: def.query, description: fullDescription, dashboards: dashIds }));
      insightIds.push(found.id);
    } else {
      const created = await act(`create insight "${def.name}"`, () =>
        api(cfg, "POST", `${base}/insights/`, { name: def.name, description: fullDescription, query: def.query, dashboards: onDash, saved: true }));
      if (created) insightIds.push(created.id);
    }
  }

  if (dashboard.id === "(new)") {
    summary(failures);
    return;
  }

  // ── text tiles ────────────────────────────────────────────────────────────────────────────────────────────
  const fresh = await api(cfg, "GET", `${base}/dashboards/${dashboard.id}/`);
  const tiles = (fresh?.tiles ?? []).filter((t) => !t.deleted);
  const textTile = (firstLine) => tiles.find((t) => t.text && (t.text.body ?? "").startsWith(firstLine));
  const ensureText = async (firstLine, body, label) => {
    const existing = textTile(firstLine);
    if (!existing) {
      await act(`add the ${label} text tile`, () => api(cfg, "POST", `${base}/dashboards/${dashboard.id}/create_text_tile/`, { body }));
    } else if (existing.text.body !== body) {
      await act(`update the ${label} text tile`, () =>
        api(cfg, "POST", `${base}/dashboards/${dashboard.id}/update_text_tile/`, { tile_id: existing.id, body }));
    } else {
      log(`  ${label} text tile is current`);
    }
  };

  if (PRODUCTION) {
    const label = textTile(SAMPLE_LABEL_FIRST_LINE);
    if (label) await act(`remove the sample-data label tile`, () =>
      api(cfg, "POST", `${base}/dashboards/${dashboard.id}/delete_tile/`, { tile_id: label.id }));
  } else {
    await ensureText(SAMPLE_LABEL_FIRST_LINE, SAMPLE_LABEL, "sample-data label");
  }
  await ensureText(ROLES_NOTE_FIRST_LINE, ROLES_NOTE, "per-role note (Q29)");

  // ── order: label first, then the insights as listed, the Q29 note beside the openings tiles ───────────────
  if (!DRY) {
    const now = (await api(cfg, "GET", `${base}/dashboards/${dashboard.id}/`))?.tiles?.filter((t) => !t.deleted) ?? [];
    const byInsight = (id) => now.find((t) => t.insight && (t.insight.id ?? t.insight) === id)?.id;
    const order = [];
    const label = now.find((t) => t.text && (t.text.body ?? "").startsWith(SAMPLE_LABEL_FIRST_LINE));
    if (label) order.push(label.id);
    let i = 0;
    for (const def of INSIGHTS) {
      if (def.note) {
        const note = now.find((t) => t.text && (t.text.body ?? "").startsWith(ROLES_NOTE_FIRST_LINE));
        if (note) order.push(note.id);
        continue;
      }
      const id = byInsight(insightIds[i++]);
      if (id) order.push(id);
    }
    // Anything else on the dashboard (added by hand) keeps its place after ours.
    for (const t of now) if (!order.includes(t.id)) order.push(t.id);
    const current = now.map((t) => t.id);
    if (JSON.stringify(current) !== JSON.stringify(order)) {
      await act(`reorder the tiles`, () => api(cfg, "POST", `${base}/dashboards/${dashboard.id}/reorder_tiles/`, { tile_order: order }));
    }
  }

  summary(failures, dashboard.id);
}

function summary(failures, id) {
  log("");
  if (failures.length) {
    log(`Finished with ${failures.length} insight(s) not saved:`);
    for (const f of failures) log(`  - ${f}`);
    process.exitCode = 1;
  } else if (DRY) {
    log(`Dry run complete: ${plan.length} change(s) would be made.`);
  } else {
    log(`Done. ${plan.length ? `${plan.length} change(s) made.` : "Nothing needed changing."}`);
    if (id && id !== "(new)") log(`Dashboard: ${cfg.appHost}/project/${cfg.projectId}/dashboard/${id}`);
  }
}

main().catch((err) => {
  console.error(`\nStopped: ${err.message}`);
  process.exit(1);
});
