/**
 * Two boundaries, enforced rather than described: the recruitment adapter, and what analytics may do.
 *
 * ANALYTICS
 *   4. No visitor is ever identified. `identify`, `alias` and `setPersonProperties` appear nowhere, and
 *      `person_profiles` stays "never". On a careers page a person profile is a profile of a job applicant,
 *      which is not something this site should hold or hand to a vendor.
 *   5. Exception autocapture stays off (`capture_exceptions: false`): an unhandled error's message and stack
 *      can carry whatever was being processed when it threw, which on these routes means form values.
 *   6. `track()` is never passed a template string or a variable as a property value in the form components —
 *      every property is a literal, a count, or a name from a closed union.
 *
 * RECRUITMENT
 *
 * TDL may leave Zoho Recruit (CLIENT-QUESTIONS.md Q29). That is only a one-file change if nothing outside
 * `src/lib/recruitment/` is *wired* to a specific provider. This checks three things:
 *
 *   1. No file outside the adapter imports an adapter module, reads a provider's environment variables, or
 *      names a provider's exported symbols. Prose is not checked: a comment explaining which ATS TDL runs
 *      today is useful, and the board URL in `src/content` is TDL's own address, which is data, not wiring.
 *   2. Nothing on the recruitment path persists a candidate — no filesystem, no database client, no browser
 *      storage. Holding applicants' personal data would make this site a data controller under the NDPR.
 *   3. The adapter entry point does not re-export an adapter wholesale, which would let callers reach past
 *      the interface.
 *
 * Usage: node scripts/check-adapter.mjs   (exits 1 on failure)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const ADAPTER_DIR = join("src", "lib", "recruitment");
const ANALYTICS_DIR = join("src", "lib", "analytics");
const failures = [];

/** Strip comments so prose never fails the check; keep string literals, since an import path is one. */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Wiring to a specific provider: importing its module, reading its env, or naming its exports. */
const COUPLING = [
  [/from\s+["'][^"']*\/recruitment\/(zoho|webhook|none)["']/, "imports an adapter module directly"],
  [/from\s+["']\.\/(zoho|webhook|none)["']/, "imports an adapter module directly"],
  [/\bprocess\.env\.ZOHO_[A-Z_]+/, "reads a provider's environment variable"],
  [/\b(zohoRecruitProvider|zohoConfigured|webhookProvider|webhookConfigured|noneProvider)\b/, "names a provider's export"],
];

const STORAGE = [
  [/from\s+["']node:fs["']|require\(["']fs["']\)/, "filesystem access"],
  [/\bfrom\s+["'](prisma|@prisma\/client|drizzle-orm|mongoose|pg|mysql2|better-sqlite3|redis|@vercel\/kv)["']/, "a database or store client"],
  [/\b(localStorage|sessionStorage|indexedDB)\b/, "browser storage"],
];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|mjs|js)$/.test(entry)) continue;
    const rel = relative(root, full);
    const code = stripComments(readFileSync(full, "utf8"));
    const insideAdapter = rel.startsWith(ADAPTER_DIR + sep);

    if (!insideAdapter) {
      for (const [re, what] of COUPLING) {
        const line = code.split("\n").findIndex((l) => re.test(l));
        if (line !== -1) failures.push(`${rel}:${line + 1} ${what} — only ${ADAPTER_DIR} may`);
      }
    }
    if (insideAdapter || rel.includes(join("app", "careers")) || rel.includes(join("components", "careers"))) {
      for (const [re, what] of STORAGE) {
        if (re.test(code)) failures.push(`${rel} uses ${what}; the site must not store candidate data (src/lib/recruitment/types.ts)`);
      }
    }
  }
}

walk(join(root, "src"));

// ---------------------------------------------------------------- analytics boundary
// Any receiver, and optional chaining too: `client?.identify(...)` must fail this as surely as
// `posthog.identify(...)`. These method names are PostHog-specific enough not to false-positive.
const IDENTIFY = /(?:\?\.|\.)\s*(identify|alias|setPersonProperties|setPersonPropertiesForFlags)\s*\(/;
function walkAnalytics(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkAnalytics(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const rel = relative(root, full);
    const code = stripComments(readFileSync(full, "utf8"));
    const m = code.match(IDENTIFY);
    if (m) failures.push(`${rel} calls ${m[1]}() — no visitor is ever identified (src/lib/analytics/index.ts)`);
  }
}
walkAnalytics(join(root, "src"));

const analyticsRuntime = stripComments(readFileSync(join(root, ANALYTICS_DIR, "index.ts"), "utf8"));
if (!/person_profiles:\s*["']never["']/.test(analyticsRuntime))
  failures.push(`${ANALYTICS_DIR}/index.ts must set person_profiles: "never"`);
if (!/capture_exceptions:\s*false/.test(analyticsRuntime))
  failures.push(`${ANALYTICS_DIR}/index.ts must set capture_exceptions: false — error messages can carry form values`);
if (!/maskAllInputs:\s*true/.test(analyticsRuntime) || !/maskTextSelector:\s*["']\*["']/.test(analyticsRuntime))
  failures.push(`${ANALYTICS_DIR}/index.ts must mask all inputs and all text in session replay`);

// Every property passed to track() must be a literal, a count or a closed-union name — never an interpolation.
for (const file of ["src/components/careers/application-form.tsx", "src/components/enquiry/enquiry-form.tsx",
                    "src/components/careers/openings-link.tsx", "src/components/layout/page-viewed.tsx"]) {
  const code = stripComments(readFileSync(join(root, file), "utf8"));
  for (const call of code.match(/track\(\{[^}]*\}\)/g) ?? []) {
    if (/`/.test(call)) failures.push(`${file} interpolates a template string into a track() property: ${call.slice(0, 80)}`);
  }
}

const index = stripComments(readFileSync(join(root, ADAPTER_DIR, "index.ts"), "utf8"));
if (/export\s+\*\s+from\s+["']\.\/(zoho|webhook|none)["']/.test(index)) {
  failures.push(`${ADAPTER_DIR}/index.ts re-exports an adapter wholesale; callers would bypass the interface`);
}

if (failures.length) {
  console.error("Boundary check FAILED:\n" + failures.map((f) => "  " + f).join("\n"));
  process.exit(1);
}
console.log(`Boundaries ok: nothing outside ${ADAPTER_DIR} is wired to a provider, no candidate data is stored, no visitor is identified, and analytics masking is in force.`);
