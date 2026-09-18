"use client";

import dynamic from "next/dynamic";

/**
 * The Roster ships as its own chunk, loaded after hydration, so it is never part of first-load JS and never
 * reaches routes that don't render this component. `ssr: false` because it is canvas-only.
 */
const Roster = dynamic(() => import("./roster").then((m) => m.Roster), { ssr: false });

export function RosterMount() {
  return <Roster />;
}
