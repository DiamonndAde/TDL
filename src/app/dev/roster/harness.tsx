"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { subscribeRoster, type RosterFrame } from "@/components/roster/events";
import { RosterMount } from "@/components/roster/roster-mount";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStates, rosterStatusText, type RosterState } from "@/components/roster/states";
import { useRoster } from "@/components/roster/roster-context";
import { getLenis } from "@/lib/lenis";
import { useMotionPreference } from "@/lib/motion-preference";

gsap.registerPlugin(useGSAP, SplitText);

const tones: Record<RosterState, "ink" | "paper"> = {
  drift: "ink",
  grid: "ink",
  map: "paper",
  columns: "paper",
  path: "paper",
  mark: "ink",
};

/**
 * Milestone-3 harness: the Roster in isolation, with every state reachable by a button, a fling test, and
 * the frame readout. Also the first `useGSAP` under the React Compiler (the title SplitText).
 */
export function Harness() {
  const [frame, setFrame] = useState<RosterFrame | null>(null);
  const { setActiveColumn, activeColumn } = useRoster();
  const { reduced } = useMotionPreference();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let pending: RosterFrame | null = null;
    let raf = 0;
    return subscribeRoster((f) => {
      pending = f;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (pending) setFrame(pending);
        });
    });
  }, []);

  // Text renders first (it is in the HTML); the split happens after mount, and not at all under reduced motion.
  useGSAP(
    () => {
      if (reduced || !titleRef.current) return;
      const split = SplitText.create(titleRef.current, { type: "lines", linesClass: "overflow-hidden" });
      gsap.from(split.lines, { yPercent: 110, duration: 0.7, ease: "power3.out", stagger: 0.08 });
      return () => split.revert();
    },
    { scope: titleRef, dependencies: [reduced] },
  );

  const jump = (state: RosterState, smooth: boolean) => {
    const el = document.querySelector<HTMLElement>(`[data-roster-slot="${state}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.25;
    const lenis = getLenis();
    if (smooth && lenis) lenis.scrollTo(top, { duration: 0.6 });
    else window.scrollTo({ top, behavior: "instant" });
  };

  return (
    <main id="main" className="relative">
      <RosterMount />

      <div className="on-ink bg-ink text-paper">
        <div className="mx-auto max-w-[80rem] px-4 py-10 md:px-10">
          <h1 ref={titleRef} className="display max-w-[16ch] text-[2.5rem] md:text-[3.5rem]">
            Roster harness. Six states, one population.
          </h1>
          <p className="mt-4 max-w-[60ch] text-ink-light">
            Jump between states, fling to the end, and watch the frame readout. Reduced motion:{" "}
            {String(reduced)}.
          </p>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-olive/40 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex flex-wrap items-center gap-2 px-4 py-2 md:px-10">
          {rosterStates.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => jump(s, !e.shiftKey)}
              className="rounded-[2px] border border-olive px-2.5 py-1 text-[13px] hover:bg-ink hover:text-paper"
              title="Click: smooth (Lenis). Shift-click: instant jump (scrollbar drag)."
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const lenis = getLenis();
              const max = document.documentElement.scrollHeight - window.innerHeight;
              if (lenis) lenis.scrollTo(max, { duration: 0.5 });
              else window.scrollTo({ top: max, behavior: "instant" });
            }}
            className="rounded-[2px] bg-ink px-2.5 py-1 text-[13px] text-paper"
          >
            Fling to end
          </button>
          <label className="data ml-2 flex items-center gap-1.5">
            column
            <select
              value={activeColumn ?? ""}
              onChange={(e) => setActiveColumn(e.target.value === "" ? null : Number(e.target.value))}
              className="rounded-[2px] border border-olive bg-paper px-1"
            >
              <option value="">none</option>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <output className="data ml-auto whitespace-nowrap text-olive" aria-live="off">
            {frame
              ? `${frame.from}→${frame.to} ${frame.progress.toFixed(2)} · n ${frame.stats.n} · work ${frame.stats.workMs}ms · ${frame.stats.fps}fps · ${frame.stats.mode}${frame.stats.snapped ? " · SNAP" : ""}`
              : "waiting for frames"}
          </output>
        </div>
      </div>

      {rosterStates.map((s) => (
        <section
          key={s}
          className={`${tones[s] === "ink" ? "on-ink bg-ink text-paper" : "bg-paper text-ink"} border-b border-olive/30`}
        >
          <div className="mx-auto grid max-w-[80rem] gap-8 px-4 py-24 md:px-10 lg:grid-cols-[12.5rem_1fr]">
            <div>
              <h2 className="text-[15px] font-medium">{s}</h2>
              <p className={`data mt-1.5 ${tones[s] === "ink" ? "text-ink-light" : "text-olive"}`}>{rosterStatusText[s]}</p>
            </div>
            <RosterSlot state={s} tone={tones[s]} className={s === "grid" ? "h-[180px]" : "h-[440px]"} />
          </div>
        </section>
      ))}

      <div className="bg-paper py-[60vh] text-center text-olive">
        <p className="data">End of harness. Marks should be idle here and the loop paused.</p>
      </div>
    </main>
  );
}
