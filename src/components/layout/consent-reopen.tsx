"use client";

import { analyticsConfigured } from "@/lib/analytics/config";
import { LazyWhen, lazyGate } from "./lazy-when";

/**
 * Footer control for changing the analytics choice. Same gate as `analytics.tsx`: without a project key it is
 * nothing at all.
 */
const Control = lazyGate(() => import("./consent-reopen-control"));

export function ConsentReopen() {
  return <LazyWhen enabled={analyticsConfigured} component={Control} />;
}
