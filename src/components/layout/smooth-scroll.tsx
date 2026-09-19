"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMotionPreference } from "@/lib/motion-preference";
import { getLenis, setLenis } from "@/lib/lenis";

/**
 * Mounts Lenis unless the visitor prefers reduced motion. Lenis is imported lazily so it costs nothing on
 * routes that never scroll far (legal pages). Touch stays native (Lenis default), so mobile is unaffected.
 *
 * On every client-side navigation Lenis is told to re-measure the document. Its own ResizeObserver watches
 * documentElement, which only reports growth when <html> is not height-constrained (see layout.tsx); this is
 * the belt to that brace, because a stale limit traps scrolling on the longer page.
 */
export function SmoothScroll() {
  const { reduced } = useMotionPreference();
  const pathname = usePathname();

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

  useEffect(() => {
    const l = getLenis();
    if (!l) return;
    // The new page's DOM is in place by the time the pathname effect runs; measure now and once more after
    // fonts and lazy content have settled.
    l.resize();
    const t = window.setTimeout(() => getLenis()?.resize(), 600);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
