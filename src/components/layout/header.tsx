"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/facts";
import { useRosterOptional } from "@/components/roster/roster-context";
import { rosterStatusText } from "@/components/roster/states";
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
 * The instrument strip. Always navy, sticky. Carries the status line — the text twin of the Roster's current
 * state — next to the one primary action. On phones the status line moves to each section's caption.
 */
export function Header() {
  const roster = useRosterOptional();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const status = roster?.active ? rosterStatusText[roster.state] : null;

  return (
    <header className="on-ink sticky top-0 z-40 bg-ink text-paper">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-6 text-[15px] lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="underline-offset-4 hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          {status ? (
            <p className="data text-ink-light" aria-live="polite">
              {status}
            </p>
          ) : null}
          <Button href="/become-a-client">Become a client</Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center rounded-[2px] border border-ink-light px-3 text-[15px] lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </Container>

      <div id={panelId} hidden={!open} className="border-t border-ink-light/40 lg:hidden">
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
            <a href={company.phoneHref} className="data text-ink-light">
              Call {company.phone}
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}
