import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { headline } from "@/content/facts";
import { HomeMotion } from "./home-motion";

/**
 * Hero. The copy sits left; the Roster drifts in the slot on the right (below the copy on phones). One headline,
 * one line under it, one primary action and one plain link. The headline is painted in --ink-light and settles
 * to --paper after hydration (see headline-reveal.tsx); the --ink-light class here is that starting state.
 */
export function Hero() {
  return (
    <section className="on-ink relative bg-ink text-paper" aria-labelledby="hero-headline">
      <Container className="grid gap-10 pb-10 pt-16 md:pt-20 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-14 lg:pb-14 lg:pt-28">
        <div className="relative z-10">
          <h1
            id="hero-headline"
            className="display max-w-[15ch] text-[2.5rem] text-ink-light md:text-[3.25rem] lg:text-[3.875rem]"
          >
            {headline.default}
          </h1>
          <p className="mt-6 max-w-[34em] text-[1.0625rem] md:text-[1.1875rem]">{headline.sub}</p>
          <div className="mt-9 flex items-center gap-6">
            <Button href="/become-a-client">Become a client</Button>
            <Button variant="link" href="/services">
              See the services
            </Button>
          </div>
        </div>
        <RosterSlot state="drift" tone="ink" className="h-[200px] lg:h-auto lg:min-h-[420px]" />
      </Container>
      <Container className="pb-8">
        <p className="data max-w-[60ch] text-ink-light">
          <span className="lg:hidden">{rosterStatusText.drift}. </span>
          Each mark is one managed employee.
        </p>
      </Container>
      <HomeMotion />
    </section>
  );
}
