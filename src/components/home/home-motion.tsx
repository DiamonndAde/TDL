"use client";

import dynamic from "next/dynamic";
import { RosterMount } from "@/components/roster/roster-mount";
import { useAfterFirstPaint } from "@/lib/after-first-paint";

/**
 * Everything on the home route that needs GSAP or the canvas loads here — after the first paint and after the
 * browser is idle — as separate chunks. Nothing in this file is part of first-load JS, and none of it competes
 * with the first paint or the font and CSS fetches it waits on.
 */
const HeadlineReveal = dynamic(() => import("./headline-reveal").then((m) => m.HeadlineReveal), { ssr: false });

export function HomeMotion() {
  const ready = useAfterFirstPaint();
  return (
    <>
      <RosterMount />
      {ready ? <HeadlineReveal targetId="hero-headline" /> : null}
    </>
  );
}
