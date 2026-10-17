import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { PartnerCta } from "@/components/ui/partner-cta";
import { Container } from "@/components/layout/container";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { headline } from "@/content/facts";
import { HomeMotion } from "./home-motion";

/**
 * Hero. The copy sits left; the Roster drifts in the slot on the right (below the copy on phones). One headline
 * that says what TDL does, one line naming the services, coverage and "since 2000", the primary action
 * ("Partner with us", opening WhatsApp, with "Prefer a form?" beside it) and one plain link. The headline is painted in --ink-light and settles
 * to --paper after hydration (see headline-reveal.tsx); the --ink-light class here is that starting state.
 */
export function Hero() {
  return (
    <section className="on-ink relative bg-ink text-paper" aria-labelledby="hero-headline">
      <Container className="grid gap-10 pb-10 pt-16 md:pt-20 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-14 lg:pb-14 lg:pt-28">
        <div className="relative z-10">
          {/* One sentence per line, so "HR." is never split from its own sentence. Each line may still wrap. */}
          <h1
            id="hero-headline"
            className="display text-[2.5rem] text-ink-light md:text-[3.25rem] lg:text-[3.875rem]"
          >
            {headline.default.split(/(?<=\.)\s+/).map((sentence, i) => (
              // The space keeps the heading's text "…HR. You…" for screen readers and search; between two block
              // spans it is collapsed and never displayed.
              <Fragment key={sentence}>
                {i > 0 ? " " : null}
                <span className="block">{sentence}</span>
              </Fragment>
            ))}
          </h1>
          <p className="mt-6 max-w-[34em] text-[1.0625rem] md:text-[1.1875rem]">{headline.sub}</p>
          <PartnerCta location="hero" className="mt-9" />
          <Button variant="link" href="/services" className="mt-6">
            See the services
          </Button>
        </div>
        <RosterSlot state="drift" tone="ink" className="h-[200px] lg:h-auto lg:min-h-[420px]" />
      </Container>
      <Container className="pb-8">
        <p className="data max-w-[60ch] text-ink-light">
          <span>{rosterStatusText.drift}. </span>
          Each mark is one managed employee.
        </p>
      </Container>
      <HomeMotion />
    </section>
  );
}
