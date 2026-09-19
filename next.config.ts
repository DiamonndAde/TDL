import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * Placeholder imagery cannot ship by accident.
 *
 * One rule, evaluated the same way everywhere (local, Vercel preview, Vercel production):
 *   - PLACEHOLDER_IMAGES off  → nothing to check.
 *   - PLACEHOLDER_IMAGES on   → allowed when the build is not a production target, or when the presentation
 *                               marker PLACEHOLDER_PRESENTATION_BUILD is also set. Otherwise the build fails.
 * A production target is NODE_ENV=production unless VERCEL_ENV says this is a preview (Vercel previews run with
 * NODE_ENV=production; VERCEL_ENV is what tells a preview from the live deployment). Both variables are read
 * the same way: trimmed, quotes stripped, case-insensitive, "true"/"1"/"yes"/"on" all count as on.
 * The error prints every value it saw so the next failure diagnoses itself.
 */
const readEnv = (key: string) => (process.env[key] ?? "").trim().replace(/^["']|["']$/g, "");
const isOn = (value: string) => ["true", "1", "yes", "on"].includes(value.toLowerCase());
{
  const seen = {
    PLACEHOLDER_IMAGES: readEnv("PLACEHOLDER_IMAGES"),
    PLACEHOLDER_PRESENTATION_BUILD: readEnv("PLACEHOLDER_PRESENTATION_BUILD"),
    NODE_ENV: readEnv("NODE_ENV"),
    VERCEL_ENV: readEnv("VERCEL_ENV"),
    VERCEL: readEnv("VERCEL"),
  };
  const placeholders = isOn(seen.PLACEHOLDER_IMAGES);
  const presentation = isOn(seen.PLACEHOLDER_PRESENTATION_BUILD);
  const productionTarget = seen.NODE_ENV === "production" && seen.VERCEL_ENV !== "preview" && seen.VERCEL_ENV !== "development";
  if (placeholders && productionTarget && !presentation) {
    const report = Object.entries(seen)
      .map(([k, v]) => `${k}=${v === "" ? "(unset)" : JSON.stringify(v)}`)
      .join("  ");
    throw new Error(
      "Placeholder guard: PLACEHOLDER_IMAGES is on for a production target without the presentation marker. " +
        "Placeholder stock must not ship. Either unset PLACEHOLDER_IMAGES, or set PLACEHOLDER_PRESENTATION_BUILD=1 " +
        "for a deliberate client presentation build (remove both before launch). " +
        `Values seen: ${report}`,
    );
  }
  if (placeholders && productionTarget && presentation) {
    console.warn(
      `[placeholder guard] Presentation build: placeholder imagery is ON for a production target (VERCEL_ENV=${seen.VERCEL_ENV || "(unset)"}). Remove PLACEHOLDER_IMAGES and PLACEHOLDER_PRESENTATION_BUILD before launch.`,
    );
  }
}

/**
 * Redirects: every URL on the current site is preserved or 308'd (AGENTS.md, SEO). Service and company URLs
 * are preserved as-is; only the money page and the dead blog link move. Next returns 308 for permanent.
 */
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/new-client", destination: "/become-a-client", permanent: true },
      { source: "/Blog", destination: "/insights", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

// `npm run analyze` opens the per-route treemaps. Next 16 dropped First Load JS from the build output,
// so this is how the 200 KB budget is checked (plus Lighthouse).
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withBundleAnalyzer(nextConfig);
