"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Register } from "@/components/layout/register";
import { testimonials } from "@/content/testimonials";

/**
 * Testimonials. The attribution list is the control: three named executives as a tablist, one quote shown large
 * in the voice setting. The proof — who said it, at which company, with their face — is the interface. Arrow keys move between
 * tabs (automatic activation); "Read the full quote" expands the whole testimonial. Quotes are verbatim,
 * including the original typos, until Q22 permits corrections.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const t = testimonials[index];

  const select = (i: number) => {
    setIndex(i);
    setFull(false);
    tabs.current[i]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = testimonials.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % n); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + n) % n); }
    else if (e.key === "Home") { e.preventDefault(); select(0); }
    else if (e.key === "End") { e.preventDefault(); select(n - 1); }
  };

  return (
    <Register id="testimonials" title="In their words" note="Three clients, quoted">
      <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${index}`}
          className="min-w-0"
        >
          <blockquote className="voice max-w-[28em] text-[1.5rem] md:text-[1.875rem]">
            <p>&ldquo;{t.pull}&rdquo;</p>
          </blockquote>
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: full ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="max-w-[60ch] space-y-4 pt-6 text-[15px] leading-relaxed text-olive">
                {t.full.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-expanded={full}
            onClick={() => setFull((v) => !v)}
            className="mt-6 text-[15px] text-signal-deep underline underline-offset-4"
          >
            {full ? "Hide the full quote" : "Read the full quote"}
          </button>
        </div>

        <div role="tablist" aria-label="Who is speaking" aria-orientation="vertical" className="border-t border-olive lg:order-first lg:border-t-0">
          {testimonials.map((item, i) => {
            const selected = i === index;
            return (
              <button
                key={item.id}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`flex w-full items-start gap-4 border-b border-olive py-4 text-left transition-colors duration-150 ${
                  selected ? "text-ink" : "text-olive hover:text-ink"
                }`}
              >
                {/* Portrait: a real headshot of the executive, 88 px. Reserved until Q26 — never filled with a stand-in. */}
                <span
                  className={`flex h-[88px] w-[88px] shrink-0 items-center justify-center border border-olive ${selected ? "" : "opacity-70"}`}
                  data-todo="Q26"
                >
                  {item.portrait ? (
                    <Image src={item.portrait.src} alt={`${item.person}, ${item.role}, ${item.company}`} width={item.portrait.width} height={item.portrait.height} className="h-full w-full object-cover" />
                  ) : (
                    <span className="data px-2 text-center text-olive">Portrait to come</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium">{item.person}</span>
                  <span className="data block">{item.role}</span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <Image src={item.logo.src} alt="" width={item.logo.width} height={item.logo.height} className={`h-6 w-10 object-contain object-left mix-blend-multiply ${selected ? "" : "grayscale"}`} />
                    <span className="data">{item.company}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Register>
  );
}
