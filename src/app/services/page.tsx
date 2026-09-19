import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RosterMount } from "@/components/roster/roster-mount";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { JsonLd } from "@/components/seo/json-ld";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Seven service lines from Total Data Limited: HR outsourcing, business process outsourcing, recruitment and background checks, learning and development, payroll, business advisory and technology.",
  alternates: { canonical: "/services" },
};

/** Index — pick your problem, not our org chart (brief §7). Seven rows, each named by what it removes. */
export default function ServicesIndex() {
  return (
    <main id="main" className="relative">
      <JsonLd include={["services"]} />
      <RosterMount />
      <section className="bg-paper" aria-labelledby="services-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Services</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">{rosterStatusText.columns}</p>
          </div>
          <div>
            <h1 id="services-title" className="display max-w-[16ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              Pick the problem, not the org chart.
            </h1>
            <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive md:text-[1.125rem]">
              Seven things we take off your desk. Each one runs on its own, and they run together when you need them to.
            </p>
            <div className="mt-10">
              <RosterSlot state="columns" tone="paper" className="h-[140px] lg:h-[220px]">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-olive" />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-olive" />
              </RosterSlot>
              <p className="data mt-2 text-olive">Lanes group people by service line. They are not headcounts.</p>
            </div>
            <ol className="mt-12 max-w-[42rem] border-t border-olive">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-olive">
                  <Link href={`/services/${s.slug}`} className="block py-5 hover:text-signal-deep">
                    <span className="block text-[1.25rem] font-medium">{s.name}</span>
                    <span className="mt-1 block max-w-[40em] text-[15px] leading-relaxed">{s.removes}</span>
                    <span className="data mt-2 block text-olive">{s.lines.map((l) => l.name).join(", ")}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </main>
  );
}
