import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { cookiesPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Cookies policy",
  description: "How Total Data Limited uses cookies on this website, and how to disable them.",
  alternates: { canonical: "/cookies-policy" },
};

// Verbatim from the current site; TODO(client): Q25 — legal review before launch.
export default function Page() {
  return <LegalPage title="Cookies policy" blocks={cookiesPolicy} />;
}
