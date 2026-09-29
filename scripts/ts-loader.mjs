/**
 * Minimal module resolver so plain Node can import the app's TypeScript directly: maps the `@/` alias to
 * `src/`, and adds the `.ts` extension that TypeScript source omits. Run with `--experimental-strip-types`,
 * which removes the types; nothing here compiles or transforms code. Used by `scripts/provider-proof.mjs`.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const SRC = resolvePath(process.cwd(), "src");

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = resolvePath(SRC, specifier.slice(2));
    for (const candidate of [base, base + ".ts", base + ".tsx", resolvePath(base, "index.ts")]) {
      if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context);
    }
  }
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
    for (const candidate of [base + ".ts", resolvePath(base, "index.ts")]) {
      if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context);
    }
  }
  return next(specifier, context);
}
