import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { certifications } from "@/content/about";
import { company } from "@/content/facts";

export const metadata: Metadata = {
  title: "Certifications",
  description: "Total Data Limited is ISO 9001:2015 certified and operates under the Nigeria Data Protection Regulations 2019. Quality policy and objectives.",
  alternates: { canonical: "/certifications" },
};

/**
 * What can be shown today: the ISO 9001:2015 badge the current site carries, the quality policy and objectives
 * PDFs (the client's own files), and the NDPR statement. The certificate itself and any operating licences are
 * reserved (Q19) — a row each, empty and saying so, rather than omitted.
 */
export default function CertificationsPage() {
  return (
    <main id="main" className="bg-paper">
      <section aria-labelledby="cert-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Certifications</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">Standards the firm is held to</p>
          </div>
          <div>
            <h1 id="cert-title" className="display max-w-[16ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              Certified to ISO 9001:2015, run under the NDPR.
            </h1>
            <div className="mt-10 flex items-center gap-6">
              <Image src={certifications.iso.badge} alt="ISO 9001:2015 certified" width={120} height={120} className="h-24 w-24 object-contain" />
              <p className="max-w-[34em] text-[1.0625rem]">
                Quality management certified to {certifications.iso.name}. Personal data handled under the {company.ndpr}.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Register id="documents" title="Documents" note="The firm's own files">
        <ul className="max-w-[42rem] border-t border-olive">
          {certifications.documents.map((d) => (
            <li key={d.href} className="flex items-baseline justify-between gap-6 border-b border-olive py-4">
              <span className="text-[1.0625rem]">{d.name}</span>
              <a href={d.href} className="data text-signal-deep underline underline-offset-4">
                Download PDF
              </a>
            </li>
          ))}
          {/* TODO(client): Q19 — reserved, empty rows for what has not been supplied. */}
          <li className="flex items-baseline justify-between gap-6 border-b border-olive py-4" data-todo="Q19">
            <span className="text-[1.0625rem]">ISO 9001:2015 certificate</span>
            <span className="data text-olive">To come</span>
          </li>
          <li className="flex items-baseline justify-between gap-6 border-b border-olive py-4" data-todo="Q19">
            <span className="text-[1.0625rem]">Operating licences</span>
            <span className="data text-olive">To come</span>
          </li>
        </ul>
      </Register>
    </main>
  );
}
