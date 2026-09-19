import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { JsonLd } from "@/components/seo/json-ld";
import { company, process } from "@/content/facts";

export const metadata: Metadata = {
  title: "Contact",
  description: `Total Data Limited, ${company.address.street}, ${company.address.locality}, ${company.address.region}. ${company.phone}. ${company.email}.`,
  alternates: { canonical: "/contact-us" },
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.name}, ${company.address.street}, ${company.address.locality}, ${company.address.region}, Nigeria`)}`;

/**
 * Direct lines first — a Nigerian enterprise buyer often reaches for WhatsApp or the phone before a form. The
 * address links out to Google Maps rather than embedding a map: no third-party script, no iframe, nothing that
 * fires before consent. The enquiry form stays on its own page.
 */
export default function ContactPage() {
  return (
    <main id="main" className="bg-paper">
      <JsonLd include={["localBusiness"]} />
      <section aria-labelledby="contact-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Contact</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">Direct lines, and where we are</p>
          </div>
          <div>
            <h1 id="contact-title" className="display max-w-[16ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              Call, message, or come to Ilupeju.
            </h1>
            <dl className="mt-10 max-w-[42rem] border-t border-olive">
              <Row term="Phone">
                <a href={company.phoneHref} className="text-signal-deep underline underline-offset-4">
                  {company.phone}
                </a>
              </Row>
              <Row term="WhatsApp">
                <a href={company.whatsappHref} rel="noopener" target="_blank" className="text-signal-deep underline underline-offset-4">
                  Message {company.phone}
                </a>
              </Row>
              <Row term="Email">
                <a href={`mailto:${company.email}`} className="text-signal-deep underline underline-offset-4">
                  {company.email}
                </a>
              </Row>
              <Row term="Office">
                <address className="not-italic">
                  {company.address.street}, {company.address.locality}, {company.address.region}
                  <br />
                  <a href={mapsUrl} rel="noopener" target="_blank" className="text-signal-deep underline underline-offset-4">
                    Open in Google Maps
                  </a>
                </address>
              </Row>
            </dl>
          </div>
        </Container>
      </section>

      <Register id="become" title="New client?" note="Three short steps">
        <p className="max-w-[36em] text-[1.0625rem]">
          Tell us which services you need and how many people are involved. {process.responsePromise}
        </p>
        <div className="mt-6">
          <Button href="/become-a-client">Become a client</Button>
        </div>
      </Register>
    </main>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-olive py-4 md:grid-cols-[10rem_1fr] md:gap-8">
      <dt className="data text-olive">{term}</dt>
      <dd className="text-[1.0625rem]">{children}</dd>
    </div>
  );
}
