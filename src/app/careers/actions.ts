"use server";

import { parseApplication, type Application } from "@/components/careers/schema";

export type ApplyResult = { ok: true } | { ok: false; error: string };

/**
 * General application ("join the talent pool"). Same delivery as the enquiry form: JSON to FORM_WEBHOOK_URL with
 * source "careers", so TDL can route it to Zoho Recruit or an inbox (Q14, Q20). Openings themselves live in
 * TDL's Zoho Recruit and are linked, not duplicated.
 */
export async function submitApplication(data: Application): Promise<ApplyResult> {
  const parsed = parseApplication(data);
  if (!parsed.success) return { ok: false, error: "Some answers need attention. Check the form and try again." };
  if (parsed.data.website) return { ok: true }; // honeypot
  const { name, email, phone, location, area, message } = parsed.data;
  const payload = { receivedAt: new Date().toISOString(), source: "totaldatalimited.com/careers", name, email, phone, location, area, message };
  const url = process.env.FORM_WEBHOOK_URL;
  if (url) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
      return { ok: true };
    } catch {
      return { ok: false, error: "We could not send this just now. Try again, or apply through the openings page." };
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[application] no FORM_WEBHOOK_URL set; would deliver:", JSON.stringify(payload, null, 2));
    return { ok: true };
  }
  return { ok: false, error: "The form is not connected yet. Apply through the openings page instead." };
}
