/**
 * Frame-level readout from the Roster for anything that needs to follow it: the proof-bar counters read the
 * arrival progress into the grid state; the dev harness reads the stats. Plain subscription, no React state
 * per frame.
 */
import type { RosterState } from "./states";

export interface RosterFrame {
  /** The state being left and the state being approached. Equal when settled. */
  from: RosterState;
  to: RosterState;
  /** 0..1 progress from `from` to `to` (already quantised under reduced motion). */
  progress: number;
  /** Diagnostics for the harness. */
  stats: { n: number; workMs: number; fps: number; snapped: boolean; mode: "continuous" | "static" };
}

type Listener = (f: RosterFrame) => void;
const listeners = new Set<Listener>();

export function subscribeRoster(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitRoster(f: RosterFrame) {
  listeners.forEach((fn) => fn(f));
}
