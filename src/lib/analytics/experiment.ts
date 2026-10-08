"use client";

import { useEffect, useState } from "react";
import { analyticsConfig, analyticsConfigured } from "./config";
import type { CtaVariantName } from "./events";
import { getFeatureFlag } from "./index";

/**
 * The careers call-to-action experiment: built, wired and **switched off**.
 *
 * With `NEXT_PUBLIC_ANALYTICS_EXPERIMENTS` unset — which is every environment today — this always returns the
 * control and never reads a flag, and the page reads exactly as it does now. (The SDK still makes its flags
 * request: disabling it also disables the remote config that turns session replay on — see `index.ts`.) TDL turns it
 * on by setting that variable and creating the flag in PostHog; nothing here needs changing.
 *
 * The control wording stays first in the list on purpose: if PostHog is unreachable, the flag is missing, the
 * visitor declined analytics, or the request is slow, the button says what it says today rather than flickering
 * to a variant and back. A CTA that changes under the reader is worse than no experiment.
 */
export const CTA_FLAG = "careers-cta";

/** Keyed by the event contract's own type, so the two cannot drift apart. */
export const ctaVariants: Record<CtaVariantName, string> = {
  control: "See current openings",
  /** Names the thing being offered rather than the act of looking. */
  roles: "See open roles",
  /** Names the action rather than the browsing — the hypothesis, not a finding. */
  apply: "Find a role and apply",
};

export type CtaVariant = CtaVariantName;

const isVariant = (v: unknown): v is CtaVariant => typeof v === "string" && v in ctaVariants;

/**
 * Returns the wording for the careers CTA. Always `control` unless the experiment is switched on, the SDK is
 * live, and PostHog returns a variant this build knows about — an unknown variant name from the dashboard is
 * ignored rather than rendered.
 */
export function useCtaVariant(): { variant: CtaVariant; label: string } {
  const [variant, setVariant] = useState<CtaVariant>("control");

  useEffect(() => {
    if (!analyticsConfigured || !analyticsConfig.experimentsEnabled) return;
    let live = true;
    // The SDK may not be running yet (consent pending) or ever (declined); poll briefly, then give up quietly.
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const value = getFeatureFlag(CTA_FLAG);
      if (isVariant(value)) {
        if (live) setVariant(value);
        window.clearInterval(id);
      } else if (tries >= 10) {
        window.clearInterval(id);
      }
    }, 400);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  return { variant, label: ctaVariants[variant] };
}
