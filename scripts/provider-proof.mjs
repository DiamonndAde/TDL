/**
 * Proves provider selection and the delivery contract without touching a real ATS: a local HTTP server stands
 * in for both the OAuth endpoint and the API, so every branch is exercised end to end.
 *
 * Usage: node scripts/provider-proof.mjs   (exits 1 on failure)
 */
import { createServer } from "node:http";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ts-loader.mjs", pathToFileURL("./scripts/"));

const calls = [];
const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = null;
    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      parsed = Object.fromEntries(new URLSearchParams(body)); // the token endpoint is form-encoded
    }
    calls.push({ url: req.url, body: parsed });
    res.setHeader("content-type", "application/json");
    if (req.url.startsWith("/oauth")) return res.end(JSON.stringify({ access_token: "t", expires_in: 3600 }));
    if (req.url.includes("/Candidates")) return res.end(JSON.stringify({ data: [{ code: "SUCCESS", message: "ok", details: { id: "C1" } }] }));
    if (req.url.includes("/Notes")) return res.end(JSON.stringify({ data: [{ code: "SUCCESS", message: "ok", details: { id: "N1" } }] }));
    if (req.url.includes("/JobOpenings"))
      return res.end(JSON.stringify({ data: [
        { id: "J1", Posting_Title: "Payroll officer", City: "Lagos", Job_Type: "Full time", Date_Opened: "2026-09-01", Job_Opening_Status: "In-Progress" },
        { id: "J2", Posting_Title: "Closed role", Job_Opening_Status: "Filled" },
      ] }));
    res.end("{}");
  });
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const origin = `localhost:${port}`;

const failures = [];
const check = (ok, label, detail = "") => {
  console.log((ok ? "  ok   " : "  FAIL ") + label + (detail ? `: ${detail}` : ""));
  if (!ok) failures.push(label);
};

const DRAFT = {
  name: "Ada Nwosu", email: "ada@example.com", phone: "+234 800 000 0000",
  location: "Lagos", area: "Payroll management", message: "Six years in payroll.",
  consentAt: "2026-09-29T10:00:00.000Z", source: "totaldatalimited.com/careers",
};

function env(vars) {
  for (const k of ["ZOHO_RECRUIT_CLIENT_ID", "ZOHO_RECRUIT_CLIENT_SECRET", "ZOHO_RECRUIT_REFRESH_TOKEN",
                   "ZOHO_ACCOUNTS_HOST", "ZOHO_RECRUIT_API_HOST", "FORM_WEBHOOK_URL", "RECRUITMENT_PROVIDER",
                   "RECRUITMENT_BOARD_URL"]) delete process.env[k];
  Object.assign(process.env, vars);
}

// Zoho's client uses https; point it at the stub over http by patching fetch's scheme for this host only.
const realFetch = globalThis.fetch;
globalThis.fetch = (url, init) => realFetch(String(url).replace(`https://${origin}`, `http://${origin}`), init);

const { getRecruitmentProvider, openingsUrl } = await import("../src/lib/recruitment/index.ts");

console.log("Provider selection");
env({});
check(getRecruitmentProvider().name === "none", "nothing configured selects the null provider", getRecruitmentProvider().name);
env({ FORM_WEBHOOK_URL: `http://${origin}/hook` });
check(getRecruitmentProvider().name === "webhook", "FORM_WEBHOOK_URL alone selects the webhook", getRecruitmentProvider().name);
env({ FORM_WEBHOOK_URL: `http://${origin}/hook`, ZOHO_RECRUIT_CLIENT_ID: "a", ZOHO_RECRUIT_CLIENT_SECRET: "b", ZOHO_RECRUIT_REFRESH_TOKEN: "c" });
check(getRecruitmentProvider().name === "zoho-recruit", "ATS credentials win over the webhook", getRecruitmentProvider().name);
env({ FORM_WEBHOOK_URL: `http://${origin}/hook`, ZOHO_RECRUIT_CLIENT_ID: "a", ZOHO_RECRUIT_CLIENT_SECRET: "b", ZOHO_RECRUIT_REFRESH_TOKEN: "c", RECRUITMENT_PROVIDER: "webhook" });
check(getRecruitmentProvider().name === "webhook", "RECRUITMENT_PROVIDER overrides auto-selection", getRecruitmentProvider().name);
env({ RECRUITMENT_BOARD_URL: "https://careers.example.com" });
check(openingsUrl() === "https://careers.example.com", "RECRUITMENT_BOARD_URL overrides the board link", String(openingsUrl()));
env({});
check(String(openingsUrl()).includes("/jobs/Careers"), "board falls back to the URL in src/content", String(openingsUrl()));

console.log("\nATS adapter against a stub API");
env({ ZOHO_RECRUIT_CLIENT_ID: "a", ZOHO_RECRUIT_CLIENT_SECRET: "b", ZOHO_RECRUIT_REFRESH_TOKEN: "c",
      ZOHO_ACCOUNTS_HOST: origin, ZOHO_RECRUIT_API_HOST: origin });
const ats = getRecruitmentProvider();
calls.length = 0;
const created = await ats.createCandidate(DRAFT);
check(created.ok && created.value.id === "C1", "createCandidate returns the record id", JSON.stringify(created));
const sent = calls.find((c) => c.url.includes("/Candidates"))?.body?.data?.[0] ?? {};
check(sent.Last_Name === "Nwosu" && sent.First_Name === "Ada", "name splits on the last word", JSON.stringify(sent));
check(!JSON.stringify(sent).includes("Six years"), "the free text is NOT put in a candidate field", JSON.stringify(sent));
const noted = await ats.addNote("C1", { title: "T", content: DRAFT.message });
const note = calls.find((c) => c.url.includes("/Notes"))?.body?.data?.[0] ?? {};
check(noted.ok && note.Parent_Id === "C1" && note.se_module === "Candidates", "addNote attaches to the candidate", JSON.stringify(note));
const listed = await ats.listOpenings();
check(listed.ok && listed.value.length === 1 && listed.value[0].title === "Payroll officer", "listOpenings returns only open roles", JSON.stringify(listed.value ?? listed));
check(listed.ok && listed.value[0].applyUrl.endsWith("/J1"), "each opening applies on the provider, not here", listed.ok ? listed.value[0].applyUrl : "");

console.log("\nWebhook adapter");
env({ FORM_WEBHOOK_URL: `http://${origin}/hook` });
const hook = getRecruitmentProvider();
calls.length = 0;
const hookResult = await hook.createCandidate(DRAFT);
const posted = calls.find((c) => c.url === "/hook")?.body ?? {};
check(hookResult.ok, "webhook accepts the draft", JSON.stringify(hookResult));
check(String(posted.message).includes("Six years"), "a provider without notes carries the message itself", JSON.stringify(posted).slice(0, 120));
check(hook.capabilities.addNote === false && (await hook.addNote()).reason === "unsupported", "addNote is reported unsupported, not failed", "");
check((await hook.listOpenings()).reason === "unsupported", "listOpenings is reported unsupported", "");

console.log("\nNull provider");
env({ NODE_ENV: "production" });
const none = getRecruitmentProvider();
const refused = await none.createCandidate(DRAFT);
check(!refused.ok && refused.reason === "unconfigured", "refuses rather than silently accepting", JSON.stringify(refused));

server.close();
console.log("\nFAILURES:", failures.length ? failures.join(", ") : "none");
process.exit(failures.length ? 1 : 0);
