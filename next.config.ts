import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * Placeholder imagery can never ship by accident. PLACEHOLDER_IMAGES=true is refused for any production
 * target: a Vercel production deployment, or any local `next build` that is not explicitly marked as a
 * presentation build with PLACEHOLDER_PRESENTATION_BUILD=1. Preview deployments are allowed.
 */
if (process.env.PLACEHOLDER_IMAGES === "true") {
  const vercelEnv = process.env.VERCEL_ENV;
  const productionTarget =
    vercelEnv === "production" ||
    (!vercelEnv && process.env.NODE_ENV === "production" && process.env.PLACEHOLDER_PRESENTATION_BUILD !== "1");
  if (productionTarget) {
    throw new Error(
      "PLACEHOLDER_IMAGES=true in a production build. Placeholder stock must not ship. Unset it, or for a client presentation build set PLACEHOLDER_PRESENTATION_BUILD=1 (never on a production deployment).",
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
