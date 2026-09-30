/**
 * Analytics configuration, read from the environment at build time.
 *
 * **Off unless a project key is set.** With `NEXT_PUBLIC_POSTHOG_KEY` empty — which is every environment until
 * TDL approves Q30 — `analyticsConfigured` is `false`, the consent banner does not render, the SDK chunk is
 * never fetched, and `track()` is a no-op. These are `NEXT_PUBLIC_` values, so they are inlined at build time
 * and the bundler can drop the dead branches; there is no runtime cost to the off state.
 *
 * Region: EU by default (Frankfurt). PostHog's region is fixed when the project is created and cannot be changed
 * afterwards, so the project must be made in the EU cloud — `HANDOFF.md`. Analytics data therefore leaves
 * Nigeria; the privacy notice has to say so (Q25, `docs/ANALYTICS-PROPOSAL.md` §4).
 */

export const analyticsConfig = {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  /** EU cloud. Set only to move region, and only at project creation. */
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
  /**
   * Session replay runs on these routes and nowhere else. Never the home route: the brief's audience is on
   * metered data and the home page is the one route where the Roster already costs them something.
   * `/become-a-client` is listed only when TDL approves it (Q30d) — the enquiry form carries commercial
   * information about prospective clients, which is a different consent conversation from job applicants.
   */
  replayRoutes: ["/careers", ...(process.env.NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY === "true" ? ["/become-a-client"] : [])],
  /**
   * Fraction of sessions on a replay route that are actually recorded. Default 0.25 — see
   * `docs/ANALYTICS-PROPOSAL.md` §2 for why a quarter: replay is for diagnosis, not measurement, and nobody
   * watches more than a few dozen. Raise it temporarily to investigate a specific problem, then put it back.
   */
  replaySampleRate: clampRate(process.env.NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE, 0.25),
} as const;

function clampRate(raw: string | undefined, fallback: number): number {
  const n = Number((raw ?? "").trim());
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

/** The master switch. Everything analytics-related checks this first. */
export const analyticsConfigured = analyticsConfig.key.length > 0;

/** True when this route is one where session replay is permitted at all. */
export const replayAllowedOn = (pathname: string) =>
  analyticsConfig.replayRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
