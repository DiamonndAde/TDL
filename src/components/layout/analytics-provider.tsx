"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { analyticsConfigured, discardPending, onRouteChange, startAnalytics, stopAnalytics, useConsent } from "@/lib/analytics";
import { useAfterFirstPaint } from "@/lib/after-first-paint";

/**
 * Starts analytics, and only under all three conditions: a project key exists, the visitor granted consent, and
 * the browser has painted and gone idle. The SDK is a dynamic import, so with no key its chunk is never
 * requested and the first-load budget is untouched on every route.
 *
 * Pageviews are sent from here rather than by the SDK's history hooks, so that a route change does one thing in
 * one place: adjust session replay for the new route, then record the view.
 */
export function AnalyticsProvider() {
  const consent = useConsent();
  const painted = useAfterFirstPaint();
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (!analyticsConfigured) return;
    if (consent === "granted" && painted && !started.current) {
      started.current = true;
      void startAnalytics(pathname);
      return;
    }
    // Refused outright: drop whatever was queued while the banner was up. Nothing is sent, ever.
    if (consent === "denied") {
      if (started.current) {
        started.current = false;
        stopAnalytics();
      } else {
        discardPending();
      }
    }
  }, [consent, painted, pathname]);

  // Route changes after the first: the initial pageview is sent by `startAnalytics`.
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!analyticsConfigured || !started.current) return;
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onRouteChange(pathname);
    }
  }, [pathname]);

  return null;
}
