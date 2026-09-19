"use server";

import { parseApplication, type Application } from "@/components/careers/schema";
import { createTalentPoolCandidate, zohoRecruitConfigured } from "@/lib/zoho-recruit";

export type ApplyResult = { ok: true } | { ok: false; error: string };

/**
 * General application ("join the talent pool"). Delivery, in order of preference:
 *  1. Zoho Recruit — a Candidate record with a note, where TDL's recruiters already work (Q14, Q29). This is
 *     the only destination that is not a hole: openings, applications and this form all end up in one ATS.
 *  2. FORM_WEBHOOK_URL, the enquiry form's endpoint, with source "careers" — until the Zoho credentials arrive.
 *     Somebody at TDL must watch that inbox; recruiters will not.
 *  3. Nothing configured: development logs the payload; production refuses honestly and points at the
 *     openings page, where Zoho's own apply flow is.
 */
export async function submitApplication(data: Application): Promise<ApplyResult> {
  const parsed = parseApplication(data);
  if (!parsed.success) return { ok: false, error: "Some answers need attention. Check the form and try again." };
  if (parsed.data.website) return { ok: true }; // honeypot
  const { name, email, phone, location, area, message } = parsed.data;
  const receivedAt = new Date().toISOString();
  const failed = { ok: false as const, error: "We could not send this just now. Try again, or apply through the openings page." };

  if (zohoRecruitConfigured()) {
    try {
      await createTalentPoolCandidate(candidateRecord({ name, email, phone, location }), {
        title: "Talent pool submission from totaldatalimited.com",
        content: [
          `Area of work: ${area}`,
          `Based in: ${location}`,
          `Consent to processing under the NDPR: yes, ${receivedAt}`,
          "",
          message || "(no message)",
        ].join("\n"),
      });
      return { ok: true };
    } catch (err) {
      console.error("[application] zoho delivery failed:", err);
      return failed;
    }
  }

  const url = process.env.FORM_WEBHOOK_URL;
  const payload = { receivedAt, source: "totaldatalimited.com/careers", name, email, phone, location, area, message };
  if (url) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
      return { ok: true };
    } catch {
      return failed;
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[application] no Zoho credentials or FORM_WEBHOOK_URL set; would deliver:", JSON.stringify(payload, null, 2));
    return { ok: true };
  }
  return { ok: false, error: "The form is not connected yet. Apply through the openings page instead." };
}

/**
 * Standard Zoho Recruit Candidates fields. Zoho splits the name; the last word is the surname, and a single
 * word goes in Last_Name because that is the one mandatory field. `Source` is a picklist: ZOHO_RECRUIT_SOURCE
 * must be a value that exists in TDL's org (Q29) or the field is left for Zoho's default.
 */
function candidateRecord({ name, email, phone, location }: { name: string; email: string; phone: string; location: string }) {
  const words = name.split(/\s+/).filter(Boolean);
  const lastName = words.length > 1 ? words[words.length - 1] : words[0];
  const firstName = words.length > 1 ? words.slice(0, -1).join(" ") : undefined;
  const source = process.env.ZOHO_RECRUIT_SOURCE;
  return {
    Last_Name: lastName,
    ...(firstName ? { First_Name: firstName } : {}),
    Email: email,
    Phone: phone,
    City: location,
    ...(source ? { Source: source } : {}),
  };
}
