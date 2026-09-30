"use client";

import { analyticsConfigured } from "@/lib/analytics/config";
import { reopenConsent, useConsent } from "@/lib/analytics/consent";

/**
 * "Analytics choice" in the footer. Declining must not be a dead end: whatever the visitor chose, they can
 * reopen the banner and change it. Renders nothing when no project key is configured, and nothing until the
 * choice has actually been made — while the banner is up, this would be a second control for the same thing.
 */
export default function ConsentReopenControl() {
  const consent = useConsent();
  if (!analyticsConfigured || consent === "pending") return null;
  return (
    <button type="button" onClick={reopenConsent} className="underline-offset-4 hover:underline">
      Analytics choice ({consent === "granted" ? "on" : "off"})
    </button>
  );
}
