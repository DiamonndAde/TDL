"use server";

import { parseEnquiry, type Enquiry } from "@/components/enquiry/schema";
import { serviceBySlug } from "@/content/services";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Server action for the qualification form. Validates the whole submission again server-side, then delivers it.
 *
 * Delivery: TODO(client): Q20 — where do submissions go? Until told, this posts the enquiry as JSON to
 * FORM_WEBHOOK_URL if set (any inbox/CRM/automation endpoint), and in development logs it. There is no
 * email provider dependency to remove later.
 */
export async function submitEnquiry(data: Enquiry): Promise<SubmitResult> {
  const parsed = parseEnquiry(data);
  if (!parsed.success) return { ok: false, error: "Some answers need attention. Check the steps and try again." };
  if (parsed.data.website) return { ok: true }; // honeypot filled: pretend success, deliver nothing

  const payload = {
    receivedAt: new Date().toISOString(),
    services: parsed.data.services.map((s) => serviceBySlug(s)?.name ?? s),
    headcount: parsed.data.headcount,
    organisation: parsed.data.organisation,
    industry: parsed.data.industry,
    location: parsed.data.location,
    arrangement: parsed.data.arrangement,
    contact: {
      name: parsed.data.name,
      role: parsed.data.role,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredTime: parsed.data.contactTime,
    },
    source: "totaldatalimited.com/become-a-client",
  };

  const url = process.env.FORM_WEBHOOK_URL;
  if (url) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
      return { ok: true };
    } catch {
      return { ok: false, error: "We could not send this just now. Try again, or reach us on WhatsApp or by phone." };
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[enquiry] no FORM_WEBHOOK_URL set; would deliver:", JSON.stringify(payload, null, 2));
    return { ok: true };
  }
  return { ok: false, error: "The form is not connected yet. Reach us on WhatsApp or by phone and we will pick it up." };
}
