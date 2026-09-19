"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useMotionPreference } from "@/lib/motion-preference";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * The one text animation on the site, and it must not delay LCP. The headline is server-rendered and painted at
 * first paint in `--ink-light`; this settles it to `--paper` line by line after hydration.
 *
 * The LCP element's DOM is never touched. Lighthouse showed that splitting the h1 itself (and SplitText's
 * revert re-inserting its text) registers a new LCP candidate after hydration: 3.5 s of render delay on
 * simulated 4G. So the split happens on an aria-hidden clone laid exactly over the h1; the clone's lines fade
 * from transparent to paper, then the original gets `color: paper` (a style change, not a DOM change) and the
 * clone is removed. If JS never arrives the headline stays ink-light (5.9:1, still AA). Under reduced motion the
 * colour is set at once.
 */
export function HeadlineReveal({ targetId }: { targetId: string }) {
  const { reduced, ready } = useMotionPreference();

  useGSAP(
    () => {
      if (!ready) return;
      const el = document.getElementById(targetId);
      if (!el || !el.parentElement) return;
      const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
      if (reduced) {
        el.style.color = paper;
        return;
      }

      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      Object.assign(clone.style, {
        position: "absolute",
        top: `${el.offsetTop}px`,
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
        margin: "0",
        color: paper,
        pointerEvents: "none",
      } satisfies Partial<CSSStyleDeclaration>);
      el.parentElement.appendChild(clone);

      const split = SplitText.create(clone, { type: "lines" });
      const tween = gsap.fromTo(
        split.lines,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          onComplete: () => {
            el.style.color = paper;
            clone.remove();
          },
        },
      );
      return () => {
        tween.kill();
        clone.remove();
        el.style.color = paper;
      };
    },
    { dependencies: [ready, reduced, targetId] },
  );

  return null;
}
