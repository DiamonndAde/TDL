"use server";

import { parseApplication, type Application } from "@/components/careers/schema";
import { getRecruitmentProvider, type CandidateDraft } from "@/lib/recruitment";

import type { FailureReason } from "@/lib/analytics/events";

/**
 * `reason` is for the analytics event, `error` for the visitor. Separate on purpose: the sentence on screen may
 * be reworded at any time, and nothing should string-match it to classify a failure.
 */
export type ApplyResult = { ok: true } | { ok: false; error: string; reason: FailureReason };

/**
 * General application ("join the talent pool").
 *
 * This action knows nothing about which ATS TDL runs. It hands the draft to whichever provider is configured
 * (`src/lib/recruitment`) and reports the outcome; swapping Zoho Recruit for another system is a new adapter,
 * not a change here (CLIENT-QUESTIONS.md Q29, docs/DESIGN-DECISIONS.md "If TDL leaves Zoho").
 *
 * **Nothing is stored on our side.** The draft is validated, passed on and dropped. The site never becomes a
 * holder of applicants' personal data.
 */
export async function submitApplication(data: Application): Promise<ApplyResult> {
  const parsed = parseApplication(data);
  if (!parsed.success) return { ok: false, error: "Some answers need attention. Check the form and try again.", reason: "validation" };
  if (parsed.data.website) return { ok: true }; // honeypot
  const { name, email, phone, location, area, message } = parsed.data;

  const draft: CandidateDraft = {
    name,
    email,
    phone,
    location,
    area,
    message,
    consentAt: new Date().toISOString(),
    source: "totaldatalimited.com/careers",
  };

  const provider = getRecruitmentProvider();
  const created = await provider.createCandidate(draft);

  if (!created.ok) {
    if (created.reason === "unconfigured") {
      console.error(`[application] ${provider.name} is not configured: ${created.detail ?? ""}`);
      return { ok: false, error: "The form is not connected yet. Apply through the openings page instead.", reason: "unconfigured" };
    }
    console.error(`[application] ${provider.name} delivery failed: ${created.detail ?? ""}`);
    return { ok: false, error: "We could not send this just now. Try again, or apply through the openings page.", reason: "delivery" };
  }

  // The answers that have no field of their own go on as a note, so a renamed custom field cannot swallow them.
  // A provider without notes has already delivered `message` itself (the contract in lib/recruitment/types.ts),
  // and a note that fails is logged, not surfaced: the candidate record exists, so the submission did succeed.
  if (provider.capabilities.addNote && created.value.id) {
    const note = await provider.addNote(created.value.id, {
      title: "Talent pool submission from totaldatalimited.com",
      content: [
        `Area of work: ${draft.area}`,
        `Based in: ${draft.location}`,
        `Consent to processing under the NDPR: yes, ${draft.consentAt}`,
        "",
        draft.message || "(no message)",
      ].join("\n"),
    });
    if (!note.ok) console.error(`[application] candidate created but note failed: ${note.detail ?? note.reason}`);
  }

  return { ok: true };
}
