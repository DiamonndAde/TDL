"use client";

import { useEffect, useRef, useState } from "react";
import { analyticsConfigured } from "@/lib/analytics/config";
import { denyConsent, grantConsent, useShouldAskConsent } from "@/lib/analytics/consent";
import { useAfterFirstPaint } from "@/lib/after-first-paint";
import { Container } from "./container";

/**
 * The analytics consent choice. The site's first and only non-essential script sits behind it (brief §10).
 *
 * Rules this implements, from the approval conditions:
 *  - **Accept and Reject carry equal weight**: same element, same size, same border, same type. Neither is a
 *    faint link and neither is hidden behind a settings screen. Declining is one press, exactly like accepting.
 *  - **No layout shift**: the bar is `position: fixed`, so it is out of flow and shifts nothing. It also mounts
 *    only after the first paint, so it cannot be the LCP element — by then the largest contentful paint has
 *    already happened. Both are measured, not assumed (`scripts/consent-proof.py`).
 *  - **Keyboard and screen reader**: a labelled region early in the DOM, so Tab reaches it right after the skip
 *    link. Focus is never moved or trapped — an automatic focus jump would interrupt someone mid-sentence —
 *    and an `aria-live` announcement tells a screen reader it has appeared.
 *
 * Renders nothing at all when no project key is configured, which is every environment until TDL approves
 * Q30: no banner, no SDK, no request.
 */
export function ConsentBanner() {
  const asking = useShouldAskConsent();
  const painted = useAfterFirstPaint();
  const [announced, setAnnounced] = useState(false);
  const regionRef = useRef<HTMLElement>(null);

  // Announce once, a beat after it appears, so the live region is registered before its content changes.
  useEffect(() => {
    if (asking && painted && !announced) {
      const t = window.setTimeout(() => setAnnounced(true), 120);
      return () => window.clearTimeout(t);
    }
  }, [asking, painted, announced]);

  if (!analyticsConfigured || !asking || !painted) return null;

  return (
    <section
      ref={regionRef}
      aria-labelledby="consent-title"
      className="on-ink fixed inset-x-0 bottom-0 z-40 border-t border-ink-light/40 bg-ink text-paper"
    >
      <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-[52em]">
          <h2 id="consent-title" className="text-[15px] font-medium">
            Help us improve this site?
          </h2>
          <p className="data mt-1.5 text-ink-light">
            We would like to measure how people use our careers and enquiry pages, so we can make them easier to
            complete. We never record what you type into a form. See our{" "}
            <a href="/cookies-policy" className="text-paper underline underline-offset-4">
              cookies policy
            </a>
            .
          </p>
        </div>
        {/* Equal prominence, not merely equal size: the two buttons are visually identical apart from the word
            on them. A filled Accept beside an outlined Reject measures the same and still reads as a
            recommendation, which is the nudge this is meant to avoid. */}
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={grantConsent} className="border border-paper bg-transparent px-5 py-2.5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-paper hover:text-ink">
            Accept
          </button>
          <button type="button" onClick={denyConsent} className="border border-paper bg-transparent px-5 py-2.5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-paper hover:text-ink">
            Reject
          </button>
        </div>
      </Container>
      <p aria-live="polite" className="sr-only">
        {announced ? "A choice about website analytics is available at the end of the page." : ""}
      </p>
    </section>
  );
}
