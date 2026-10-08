"use client";

import type { PostHog } from "posthog-js";
import { analyticsConfig, analyticsConfigured, replayAllowedOn } from "./config";


import { attachSink, detachSink } from "./track";

export { analyticsConfig, analyticsConfigured, replayAllowedOn } from "./config";
export type { AnalyticsEvent, FieldName, FieldState, FormId } from "./events";
export { denyConsent, grantConsent, reopenConsent, useConsent, useShouldAskConsent } from "./consent";
export { track } from "./track";

/**
 * The analytics runtime: loads PostHog, applies the masking configuration, decides whether this session is
 * recorded, and feeds `track()` once it is live. Imported only by the lazy analytics chunk, never by a page.
 */
let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;

/** Consent refused or withdrawn: drop anything queued. Re-exported so the provider can call it before start. */
export const discardPending = detachSink;

/** True once the SDK is live. Used only by the provider; callers never need it. */
export const analyticsReady = () => client !== null;

/**
 * A feature-flag value, or `undefined` when flags are off, the SDK is not running, or PostHog has not answered
 * yet. Used by `experiment.ts`; callers treat `undefined` as "show the control".
 */
export function getFeatureFlag(key: string): string | boolean | undefined {
  if (!client || !analyticsConfig.experimentsEnabled) return undefined;
  try {
    return client.getFeatureFlag(key);
  } catch {
    return undefined;
  }
}

/**
 * Loads and starts PostHog. Called by `AnalyticsProvider` only after (a) a key exists, (b) consent is granted,
 * and (c) the first paint has happened — so the SDK never competes with the page for the main thread or the
 * connection. Idempotent.
 */
export async function startAnalytics(pathname: string): Promise<void> {
  if (!analyticsConfigured || client) return;
  if (!loading) loading = load();
  const ph = await loading;
  if (!ph) return;
  client = ph;
  maybeRecord(pathname);
  // The view that started this visit, then anything the visitor did while the banner was up.
  ph.capture("$pageview");
  attachSink((event) => {
    const { name, ...properties } = event;
    ph.capture(name, properties);
  });
}

async function load(): Promise<PostHog | null> {
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(analyticsConfig.key, {
      api_host: analyticsConfig.host,
      // Pageviews are sent by the provider on navigation, so the SDK's own history hooks stay off.
      capture_pageview: false,
      capture_pageleave: true,
      // **Nobody is ever identified.** This site has no accounts; a person profile per visitor is data we do
      // not need and would have to defend, and on a careers page it would be a profile of a job applicant.
      // `identify()` is never called anywhere — `scripts/check-adapter.mjs` fails the build if it appears.
      person_profiles: "never",
      // Replay is started per session by `maybeRecord`, never automatically.
      disable_session_recording: true,
      disable_surveys: !analyticsConfig.surveysEnabled,
      // Do NOT set `advanced_disable_flags` to save the flags request while the experiment is off. It also
      // stops the remote config that switches session recording on, so replay silently records nothing —
      // caught by the canary test (scripts/masking-proof.py asserts a replay payload exists). With experiments
      // off, `useCtaVariant()` never reads a flag, so the request is the only cost.
      autocapture: true,
      // Exception autocapture stays OFF deliberately. An unhandled error's message and stack can contain
      // whatever was being processed when it threw, which on these two routes means form values. Submission
      // failures are reported instead as the typed events in `events.ts`, whose reasons are a closed list
      // (docs/ANALYTICS-PROPOSAL.md §8).
      capture_exceptions: false,
      // --- masking (docs/ANALYTICS-PROPOSAL.md §5) ---------------------------------------------------------
      // Autocapture must not read the text of anything it captures a click on.
      mask_all_text: true,
      session_recording: {
        // Input contents never leave the browser. Both are PostHog defaults; set explicitly so that a change
        // of default cannot quietly turn them off.
        maskAllInputs: true,
        // Everything starts masked; nothing on this site is deliberately unmasked.
        maskTextSelector: "*",
      },
    });
    return posthog;
  } catch {
    // A blocked or failed SDK must never break the page. Analytics is the least important thing here.
    return null;
  }
}

/**
 * Session replay: only on the permitted routes, and only for a sampled fraction of sessions. The draw is made
 * once per session and remembered, so a visitor is not recorded on one page and not the next — a half-recorded
 * session is useless for watching a funnel.
 */
const SAMPLE_KEY = "tdl.replay-sampled";

function maybeRecord(pathname: string) {
  if (!client || !replayAllowedOn(pathname)) return;
  let sampled: boolean;
  try {
    const stored = window.sessionStorage.getItem(SAMPLE_KEY);
    if (stored === "1" || stored === "0") sampled = stored === "1";
    else {
      sampled = Math.random() < analyticsConfig.replaySampleRate;
      window.sessionStorage.setItem(SAMPLE_KEY, sampled ? "1" : "0");
    }
  } catch {
    sampled = Math.random() < analyticsConfig.replaySampleRate;
  }
  if (sampled) client.startSessionRecording();
}

/** Called on client-side navigation: start or stop replay as the route changes, then send the pageview. */
export function onRouteChange(pathname: string): void {
  if (!client) return;
  if (replayAllowedOn(pathname)) maybeRecord(pathname);
  else client.stopSessionRecording();
  client.capture("$pageview");
}

/**
 * Consent withdrawn after the SDK started. PostHog stops capturing and clears what it holds in the browser;
 * the page is left alone.
 */
export function stopAnalytics(): void {
  detachSink();
  if (!client) return;
  try {
    client.stopSessionRecording();
    client.opt_out_capturing();
    client.reset();
  } catch {
    // Nothing to do: the visitor's choice is already recorded and no further events will be sent.
  }
  client = null;
}
