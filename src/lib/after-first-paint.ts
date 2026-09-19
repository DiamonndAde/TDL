"use client";

import { useEffect, useState } from "react";

/**
 * True once the browser has painted a frame after hydration AND gone idle. Used to mount anything decorative
 * (the Roster, the headline reveal) so its chunk and its first work never land ahead of the first paint.
 * Measured 2026-09-19: idle callbacks alone fired before first paint and cost ~60 ms of FCP unthrottled.
 */
export function useAfterFirstPaint(idleTimeout = 2000) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let raf1 = 0, raf2 = 0, idle = 0, timer = 0;
    const onIdle = () => setReady(true);
    // Two frames: the first rAF runs before the next paint, the second after it.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(onIdle, { timeout: idleTimeout });
        else timer = window.setTimeout(onIdle, 200);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [idleTimeout]);
  return ready;
}
