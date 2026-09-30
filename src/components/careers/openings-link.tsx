"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

/**
 * "See current openings" — the handoff out to TDL's applicant tracking system, and the one point where our
 * view of the funnel ends. The click is recorded here; whether it became an application is inside the ATS and
 * we cannot see it (CLIENT-QUESTIONS.md Q29f, docs/ANALYTICS-PROPOSAL.md §3).
 *
 * The href is already decorated by the recruitment adapter, so this component knows nothing about which ATS it
 * is or how that provider spells "source".
 */
export function OpeningsLink({ href }: { href: string }) {
  return (
    <Button
      href={href}
      rel="noopener"
      target="_blank"
      onClick={() => track({ name: "openings_clicked", destination: "ats" })}
    >
      See current openings
    </Button>
  );
}
