import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Total Data Limited collects, uses, stores and shares personal information, under the Nigeria Data Protection Regulations 2019.",
  alternates: { canonical: "/privacy-policy" },
};

// Verbatim from the current site; TODO(client): Q25 — legal review before launch.
export default function Page() {
  return <LegalPage title="Privacy policy" blocks={privacyPolicy} />;
}
