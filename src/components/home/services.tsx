"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Register } from "@/components/layout/register";
import { useRoster } from "@/components/roster/roster-context";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { services } from "@/content/services";

/**
 * Services as seven rows, reframed around what each removes from the buyer's plate. Hover, focus or open a row
 * and its column in the Roster lifts. Rules between rows mean "this is a list of seven"; there are no numbers
 * and no icons. Keyboard: arrow keys move between rows, Enter/Space opens, Escape closes. On touch it is a
 * plain accordion. The expansion is a CSS grid-rows transition — user-triggered, so it is allowed motion.
 */
export function Services() {
  const { setActiveColumn } = useRoster();
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const activate = (i: number | null) => {
    setActiveColumn(i);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = services.length;
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") {
      setOpen(null);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      buttons.current[next]?.focus();
    }
  };

  return (
    <Register id="services" title="Services" note={rosterStatusText.columns}>
      <h3 className="display mb-8 max-w-[22ch] text-[1.75rem] md:text-[2rem]">Seven things we take off your desk.</h3>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-14">
        {/* Lanes, not bars: rules span all seven so equal heights read as layout, and the caption says it. Nobody
            has a headcount split by service line; inventing one is the thing the brief bans (Q26). */}
        <div className="order-first lg:order-last">
          <RosterSlot state="columns" tone="paper" className="h-[140px] lg:h-[420px]">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-olive" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-olive" />
          </RosterSlot>
          <p className="data mt-2 text-olive">Lanes group people by service line. They are not headcounts.</p>
        </div>
        <ul className="border-t border-olive" onMouseLeave={() => { setHover(null); activate(open); }}>
          {services.map((s, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li key={s.slug} className="border-b border-olive">
                <button
                  ref={(el) => { buttons.current[i] = el; }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={`flex w-full items-baseline justify-between gap-6 py-4 text-left text-[1.125rem] font-medium transition-colors duration-150 md:text-[1.25rem] ${
                    isOpen || hover === i ? "text-signal-deep" : "text-ink"
                  }`}
                  onClick={() => {
                    const next = isOpen ? null : i;
                    setOpen(next);
                    activate(next ?? hover);
                  }}
                  onMouseEnter={() => { setHover(i); activate(i); }}
                  onFocus={() => activate(i)}
                  onBlur={() => activate(open)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <span>{s.name}</span>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-[1.25rem] font-light leading-none text-olive transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-label={s.name}
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[38em] pb-2 text-[1.0625rem] leading-relaxed">{s.removes}</p>
                    <Link
                      href={`/services/${s.slug}`}
                      className="mb-5 inline-block text-[15px] text-signal-deep underline underline-offset-4"
                      tabIndex={isOpen ? 0 : -1}
                    >
                      Read about {s.name.toLowerCase()}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Register>
  );
}
