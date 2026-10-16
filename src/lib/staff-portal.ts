import { company } from "@/content/facts";
import { isDemoBuild } from "./build-mode";

export type StaffPortalLink = { href: string; label: string; external: boolean };

/**
 * The staff-portal (HRIS) link, or `null` when it should not appear.
 *
 *  - URL set (Q31 answered): the real portal, in a new tab, on every build.
 *  - No URL, demo build: a one-line holding page, so the link can be shown in a demo without being dead.
 *  - No URL, live site: nothing. A link to "coming soon" on the live site is worse than no link.
 *
 * Server-only (reads the demo-build switch). Client components receive the result as a prop.
 */
export function staffPortalLink(): StaffPortalLink | null {
  const url = company.staffPortal.url.trim();
  if (url) return { href: url, label: company.staffPortal.label, external: true };
  if (isDemoBuild) return { href: "/staff-portal", label: company.staffPortal.label, external: false };
  return null;
}
