import Image from "next/image";
import Link from "next/link";

/**
 * Two lockups, chosen by the ground they sit on.
 *
 *  - `full` — TDL's logo exactly as supplied: people-mark, olive wordmark and red tagline, in colour, unaltered
 *    (client request, 2026-10-16). Used in the header, which is now light so the olive wordmark reads. The PNG
 *    has a transparent ground. Its lime and red stay inside the logo asset, as AGENTS.md requires; text that is
 *    part of a logo is exempt from WCAG contrast. The original file is still owed (CLIENT-QUESTIONS.md Q16) —
 *    this is the same PNG as on their current site.
 *    48 px tall on phones, 58 px from md, so the tagline under the wordmark is legible (TDL review, 2026-10-17).
 *  - `panel` — the same full lockup on a small paper panel, for navy grounds (the footer). The olive wordmark is
 *    2.5:1 on navy; on its own paper it reads, and the logo stays exactly as supplied.
 */
export function Logo({ variant = "full", className = "" }: { variant?: "full" | "panel"; className?: string }) {
  if (variant === "full") {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`} aria-label="Total Data Limited, home">
        <Image
          src="/brand/logo.png"
          alt=""
          width={885}
          height={268}
          sizes="192px"
          priority
          className="h-12 w-auto md:h-[3.625rem]"
        />
      </Link>
    );
  }
  return (
    <Link
      href="/"
      className={`inline-flex items-center rounded-[2px] bg-paper px-3 py-2.5 ${className}`}
      aria-label="Total Data Limited, home"
    >
      <Image src="/brand/logo.png" alt="" width={885} height={268} sizes="192px" className="h-12 w-auto md:h-[3.625rem]" />
    </Link>
  );
}
