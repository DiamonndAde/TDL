"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import { subscribeRoster } from "@/components/roster/events";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { figures } from "@/content/facts";

/**
 * Proof bar. The two counting figures are a readout of the Roster: they show the share of marks that have
 * landed in the grid, so the number and the population arrive together. There is no separate counter tween.
 * Server-rendered with the final values (that is what a crawler, a no-JS visitor and a reduced-motion visitor
 * get); on the client they follow the drift → grid transition. Cyan because they are live data.
 */
export function Proof() {
  const [fraction, setFraction] = useState(1);

  useEffect(() => {
    let raf = 0;
    let pending = 1;
    return subscribeRoster((f) => {
      let next = 1;
      if (f.to === "drift") next = 0;
      else if (f.from === "drift" && f.to === "grid") next = f.progress;
      pending = next;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          setFraction(pending);
        });
    });
  }, []);

  const count = (value: number) => Math.round(value * fraction).toLocaleString("en-NG");

  return (
    <section className="on-ink border-t border-ink-light/40 bg-ink text-paper" aria-label="Scale and standing">
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-14 lg:py-12">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8">
          <Figure label={figures.staff.label} value={`${count(figures.staff.value)}+`} live />
          <Figure label={figures.clients.label} value={`${count(figures.clients.value)}+`} live />
          <Figure label={figures.operating.label} value={figures.operating.display} />
          <Figure label={figures.certified.label} value={figures.certified.display} />
        </dl>
        <div>
          <RosterSlot state="grid" tone="ink" className="h-[120px] lg:h-full lg:min-h-[150px]" />
          <p className="data mt-3 text-ink-light lg:hidden">{rosterStatusText.grid}</p>
        </div>
      </Container>
    </section>
  );
}

function Figure({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div>
      <dt className="data text-ink-light">{label}</dt>
      <dd className={`display mt-1.5 text-[1.75rem] md:text-[2rem] ${live ? "text-signal" : "text-paper"}`}>{value}</dd>
    </div>
  );
}
