"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The Roster ships as its own chunk and mounts after the browser is idle post-hydration, so it is never part of
 * first-load JS, never reaches routes that don't render this component, and never competes with the LCP paint.
 * `ssr: false` because it is canvas-only.
 */
const Roster = dynamic(() => import("./roster").then((m) => m.Roster), { ssr: false });

export function RosterMount() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const start = () => setGo(true);
    if (typeof window.requestIdleCallback === "function") {
      const h = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(h);
    }
    const t = setTimeout(start, 300);
    return () => clearTimeout(t);
  }, []);
  return go ? <Roster /> : null;
}
