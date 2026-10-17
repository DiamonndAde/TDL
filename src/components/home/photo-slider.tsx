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
  /** Registry key, rendered as data-placeholder so the guard test can find stand-in imagery in a build. */
  placeholder?: string;
}

const SLIDE_MS = 6000;
const SWIPE_PX = 40;

/**
 * The home slider (TDL review, 2026-10-16 item 8; redesigned 2026-10-17). A wide, short band — 21:9 from `sm`,
 * 4:3 on phones — whose photographs crossfade. Auto-advance is a CLIENT EXCEPTION to the rule that nothing outside
 * the Roster moves on its own (AGENTS.md, The one motion idea), bounded:
 *  - 6 s per photograph, only after first paint, while half on screen and while the tab is visible;
 *  - a visible pause control over the image, and it pauses while the pointer is over it or focus is inside it;
 *  - never under prefers-reduced-motion: no timer, no pause control, and the global reduced-motion CSS makes
 *    the crossfade instant.
 * The timer IS the active indicator's fill animation: the slide advances on its `animationend`, and pausing sets
 * `animation-play-state: paused`, so a pause resumes where it stopped instead of restarting the six seconds.
 *
 * Controls: progress bars under the image (each a button), a pause/play icon at the image's bottom right,
 * previous/next arrows that appear on hover or keyboard focus from `sm`, arrow keys anywhere inside, and swipe on
 * touch. The frame carries `data-roster-avoid`, so the Roster's marks fade out over the photographs rather than
 * crossing them (roster.tsx).
 *
 * Images load as they are needed — the first, then each one just before it is shown — not all five at once.
 * The frame reserves its aspect on the server, so nothing shifts when this hydrates.
 */
export function PhotoSlider({ slides, label }: { slides: Slide[]; label: string }) {
  const region = useRef<HTMLDivElement>(null);
  const painted = useAfterFirstPaint();
  const { reduced, ready } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set([0, 1]));
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Pressing Play while the pointer or focus is on the control must start it, not leave it held by the hover or
  // focus that pressing it implies. Cleared as soon as both leave.
  const [override, setOverride] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const touchX = useRef<number | null>(null);

  const count = slides.length;
  const auto = ready && !reduced && count > 1;
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
    const n = (i + count) % count;
    setIndex(n);
    // Load the one after next as well, so it is decoded before its turn.
    setLoaded((prev) => (prev.has(n) && prev.has((n + 1) % count) ? prev : new Set([...prev, n, (n + 1) % count])));
  }

  const iconButton =
    "flex h-10 w-10 items-center justify-center rounded-[2px] bg-ink text-paper hover:bg-ink/85 focus-visible:outline-offset-2";

  return (
    <div
      ref={region}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="group"
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
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
      }}
    >
      <div
        data-roster-avoid=""
        className="relative aspect-[4/3] touch-pan-y overflow-hidden border border-olive bg-paper sm:aspect-[21/9]"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") touchX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null) return;
          const dx = e.clientX - start;
          if (Math.abs(dx) >= SWIPE_PX) goTo(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          touchX.current = null;
        }}
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            data-placeholder={s.placeholder}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            {loaded.has(i) ? (
              <Image
                src={s.src}
                alt={s.alt}
                width={s.width}
                height={s.height}
                className="h-full w-full object-cover"
                style={{ objectPosition: s.position ?? "50% 50%" }}
                sizes="(min-width: 80rem) 66rem, (min-width: 64rem) 75vw, 100vw"
              />
            ) : null}
          </div>
        ))}

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photograph"
              onClick={() => goTo(index - 1)}
              className={`${iconButton} absolute left-3 top-1/2 hidden -translate-y-1/2 opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100 sm:flex`}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next photograph"
              onClick={() => goTo(index + 1)}
              className={`${iconButton} absolute right-3 top-1/2 hidden -translate-y-1/2 opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100 sm:flex`}
            >
              <Chevron dir="right" />
            </button>
          </>
        ) : null}

        {/* Rendered only where the slider moves on its own. Absolutely placed, so its arrival moves nothing. */}
        {auto ? (
          <button
            type="button"
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => {
              setUserPaused(!userPaused);
              setOverride(userPaused);
            }}
            className={`${iconButton} absolute bottom-3 right-3`}
          >
            {userPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-3 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Show photograph ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className="flex h-6 w-10 items-center sm:w-14"
            >
              <span className="relative block h-[3px] w-full overflow-hidden bg-olive/30">
                {i === index ? (
                  auto ? (
                    <span
                      key={`${index}-${i}`}
                      className="slider-fill absolute inset-0 origin-left bg-ink"
                      style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                      onAnimationEnd={() => goTo(index + 1)}
                    />
                  ) : (
                    <span className="absolute inset-0 bg-ink" />
                  )
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Announced only while it is not rotating on its own (APG carousel). */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Photograph {index + 1} of {count}
      </p>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <rect x="2.5" y="2" width="3" height="10" />
      <rect x="8.5" y="2" width="3" height="10" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <path d="M3.5 2v10l8-5z" />
    </svg>
  );
}
