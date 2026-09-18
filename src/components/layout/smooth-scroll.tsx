"use client";

import { useEffect } from "react";
import { useMotionPreference } from "@/lib/motion-preference";
import { setLenis } from "@/lib/lenis";

/**
 * Mounts Lenis unless the visitor prefers reduced motion. Lenis is imported lazily so it costs nothing on
 * routes that never scroll far (legal pages). Touch stays native (Lenis default), so mobile is unaffected.
 */
export function SmoothScroll() {
  const { reduced } = useMotionPreference();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let instance: import("lenis").default | null = null;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({ autoRaf: true, lerp: 0.12 });
      setLenis(instance);
    });
    return () => {
      cancelled = true;
      instance?.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
