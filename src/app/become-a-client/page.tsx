import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { company } from "@/content/facts";

export const metadata: Metadata = {
  title: "Become a client",
  description:
    "Tell Total Data Limited which services you need and how many people are involved. Three short steps; a representative contacts you within 24 hours.",
  alternates: { canonical: "/become-a-client" },
};

/**
 * The money page. Quiet, paper, one form. `?service=<slug>` (from a service page's scoped CTA) pre-selects
 * that service in step 1 — read on the client inside a Suspense boundary so the route stays static.
 */
export default function BecomeAClientPage() {
  return (
    <main id="main" className="bg-paper">
      <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_minmax(0,40rem)] lg:gap-10">
        <div className="mb-8 lg:mb-0">
          <h1 className="text-[15px] font-medium">Become a client</h1>
          <p className="data mt-1.5 max-w-[12rem] text-olive">Three steps. Each one should cost you nothing to answer.</p>
          <p className="data mt-6 max-w-[12rem] text-olive">
            Or reach us directly:{" "}
            <a href={company.phoneHref} className="text-ink underline underline-offset-4">
              {company.phone}
            </a>
          </p>
        </div>
        <div>
          <Suspense fallback={null}>
            <EnquiryForm />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
