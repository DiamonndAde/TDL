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
 *  - `mark` — the people-mark cropped from the same PNG, with the name set in type. Used on navy (the footer),
 *    where the olive wordmark is 2.5:1 and would not read.
 */
export function Logo({ variant = "full", className = "" }: { variant?: "full" | "mark"; className?: string }) {
  if (variant === "full") {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`} aria-label="Total Data Limited, home">
        <Image
          src="/brand/logo.png"
          alt=""
          width={885}
          height={268}
          sizes="152px"
          priority
          className="h-10 w-auto md:h-11"
        />
      </Link>
    );
  }
  return (
    <Link href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="Total Data Limited, home">
      <span className="relative block h-9 w-[34px] overflow-hidden" aria-hidden="true">
        <Image src="/brand/logo.png" alt="" width={885} height={268} sizes="120px" className="absolute left-0 top-0 h-9 w-auto max-w-none" />
      </span>
      <span className="text-[15px] font-medium leading-none">Total Data Limited</span>
    </Link>
  );
}
