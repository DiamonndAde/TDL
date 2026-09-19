import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { ActiveColumn } from "@/components/roster/active-column";
import { RosterMount } from "@/components/roster/roster-mount";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { company, process } from "@/content/facts";
import { services, serviceIndex, type Service } from "@/content/services";

/**
 * One template for the seven service pages. The headline is what the service removes from the buyer's plate;
 * the Roster shows the population by service line with this service's lane lifted — where you would sit among
 * the seven. Sub-services are rows (a list, so rules). The close is a CTA scoped to this service: step 1 of
 * the form arrives with it already ticked.
 */
export function ServicePage({ service }: { service: Service }) {
  const index = serviceIndex(service.slug);
  const others = services.filter((s) => s.slug !== service.slug);
  return (
    <main id="main" className="relative">
      <RosterMount />
      <ActiveColumn index={index} />

      <section className="bg-paper" aria-labelledby="service-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">{service.name}</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">{rosterStatusText.columns}</p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-14">
            <div>
              <h1 id="service-title" className="display text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
                {service.removes}
              </h1>
              <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive md:text-[1.125rem]">{service.lead}</p>
              <div className="mt-9">
                <Button href={`/become-a-client?service=${service.slug}`}>Become a client</Button>
                <p className="data mt-3 text-olive">Step 1 of the form will already have {service.name.toLowerCase()} ticked.</p>
              </div>
            </div>
            <div>
              <RosterSlot state="columns" tone="paper" className="h-[140px] lg:h-[320px]">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-olive" />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-olive" />
              </RosterSlot>
              <p className="data mt-2 text-olive">
                {service.name} among the seven service lines. Lanes are not headcounts.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Register id="what-we-run" title="What we run" note={`${service.lines.length} lines of work`}>
        <ol className="max-w-[42rem] border-t border-olive">
          {service.lines.map((l) => (
            <li key={l.name} className="grid gap-1 border-b border-olive py-5 md:grid-cols-[14rem_1fr] md:gap-8">
              <h2 className="text-[1.0625rem] font-medium">{l.name}</h2>
              <p className="text-[15px] leading-relaxed">{l.does}</p>
            </li>
          ))}
        </ol>
      </Register>

      <section className="on-ink bg-ink text-paper" aria-labelledby="service-close">
        <Container className="py-16 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10 lg:py-20">
          <div className="hidden lg:block" />
          <div>
            <h2 id="service-close" className="display max-w-[16ch] text-[1.75rem] md:text-[2.25rem]">
              Hand us {service.name.toLowerCase()}.
            </h2>
            <p className="mt-5 max-w-[34em] text-[1.0625rem]">
              Tell us how many people are involved. {process.responsePromise}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Button href={`/become-a-client?service=${service.slug}`}>Become a client</Button>
              <p className="data flex gap-5 text-ink-light">
                <a href={company.whatsappHref} rel="noopener" target="_blank" className="text-paper underline underline-offset-4">
                  WhatsApp us
                </a>
                <a href={company.phoneHref} className="text-paper underline underline-offset-4">
                  Call {company.phone}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Register id="other-services" title="The other six" note="Same firm, same people">
        <ul className="max-w-[42rem] border-t border-olive">
          {others.map((s) => (
            <li key={s.slug} className="border-b border-olive">
              <Link href={`/services/${s.slug}`} className="block py-4 hover:text-signal-deep">
                <span className="block text-[1.0625rem] font-medium">{s.name}</span>
                <span className="data block text-olive">{s.removes}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Register>
    </main>
  );
}
