"use client";

import dynamic from "next/dynamic";
import { useAfterFirstPaint } from "@/lib/after-first-paint";

/**
 * The Roster ships as its own chunk and mounts after the first frame has painted and the browser is idle, so it
 * is never part of first-load JS, never reaches routes that don't render this component, and never competes
 * with the first paint. `ssr: false` because it is canvas-only.
 */
const Roster = dynamic(() => import("./roster").then((m) => m.Roster), { ssr: false });

export function RosterMount() {
  const go = useAfterFirstPaint();
  return go ? <Roster /> : null;
}
