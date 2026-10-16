import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { isDemoBuild } from "@/lib/build-mode";

export const metadata: Metadata = {
  title: "Staff portal",
  robots: { index: false, follow: false },
};

/**
 * Holding page for the staff-portal link, in demo builds only, until TDL sends the HRIS URL (Q31). On the live
 * site this route does not exist — the link is hidden until there is somewhere real for it to go.
 */
export default function StaffPortalPage() {
  if (!isDemoBuild) notFound();
  return (
    <main id="main" className="bg-paper">
      <Container className="py-24 md:py-32">
        <h1 className="text-[1.25rem] font-medium">Staff portal link to be added.</h1>
      </Container>
    </main>
  );
}
