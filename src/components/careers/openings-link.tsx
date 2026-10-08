"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useCtaVariant } from "@/lib/analytics/experiment";

/**
 * The handoff out to TDL's applicant tracking system, and the one point where our view of the funnel ends. The
 * click is recorded here; whether it became an application is inside the ATS and we cannot see it
 * (CLIENT-QUESTIONS.md Q29f, docs/ANALYTICS-PROPOSAL.md §3).
 *
 * The href is already decorated by the recruitment adapter, so this component knows nothing about which ATS it
 * is or how that provider spells "source".
 *
 * The wording is the subject of a prepared, switched-off experiment. With experiments off — every environment
 * today — `useCtaVariant()` returns the control and the button reads "See current openings", server-rendered
 * and unchanging. The variant is attached to the click event so the experiment can be read from the funnel
 * rather than only from PostHog's own experiment view.
 */
export function OpeningsLink({ href }: { href: string }) {
  const { variant, label } = useCtaVariant();
  return (
    <Button
      href={href}
      rel="noopener"
      target="_blank"
      onClick={() => track({ name: "openings_clicked", destination: "ats", cta_variant: variant })}
    >
      {label}
    </Button>
  );
}
