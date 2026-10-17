"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAfterFirstPaint } from "@/lib/after-first-paint";
import { useMotionPreference } from "@/lib/motion-preference";

export interface Slide {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position for the crop. */
  position?: string;
  /** Placeholder credit, e.g. "Photo: Ninthgrid, Pexels". Absent on TDL's own photographs. */
  credit?: string;
  /** Registry key, rendered as data-placeholder so the guard test can find stock in a build. */
  placeholder?: string;
}

const SLIDE_MS = 6000;

/**
 * The home slider (TDL review, 2026-10-16, item 8). Auto-advance is a CLIENT EXCEPTION to the rule that nothing
 * outside the Roster moves on its own (AGENTS.md, The one motion idea; DESIGN-DECISIONS.md 2026-10-17), bounded:
 *  - one slide every 6 s, and only after first paint, while on screen and while the tab is visible;
 *  - a visible Pause button, and it pauses while the pointer is over it or focus is inside it;
 *  - never under prefers-reduced-motion: no timer, no Pause button, Previous/Next jump without a tween.
 * Swipe is native CSS scroll-snap, so it costs no JavaScript and works before hydration. The server renders every
 * slide at a reserved aspect, so nothing shifts when this hydrates; images are lazy and well below the fold, so
 * LCP is untouched.
 */
export function PhotoSlider({ slides, label }: { slides: Slide[]; label: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const painted = useAfterFirstPaint();
  const { reduced, ready } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Pressing Play while the pointer or focus is on the button must start it, not leave it held by the hover or
  // focus that pressing it implies. Cleared as soon as both leave.
  const [override, setOverride] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const auto = ready && !reduced && slides.length > 1;
  const running = auto && painted && !userPaused && (override || (!hovered && !focused)) && onScreen && tabVisible;

  useEffect(() => {
    const el = region.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  function goTo(i: number) {
    const el = viewport.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  }

  // One timeout per slide; any move (timer, button or swipe) changes `index` and restarts the count.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => goTo(index + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  });

  function onScroll() {
    const el = viewport.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  const button = "min-h-11 border border-olive px-4 text-[15px] hover:bg-ink/5";

  return (
    <div
      ref={region}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        setHovered(false);
        if (!focused) setOverride(false);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setFocused(false);
        if (!hovered) setOverride(false);
      }}
    >
      <div
        ref={viewport}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Slides — use the arrow keys or the buttons below"
        aria-live={running ? "off" : "polite"}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border border-olive [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            data-placeholder={s.placeholder}
            className="relative aspect-[3/2] w-full shrink-0 snap-start md:aspect-video"
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              className="h-full w-full object-cover"
              style={{ objectPosition: s.position ?? "50% 50%" }}
              sizes="(min-width: 80rem) 60rem, 100vw"
            />
            {s.placeholder ? (
              <p className="data absolute left-3 top-3 bg-ink px-2.5 py-1.5 text-paper">Placeholder — TDL photography required</p>
            ) : null}
            {s.credit ? <p className="data absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-olive">{s.credit}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className={button} onClick={() => goTo(index - 1)}>
          Previous
        </button>
        <button type="button" className={button} onClick={() => goTo(index + 1)}>
          Next
        </button>
        <p className="data text-olive" aria-hidden="true">
          {index + 1} of {slides.length}
        </p>
        {/* Rendered only where the slider moves on its own; it sits last so its arrival moves nothing. */}
        {auto ? (
          <button
            type="button"
            className={`${button} ml-auto`}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => {
              setUserPaused(!userPaused);
              setOverride(userPaused);
            }}
          >
            {userPaused ? "Play" : "Pause"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
