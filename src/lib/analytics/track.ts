"use client";

import { analyticsConfigured } from "./config";
import type { AnalyticsEvent } from "./events";

/**
 * The one way the site sends an event, and deliberately the *smallest* module that can do it: pages and forms
 * import only this, so instrumenting a form does not pull the SDK starter or the consent store into that
 * route's bundle. Measured 2026-09-30: folding them into one module cost an extra 1.2 KB on every route,
 * including routes with no form on them, while analytics was switched off.
 *
 * Before consent, before a project key exists, or if the SDK never loads, `track` costs one boolean check.
 */
let sink: ((event: AnalyticsEvent) => void) | null = null;

/**
 * Events raised before the SDK is running — a page view happens well before consent is answered and the chunk
 * has loaded — wait here. They are sent only if consent is then granted, and **discarded the moment it is
 * refused**. Bounded, so a visitor who never answers the banner cannot grow it without limit.
 */
const pending: AnalyticsEvent[] = [];
const PENDING_LIMIT = 50;

export function track(event: AnalyticsEvent): void {
  if (!analyticsConfigured) return;
  if (!sink) {
    if (pending.length < PENDING_LIMIT) pending.push(event);
    return;
  }
  sink(event);
}

/** Called by the runtime once PostHog is live: drains what was queued, then takes every later event. */
export function attachSink(fn: (event: AnalyticsEvent) => void): void {
  sink = fn;
  const queued = pending.splice(0, pending.length);
  for (const event of queued) fn(event);
}

/** Consent refused or withdrawn: anything waiting is dropped and never sent. */
export function detachSink(): void {
  sink = null;
  pending.length = 0;
}
