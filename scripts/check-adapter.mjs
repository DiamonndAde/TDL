/**
 * The recruitment adapter boundary, enforced rather than described.
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

const index = stripComments(readFileSync(join(root, ADAPTER_DIR, "index.ts"), "utf8"));
if (/export\s+\*\s+from\s+["']\.\/(zoho|webhook|none)["']/.test(index)) {
  failures.push(`${ADAPTER_DIR}/index.ts re-exports an adapter wholesale; callers would bypass the interface`);
}

if (failures.length) {
  console.error("Adapter boundary check FAILED:\n" + failures.map((f) => "  " + f).join("\n"));
  process.exit(1);
}
console.log(`Adapter boundary ok: nothing outside ${ADAPTER_DIR} is wired to a provider, and no candidate data is stored.`);
