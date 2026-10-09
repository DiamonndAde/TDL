/**
 * Shared plumbing for scripts/posthog-setup.mjs and scripts/posthog-seed.mjs: environment loading, an
 * authenticated fetch against PostHog's private API, and the project lookup both scripts start from.
 *
 * Paths and request shapes follow PostHog's published OpenAPI schema (https://eu.posthog.com/api/schema/),
 * checked 2026-10-09. Keys are read from `.env.local`, which is gitignored, and are never printed.
 */
import { existsSync } from "node:fs";

/**
 * Load `.env.local` into process.env without overriding anything already set in the shell.
 * `POSTHOG_SCRIPTS_NO_DOTENV=1` skips it entirely — the test harness sets this so a test run can never pick up
 * the real keys in `.env.local` and talk to a real PostHog project.
 */
export function loadEnv() {
  if (process.env.POSTHOG_SCRIPTS_NO_DOTENV === "1") return;
  if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
    const before = { ...process.env };
    process.loadEnvFile(".env.local");
    // loadEnvFile overrides; restore anything the shell had already set, so an explicit export wins.
    for (const [k, v] of Object.entries(before)) process.env[k] = v;
  }
}

export function need(name) {
  const v = (process.env[name] ?? "").trim();
  if (!v) {
    console.error(`Missing ${name}. Put it in .env.local (see the step-by-step in docs/ANALYTICS-PROPOSAL.md §14).`);
    process.exit(2);
  }
  return v;
}

export function config() {
  return {
    appHost: (process.env.POSTHOG_APP_HOST || "https://eu.posthog.com").replace(/\/+$/, ""),
    projectId: need("POSTHOG_PROJECT_ID"),
    personalKey: need("POSTHOG_PERSONAL_API_KEY"),
  };
}

/** Authenticated request to the private API. Throws with PostHog's own error text on a non-2xx. */
export async function api(cfg, method, path, body) {
  const res = await fetch(`${cfg.appHost}${path}`, {
    method,
    headers: { Authorization: `Bearer ${cfg.personalKey}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const detail = json?.detail || json?.error || json?.message || text.slice(0, 300);
    const err = new Error(`${method} ${path} → ${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Every page of a list endpoint. */
export async function listAll(cfg, path) {
  const out = [];
  let next = path;
  while (next) {
    const page = await api(cfg, "GET", next);
    out.push(...(page?.results ?? []));
    next = page?.next ? page.next.replace(cfg.appHost, "") : null;
  }
  return out;
}

/**
 * The project, with its name and its public project key (`api_token`). `@current` resolves to the
 * organisation the personal key belongs to; if that fails, every organisation the key can see is tried.
 */
export async function getProject(cfg) {
  try {
    return await api(cfg, "GET", `/api/organizations/@current/projects/${cfg.projectId}/`);
  } catch (err) {
    if (err.status !== 404 && err.status !== 403) throw err;
    const orgs = await listAll(cfg, "/api/organizations/");
    for (const org of orgs) {
      try {
        return await api(cfg, "GET", `/api/organizations/${org.id}/projects/${cfg.projectId}/`);
      } catch {
        // not in this organisation
      }
    }
    throw new Error(`Project ${cfg.projectId} not found with this personal API key. Check POSTHOG_PROJECT_ID and the key's scopes.`);
  }
}

export const hasFlag = (flag) => process.argv.includes(flag);
