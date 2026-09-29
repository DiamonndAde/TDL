/**
 * Webhook adapter: posts the submission as JSON to `FORM_WEBHOOK_URL` — any inbox, CRM or automation endpoint.
 *
 * This is the fallback, not the destination. It has no concept of an opening and no record to attach a note to,
 * so `capabilities.addNote` is false and `createCandidate` carries the applicant's message itself, as the
 * contract in `types.ts` requires. Whoever owns that inbox has to watch it: TDL's recruiters work in the ATS
 * and will not (CLIENT-QUESTIONS.md Q29).
 */
import { boardUrl } from "./board";
import type { CandidateDraft, Opening, ProviderResult, RecruitmentProvider } from "./types";
import { unsupported } from "./types";

export const webhookConfigured = () => Boolean(process.env.FORM_WEBHOOK_URL);

export const webhookProvider: RecruitmentProvider = {
  name: "webhook",
  /** The board is TDL's and exists regardless of who delivers the form. */
  get openingsUrl() {
    return boardUrl();
  },
  capabilities: { listOpenings: false, createCandidate: true, addNote: false },

  async listOpenings(): Promise<ProviderResult<Opening[]>> {
    return unsupported("a webhook endpoint has no openings to list");
  },

  async createCandidate(draft: CandidateDraft): Promise<ProviderResult<{ id: string }>> {
    const url = process.env.FORM_WEBHOOK_URL;
    if (!url) return { ok: false, reason: "unconfigured", detail: "FORM_WEBHOOK_URL not set" };
    try {
      // The whole draft, message included: there is no second call to carry it.
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ receivedAt: draft.consentAt, ...draft }),
      });
      if (!res.ok) return { ok: false, reason: "failed", detail: `webhook ${res.status}` };
      // No record id exists; the caller must not treat "" as a failure, only as nothing to attach a note to.
      return { ok: true, value: { id: "" } };
    } catch (err) {
      return { ok: false, reason: "failed", detail: String(err) };
    }
  },

  /** Takes no arguments: there is no record to annotate. TypeScript allows an implementation to ignore them. */
  async addNote(): Promise<ProviderResult<void>> {
    return unsupported("a webhook endpoint has no record to annotate");
  },
};
