/**
 * Provider selection. The rest of the site imports from here and from `./types`, never from an adapter —
 * `node scripts/check-adapter.mjs` fails if it does.
 *
 * `RECRUITMENT_PROVIDER` picks one explicitly: `zoho`, `webhook`, or `none`. Left unset it auto-selects, which
 * is what every environment does today: the ATS when its credentials are present, the webhook when only
 * `FORM_WEBHOOK_URL` is, and otherwise the null provider, which refuses honestly rather than swallowing a
 * submission. Selection is evaluated per call, not at module load, so a variable added in the hosting dashboard
 * takes effect on the next request without a rebuild.
 */
import { noneProvider } from "./none";
import type { RecruitmentProvider } from "./types";
import { webhookConfigured, webhookProvider } from "./webhook";
import { zohoConfigured, zohoRecruitProvider } from "./zoho";

export type { CandidateDraft, Note, Opening, ProviderResult, RecruitmentProvider } from "./types";

const byName: Record<string, RecruitmentProvider> = {
  zoho: zohoRecruitProvider,
  "zoho-recruit": zohoRecruitProvider,
  webhook: webhookProvider,
  none: noneProvider,
};

export function getRecruitmentProvider(): RecruitmentProvider {
  const chosen = (process.env.RECRUITMENT_PROVIDER ?? "").trim().toLowerCase();
  if (chosen && byName[chosen]) return byName[chosen];
  if (zohoConfigured()) return zohoRecruitProvider;
  if (webhookConfigured()) return webhookProvider;
  return noneProvider;
}

/**
 * Where "See current openings" points. Every provider answers this, so a webhook-only deployment still sends
 * job-seekers to TDL's real openings.
 */
export function openingsUrl(): string | null {
  return getRecruitmentProvider().openingsUrl;
}
