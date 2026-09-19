"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// GSAP + DrawSVG + ScrollTrigger load as their own chunk, only once the lifecycle section is within 1.5 viewports.
const Inner = dynamic(() => import("./lifecycle-draw-inner").then((m) => m.LifecycleDrawInner), { ssr: false });

export function LifecycleDraw({ pathId }: { pathId: string }) {
  const [near, setNear] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <span ref={ref} aria-hidden="true" />
      {near ? <Inner pathId={pathId} /> : null}
    </>
  );
}
