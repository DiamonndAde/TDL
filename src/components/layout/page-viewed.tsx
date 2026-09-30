"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";
import type { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * The funnel's entry event for a route. PostHog's own `$pageview` says someone arrived; this says which funnel
 * they entered and with what context, which is what the drop-off report is grouped by.
 *
 * It fires long before consent is answered, so it lands in the pending queue in `lib/analytics` and is sent
 * only if the visitor accepts — and dropped if they refuse.
 */
export function PageViewed({ event }: { event: AnalyticsEvent }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(event);
    // The event is a literal from a server component and never changes for a given page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
