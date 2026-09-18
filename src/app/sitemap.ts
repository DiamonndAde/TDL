import type { MetadataRoute } from "next";
import { company } from "@/content/facts";
import { services } from "@/content/services";

const base = company.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/services",
    "/work",
    "/about-us",
    "/careers",
    "/contact-us",
    "/become-a-client",
    "/certifications",
    "/privacy-policy",
    "/cookies-policy",
  ];
  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/become-a-client" ? 0.9 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
