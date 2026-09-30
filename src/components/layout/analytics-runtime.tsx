"use client";

import { AnalyticsProvider } from "./analytics-provider";
import { ConsentBanner } from "./consent-banner";

/**
 * Everything analytics needs on the page: the consent choice and the SDK starter. Loaded as one lazy chunk by
 * `analytics.tsx`, and only when a project key exists — so with analytics off (every environment until TDL
 * approves Q30) none of this code, nor the consent store it pulls in, reaches the first-load budget.
 */
export default function AnalyticsRuntime() {
  return (
    <>
      <ConsentBanner />
      <AnalyticsProvider />
    </>
  );
}
