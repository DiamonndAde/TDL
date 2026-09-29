/**
 * No delivery configured. It refuses honestly instead of accepting a submission it cannot deliver — a form that
 * says "thank you" and drops the CV is worse than one that says it is not connected. In development it logs the
 * draft so the form can still be exercised; the log is a developer's console, never a store.
 *
 * The careers board is still linked: TDL's openings exist whether or not this site can post to the ATS.
 */
import { boardUrl } from "./board";
import type { CandidateDraft, Opening, ProviderResult, RecruitmentProvider } from "./types";
import { unsupported } from "./types";

export const noneProvider: RecruitmentProvider = {
  name: "none",
  get openingsUrl() {
    return boardUrl();
  },
  capabilities: { listOpenings: false, createCandidate: false, addNote: false },

  async listOpenings(): Promise<ProviderResult<Opening[]>> {
    return unsupported("no recruitment provider configured");
  },

  async createCandidate(draft: CandidateDraft): Promise<ProviderResult<{ id: string }>> {
    if (process.env.NODE_ENV !== "production") {
      console.log("[recruitment] no provider configured; would deliver:", JSON.stringify(draft, null, 2));
      return { ok: true, value: { id: "" } };
    }
    return { ok: false, reason: "unconfigured", detail: "no recruitment provider configured" };
  },

  async addNote(): Promise<ProviderResult<void>> {
    return unsupported("no recruitment provider configured");
  },
};
