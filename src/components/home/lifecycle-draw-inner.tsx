"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pathD, pathStops } from "@/components/roster/layouts";
import { onLenis } from "@/lib/lenis";
import { useMotionPreference } from "@/lib/motion-preference";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger);

/**
 * Scrubs the lifecycle line with scroll: it draws as the section arrives, in step with the marks flowing onto
 * the path. Under reduced motion the server-rendered line simply stays fully drawn. Lenis drives the window
 * scroll natively, so ScrollTrigger only needs its update hooked to Lenis's scroll event.
 */
export function LifecycleDrawInner({ pathId }: { pathId: string }) {
  const { reduced, ready } = useMotionPreference();

  useGSAP(
    () => {
      if (!ready) return;
      const path = document.getElementById(pathId);
      const svg = path?.closest("svg");
      const slot = path?.closest<HTMLElement>("[data-roster-slot]");
      if (!path || !svg || !slot) return;

      // Re-fit the server-rendered 1000×300 line to the slot's real size so the stroke is uniform and DrawSVG
      // can measure it. Stops are fractional, so the marker positions don't change.
      const fit = () => {
        const w = slot.clientWidth, h = slot.clientHeight;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        path.removeAttribute("vector-effect");
        path.setAttribute("d", pathD(pathStops({ x: 0, y: 0, w, h })));
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(slot);
      if (reduced) return () => ro.disconnect();
      const off = onLenis((l) => {
        if (l) l.on("scroll", ScrollTrigger.update);
      });
      const tween = gsap.fromTo(
        path,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: { trigger: path.closest("[data-roster-slot]") ?? path, start: "top 88%", end: "top 30%", scrub: true },
        },
      );
      return () => {
        ro.disconnect();
        off();
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(path, { drawSVG: "100%" });
      };
    },
    { dependencies: [ready, reduced, pathId] },
  );

  return null;
}
