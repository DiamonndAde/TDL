"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { RosterMount } from "@/components/roster/roster-mount";

/**
 * Everything on the home route that needs GSAP or the canvas loads here, after hydration and after the browser
 * is idle, as separate chunks. Nothing in this file is part of first-load JS, and none of it competes with the
 * font and CSS fetches that the LCP paint waits on (measured: the GSAP chunk starting at hydration cost LCP on
 * simulated 4G).
 */
const HeadlineReveal = dynamic(() => import("./headline-reveal").then((m) => m.HeadlineReveal), { ssr: false });

export function useIdle(timeout = 2000, fallbackMs = 300) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const start = () => setIdle(true);
    if (typeof window.requestIdleCallback === "function") {
      const h = window.requestIdleCallback(start, { timeout });
      return () => window.cancelIdleCallback(h);
    }
    const t = window.setTimeout(start, fallbackMs);
    return () => window.clearTimeout(t);
  }, [timeout, fallbackMs]);
  return idle;
}

export function HomeMotion() {
  const idle = useIdle();
  return (
    <>
      <RosterMount />
      {idle ? <HeadlineReveal targetId="hero-headline" /> : null}
    </>
  );
}
