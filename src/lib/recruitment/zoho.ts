/**
 * Zoho Recruit adapter. The only file in the codebase that knows Zoho exists — verified by
 * `scripts/check-adapter.mjs`, which fails the check if "zoho" appears outside this directory's adapter.
 *
 * The v2 REST API is available on every Zoho edition including Free (500 requests/day/org), so this needs no
 * plan upgrade (docs/DESIGN-DECISIONS.md, 2026-09-19; CLIENT-QUESTIONS.md Q29). Authentication is a "Self
 * Client" an administrator creates at api-console.zoho.com: they generate a grant code with the scopes below,
 * exchange it once for a refresh token, and that token plus the client id and secret live in the environment.
 * Access tokens last an hour and are refreshed here on demand.
 *
 *   Talent pool:  ZohoRecruit.modules.candidates.CREATE, ZohoRecruit.modules.notes.CREATE
 *   Openings:     ZohoRecruit.modules.jobopenings.READ
 *
 * Hosts vary by data centre (US: accounts.zoho.com / recruit.zoho.com; also .eu, .in, .com.au, .jp, .ca):
 * set ZOHO_ACCOUNTS_HOST and ZOHO_RECRUIT_API_HOST if TDL's org is not on the US DC.
 *
 * **Not yet exercised against TDL's org** — no credentials exist yet. Field names below are Zoho's standard
 * layout (`Last_Name` is the only mandatory Candidates field). If TDL has renamed or removed one, the insert
 * returns INVALID_DATA naming it, and only `candidateRecord` here needs changing.
 */
import { boardUrl } from "./board";
import type { CandidateDraft, Note, Opening, ProviderResult, RecruitmentProvider } from "./types";

const env = () => ({
  clientId: process.env.ZOHO_RECRUIT_CLIENT_ID ?? "",
  clientSecret: process.env.ZOHO_RECRUIT_CLIENT_SECRET ?? "",
  refreshToken: process.env.ZOHO_RECRUIT_REFRESH_TOKEN ?? "",
  accountsHost: process.env.ZOHO_ACCOUNTS_HOST || "accounts.zoho.com",
  apiHost: process.env.ZOHO_RECRUIT_API_HOST || "recruit.zoho.com",
  /** The public board. Linked from /careers until openings are rendered here (Q29). */
  boardUrl: boardUrl() ?? "",
  /** Must be a value that exists in the org's Candidates → Source picklist, or Zoho's default is used. */
  source: process.env.ZOHO_RECRUIT_SOURCE || "",
});

export const zohoConfigured = () => {
  const e = env();
  return Boolean(e.clientId && e.clientSecret && e.refreshToken);
};

/** Access token, cached per server instance until shortly before Zoho's one-hour expiry. */
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const e = env();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: e.clientId,
    client_secret: e.clientSecret,
    refresh_token: e.refreshToken,
  });
  const res = await fetch(`https://${e.accountsHost}/oauth/v2/token`, { method: "POST", body, cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !json.access_token) throw new Error(`token ${res.status} ${json.error ?? ""}`.trim());
  cached = { token: json.access_token, expiresAt: Date.now() + ((json.expires_in ?? 3600) - 120) * 1000 };
  return cached.token;
}

type WriteResponse = { data?: { code: string; message: string; details?: { id?: string; api_name?: string } }[] };

async function insert(module: "Candidates" | "Notes", record: Record<string, unknown>): Promise<string> {
  const token = await accessToken();
  const res = await fetch(`https://${env().apiHost}/recruit/v2/${module}`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ data: [record] }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as WriteResponse;
  const first = json.data?.[0];
  if (!res.ok || !first || first.code !== "SUCCESS") {
    const why = first ? `${first.code} ${first.message} ${first.details?.api_name ?? ""}` : String(res.status);
    throw new Error(`${module} insert failed: ${why.trim()}`);
  }
  return first.details?.id ?? "";
}

/**
 * Zoho splits the name; the last word is the surname, and a single word goes in `Last_Name` because that is the
 * one mandatory field. The applicant's free text is not put here — it goes in the note, so a renamed custom
 * field can never silently swallow it.
 */
function candidateRecord(draft: CandidateDraft) {
  const words = draft.name.split(/\s+/).filter(Boolean);
  const lastName = words.length > 1 ? words[words.length - 1] : words[0];
  const firstName = words.length > 1 ? words.slice(0, -1).join(" ") : undefined;
  const source = env().source;
  return {
    Last_Name: lastName,
    ...(firstName ? { First_Name: firstName } : {}),
    Email: draft.email,
    Phone: draft.phone,
    City: draft.location,
    ...(source ? { Source: source } : {}),
  };
}

type JobOpeningRecord = {
  id?: string;
  Posting_Title?: string;
  Job_Opening_Name?: string;
  City?: string;
  State?: string;
  Country?: string;
  Job_Type?: string;
  Date_Opened?: string;
  Job_Description?: string;
  Job_Opening_Status?: string;
};

export const zohoRecruitProvider: RecruitmentProvider = {
  name: "zoho-recruit",
  get openingsUrl() {
    return env().boardUrl || null;
  },
  capabilities: { listOpenings: true, createCandidate: true, addNote: true },

  /**
   * Openings for rendering in our own design, with the apply step handed back to Zoho. Unverified against TDL's
   * org: which status counts as "published to the careers site" is a question for their administrator (Q29), so
   * this filters to `In-Progress` openings and nothing else is assumed. `/careers` does not call this yet.
   */
  async listOpenings(): Promise<ProviderResult<Opening[]>> {
    if (!zohoConfigured()) return { ok: false, reason: "unconfigured", detail: "ZOHO_RECRUIT_* not set" };
    try {
      const token = await accessToken();
      const res = await fetch(`https://${env().apiHost}/recruit/v2/JobOpenings?per_page=200`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
        cache: "no-store",
      });
      if (res.status === 204) return { ok: true, value: [] };
      if (!res.ok) return { ok: false, reason: "failed", detail: `JobOpenings ${res.status}` };
      const json = (await res.json()) as { data?: JobOpeningRecord[] };
      const board = env().boardUrl.replace(/\/+$/, "");
      const value = (json.data ?? [])
        .filter((r) => !r.Job_Opening_Status || /in.?progress|open/i.test(r.Job_Opening_Status))
        .map((r) => ({
          id: String(r.id ?? ""),
          title: r.Posting_Title || r.Job_Opening_Name || "Opening",
          location: [r.City, r.State, r.Country].filter(Boolean).join(", ") || undefined,
          employmentType: r.Job_Type || undefined,
          postedAt: r.Date_Opened || undefined,
          applyUrl: r.id ? `${board}/${r.id}` : board,
          description: r.Job_Description || undefined,
        }))
        .filter((o) => o.id);
      return { ok: true, value };
    } catch (err) {
      return { ok: false, reason: "failed", detail: String(err) };
    }
  },

  async createCandidate(draft): Promise<ProviderResult<{ id: string }>> {
    if (!zohoConfigured()) return { ok: false, reason: "unconfigured", detail: "ZOHO_RECRUIT_* not set" };
    try {
      return { ok: true, value: { id: await insert("Candidates", candidateRecord(draft)) } };
    } catch (err) {
      return { ok: false, reason: "failed", detail: String(err) };
    }
  },

  async addNote(candidateId: string, note: Note): Promise<ProviderResult<void>> {
    if (!zohoConfigured()) return { ok: false, reason: "unconfigured", detail: "ZOHO_RECRUIT_* not set" };
    if (!candidateId) return { ok: false, reason: "failed", detail: "no candidate id" };
    try {
      await insert("Notes", {
        Note_Title: note.title,
        Note_Content: note.content,
        Parent_Id: candidateId,
        se_module: "Candidates",
      });
      return { ok: true, value: undefined };
    } catch (err) {
      return { ok: false, reason: "failed", detail: String(err) };
    }
  },
};
