"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/facts";
import { useRosterOptional } from "@/components/roster/roster-context";
import { rosterStatusText } from "@/components/roster/states";
import type { StaffPortalLink } from "@/lib/staff-portal";
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
 * The instrument strip. Sticky on every route. Carries TDL's full logo, the status line — the text twin of the
 * Roster's current state — and the one primary action. On phones the status line moves to each section's caption.
 *
 * Light, since 2026-10-16: TDL asked for their full logo in colour, unaltered, and its olive wordmark fails on
 * navy (2.5:1). This reverses "header always navy" (DESIGN-DECISIONS.md, 2026-09-18) at the client's request.
 * On paper the status line is olive (6.2:1) rather than ink-light, and the primary button inverts to its
 * ink-filled form automatically, because the header no longer carries `.on-ink`.
 *
 * `portal` is computed on the server (src/lib/staff-portal.ts) — this component cannot read the demo-build flag.
 */
export function Header({ portal }: { portal: StaffPortalLink | null }) {
  const roster = useRosterOptional();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const status = roster?.active ? rosterStatusText[roster.state] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-olive/25 bg-paper text-ink">
      <Container className="flex h-16 items-center justify-between gap-6 md:h-18">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-6 text-[15px] lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="underline-offset-4 hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {/* The status line needs room; below xl the nav and actions take the width. */}
          {status ? (
            <p className="data hidden max-w-56 text-olive xl:block" aria-live="polite">
              {status}
            </p>
          ) : null}
          {portal ? <PortalLink portal={portal} className="text-[15px]" /> : null}
          <Button href="/become-a-client">Become a client</Button>
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
      <div id={panelId} hidden={!open} className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-olive/25 lg:hidden">
        <Container className="flex flex-col gap-1 py-4">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="py-2.5 text-[17px]" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3">
            <Button href="/become-a-client" className="w-full">
              Become a client
            </Button>
            {portal ? <PortalLink portal={portal} className="py-1 text-[15px]" /> : null}
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
function PortalLink({ portal, className = "" }: { portal: StaffPortalLink; className?: string }) {
  return (
    <a
      href={portal.href}
      target="_blank"
      rel={portal.external ? "noopener noreferrer" : "noopener"}
      className={`underline underline-offset-4 decoration-olive/60 hover:decoration-ink ${className}`}
    >
      {portal.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
