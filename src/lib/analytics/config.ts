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
   * Fraction of sessions on a replay route that are actually recorded. **Default 0.05**, sized against a viral
   * job posting rather than against normal traffic:
   *
   *   free allowance            5,000 recordings per month
   *   a viral week             20,000 careers visitors
   *   at 5%                     1,000 recordings — 20% of the month's allowance
   *   a whole viral month      80,000 visitors → 4,000 recordings, still inside the allowance
   *
   * At 25% that same week would produce 5,000 recordings and exhaust the month on its own; with the billing
   * limits set to zero (HANDOFF.md) PostHog then stops ingesting replay and **that data is lost for good**, so
   * the quota would be spent on whoever arrived first rather than on a representative sample. Five per cent
   * survives the spike and still yields more recordings than anyone will watch.
   *
   * Raise it deliberately for a quiet investigation window — at a few hundred sessions a month, 25% is about
   * 75 recordings — and put it back afterwards. Check the arithmetic above against current traffic first.
   */
  replaySampleRate: clampRate(process.env.NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE, 0.05),
  /**
   * Surveys. Built and wired, switched off: the careers survey ("Did you find a role that fits you?") is
   * defined in the PostHog project, and this flag decides whether the SDK loads the surveys script at all.
   * TDL turns it on when they are ready (`docs/ANALYTICS-PROPOSAL.md` §9).
   */
  surveysEnabled: process.env.NEXT_PUBLIC_ANALYTICS_SURVEYS === "true",
  /**
   * Experiments (feature flags). Off by default: `useCtaVariant()` then always returns the control and never
   * reads a flag, so the careers CTA reads exactly as it does today. It does not stop the SDK's flags request —
   * see the note in `index.ts` on why `advanced_disable_flags` must stay unset.
   */
  experimentsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_EXPERIMENTS === "true",
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
