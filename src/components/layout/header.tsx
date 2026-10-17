"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { PartnerCta } from "@/components/ui/partner-cta";
import { company } from "@/content/facts";
import { Container } from "./container";
import { Logo } from "./logo";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/about-us", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

/**
 * The instrument strip. Sticky on every route. Carries TDL's full logo, the navigation, the staff login and the
 * one primary action.
 *
 * No status line since 2026-10-17 (TDL review): its length changed with every Roster state, so the nav shifted
 * sideways and wrapped. Each section's caption already states what the Roster shows, in the same words.
 *
 * Light, since 2026-10-16: TDL asked for their full logo in colour, unaltered, and its olive wordmark fails on
 * navy (2.5:1). This reverses "header always navy" (DESIGN-DECISIONS.md, 2026-09-18) at the client's request.
 * The primary button inverts to its ink-filled form automatically, because the header does not carry `.on-ink`.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <header className="sticky top-0 z-40 border-b border-olive/25 bg-paper text-ink">
      <Container className="flex h-[4.5rem] items-center justify-between gap-6 md:h-[5.25rem]">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-6 text-[15px] lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="underline-offset-4 hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <PortalLink className="text-[15px]" />
          {/* No "Prefer a form?" here: the strip has no room, and every page body offers it beside its own button. */}
          <PartnerCta location="header" showFormLink={false} />
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center rounded-[2px] border border-olive px-3 text-[15px] lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </Container>

      {/* Capped to the screen and scrollable, so on a short phone the last item is never out of reach. */}
      <div id={panelId} hidden={!open} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-olive/25 lg:hidden">
        <Container className="flex flex-col gap-1 py-4">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="py-2.5 text-[17px]" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3">
            <PartnerCta location="menu" fullWidth />
            <PortalLink className="py-1 text-[15px]" />
            <a href={company.phoneHref} className="data text-olive">
              Call {company.phone}
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}

/** Secondary to the main action: a plain underlined link, never a button. Opens in a new tab. */
function PortalLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={company.staffPortal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline underline-offset-4 decoration-olive/60 hover:decoration-ink ${className}`}
    >
      {company.staffPortal.headerLabel}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
