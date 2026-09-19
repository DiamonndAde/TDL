"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { subscribeRoster } from "@/components/roster/events";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { figures } from "@/content/facts";
import { useMotionPreference } from "@/lib/motion-preference";

/**
 * Proof bar. The HTML carries the final values — that is what a crawler, a no-JS visitor, a reduced-motion
 * visitor and anyone who never scrolls here sees. The count-up is an enhancement layered on top: it arms only
 * when the figures enter the viewport, runs once from 0 on a 1.4 s clock, and is pulled ahead by the Roster's
 * own arrival progress if the marks are landing faster. The figures are cyan because they are live data.
 */
const RAMP_MS = 1400;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function Proof() {
  const { reduced } = useMotionPreference();
  const [fraction, setFraction] = useState(1);
  const ref = useRef<HTMLDListElement>(null);

  useEffect(() => {
    if (reduced) return; // final values, no count
    const el = ref.current;
    if (!el) return;
    let armedAt: number | null = null;
    let rosterProgress = 0;
    let raf = 0;
    let done = false;

    const tick = (now: number) => {
      raf = 0;
      if (done || armedAt === null) return;
      const clock = smooth(Math.min(1, (now - armedAt) / RAMP_MS));
      const f = Math.max(clock, rosterProgress);
      setFraction(f);
      if (f >= 1) done = true;
      else raf = requestAnimationFrame(tick);
    };
    const unsubscribe = subscribeRoster((fr) => {
      if (fr.to === "grid" && fr.from === "drift") rosterProgress = fr.progress;
      else if (fr.from !== "drift") rosterProgress = 1;
    });
    const io = new IntersectionObserver(
      (entries) => {
        if (armedAt === null && entries.some((e) => e.isIntersecting)) {
          armedAt = performance.now();
          setFraction(0);
          raf = requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const count = (value: number) => Math.round(value * fraction).toLocaleString("en-NG");

  return (
    <section className="on-ink border-t border-ink-light/40 bg-ink text-paper" aria-label="Scale and standing">
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-14 lg:py-12">
        <dl ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-8">
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
