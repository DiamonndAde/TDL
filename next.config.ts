import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

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
