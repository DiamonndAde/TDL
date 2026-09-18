import type Lenis from "lenis";

/** Singleton handle so the Roster can hook ScrollTrigger.update to Lenis's scroll event without owning it. */
let current: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export function setLenis(l: Lenis | null) {
  current = l;
  listeners.forEach((fn) => fn(l));
}
export function getLenis() {
  return current;
}
export function onLenis(fn: (l: Lenis | null) => void) {
  listeners.add(fn);
  fn(current);
  return () => {
    listeners.delete(fn);
  };
}
