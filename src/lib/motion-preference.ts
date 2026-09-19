"use client";

import { useSyncExternalStore } from "react";

/**
 * The reduced-motion branch is a first-class path (AGENTS.md). Everything non-user-triggered — canvas drift,
 * counters, the SplitText reveal, smooth scroll — asks this before it starts.
 *
 * `reduced` = prefers-reduced-motion. `saveData` = the Save-Data client hint; the Roster serves static states.
 * On the server and before hydration both are `true` so nothing animates until the client has confirmed it may.
 */
export interface MotionPreference {
  reduced: boolean;
  saveData: boolean;
  /** False for the server snapshot and during hydration; effects that must not run twice wait for it. */
  ready: boolean;
}

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function read(): MotionPreference {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    reduced: window.matchMedia(QUERY).matches,
    saveData: nav.connection?.saveData === true,
    ready: true,
  };
}

// Stable snapshots so useSyncExternalStore doesn't loop on a fresh object each call.
let last: MotionPreference | null = null;
function snapshot(): MotionPreference {
  const next = read();
  if (last && last.reduced === next.reduced && last.saveData === next.saveData) return last;
  last = next;
  return next;
}
const SERVER: MotionPreference = { reduced: true, saveData: true, ready: false };
const serverSnapshot = () => SERVER;

export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
