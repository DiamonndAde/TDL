/**
 * Zoho Recruit, server side only (imported from the careers server action). TDL's recruiters work in Recruit
 * daily; a talent-pool submission that lands anywhere else is a CV nobody reads. This creates the Candidate
 * record directly through the v2 REST API, which Zoho documents as available on every edition including Free
 * (500 requests/day/org) — no plan upgrade needed (docs/DESIGN-DECISIONS.md, 2026-09-19; Q29).
 *
 * Authentication is a "Self Client" from api-console.zoho.com: an administrator generates a grant code with the
 * scopes below, exchanges it once for a refresh token, and that token (plus the client id and secret) lives in
 * the environment. Access tokens last an hour and are refreshed here on demand. Scopes needed:
 *   ZohoRecruit.modules.candidates.CREATE, ZohoRecruit.modules.notes.CREATE
 * Hosts vary by data centre (accounts.zoho.com / recruit.zoho.com for US; .eu, .in, .com.au, .jp, .ca ...):
 * set ZOHO_ACCOUNTS_HOST and ZOHO_RECRUIT_API_HOST if TDL's org is not on the US DC.
 *
 * Not yet exercised against TDL's org — field API names below are Zoho's standard Candidates layout
 * (Last_Name is the only mandatory field). If TDL has renamed or removed a field, the insert returns
 * INVALID_DATA naming it; adjust `candidateRecord()` in the action.
 */

const env = () => ({
  clientId: process.env.ZOHO_RECRUIT_CLIENT_ID ?? "",
  clientSecret: process.env.ZOHO_RECRUIT_CLIENT_SECRET ?? "",
  refreshToken: process.env.ZOHO_RECRUIT_REFRESH_TOKEN ?? "",
  accountsHost: process.env.ZOHO_ACCOUNTS_HOST || "accounts.zoho.com",
  apiHost: process.env.ZOHO_RECRUIT_API_HOST || "recruit.zoho.com",
});

/** True when the three credentials are set; the action falls back to the webhook otherwise. */
export const zohoRecruitConfigured = () => {
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
  if (!res.ok || !json.access_token) throw new Error(`zoho token ${res.status} ${json.error ?? ""}`.trim());
  cached = { token: json.access_token, expiresAt: Date.now() + ((json.expires_in ?? 3600) - 120) * 1000 };
  return cached.token;
}

type InsertResponse = { data?: { code: string; status: string; message: string; details?: { id?: string; api_name?: string } }[] };

async function insert(module: "Candidates" | "Notes", record: Record<string, unknown>): Promise<string> {
  const token = await accessToken();
  const res = await fetch(`https://${env().apiHost}/recruit/v2/${module}`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ data: [record] }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as InsertResponse;
  const first = json.data?.[0];
  if (!res.ok || !first || first.code !== "SUCCESS") {
    const why = first ? `${first.code} ${first.message} ${first.details?.api_name ?? ""}` : String(res.status);
    throw new Error(`zoho ${module} insert failed: ${why.trim()}`);
  }
  return first.details?.id ?? "";
}

/**
 * Create the Candidate, then attach the free-text answers as a note on the record so nothing the person wrote
 * is lost to a field that does not exist. The note is best-effort: a candidate without a note is still a
 * candidate in the ATS, whereas a thrown error here would tell the person their submission failed when it
 * did not.
 */
export async function createTalentPoolCandidate(record: Record<string, unknown>, note: { title: string; content: string }) {
  const id = await insert("Candidates", record);
  if (id) {
    try {
      await insert("Notes", { Note_Title: note.title, Note_Content: note.content, Parent_Id: id, se_module: "Candidates" });
    } catch (err) {
      console.error("[application] candidate created but note failed:", err);
    }
  }
  return id;
}
