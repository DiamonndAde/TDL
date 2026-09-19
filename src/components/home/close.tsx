import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { company, process } from "@/content/facts";

/**
 * Close. Aimed at the buyer. The Roster condenses into the TDL mark beside one action, with WhatsApp and the
 * direct line as first-class alternatives — a Nigerian enterprise buyer often reaches for WhatsApp before a form.
 * Careers has its own entry point in the nav and footer, not here.
 */
export function Close() {
  return (
    <section id="close" className="on-ink bg-ink text-paper" aria-labelledby="close-title">
      <Container className="grid gap-10 py-20 lg:grid-cols-[minmax(0,32rem)_1fr] lg:gap-14 lg:py-28">
        <div>
          <h2 id="close-title" className="display max-w-[14ch] text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem]">
            Hand us the operation.
          </h2>
          <p className="mt-6 max-w-[34em] text-[1.0625rem] md:text-[1.125rem]">
            Tell us which services you need and how many people are involved. {process.responsePromise}
          </p>
          <div className="mt-9">
            <Button href="/become-a-client">Become a client</Button>
          </div>
          <p className="data mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink-light">
            <a href={company.whatsappHref} rel="noopener" target="_blank" className="text-paper underline underline-offset-4">
              WhatsApp us
            </a>
            <a href={company.phoneHref} className="text-paper underline underline-offset-4">
              Call {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="text-paper underline underline-offset-4">
              {company.email}
            </a>
          </p>
        </div>
        <div>
          <RosterSlot state="mark" tone="ink" className="h-[260px] lg:h-[360px]" />
          <p className="data mt-3 text-ink-light lg:hidden">{rosterStatusText.mark}</p>
        </div>
      </Container>
    </section>
  );
}
