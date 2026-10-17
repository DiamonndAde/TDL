"use client";

import Link from "next/link";
import { company } from "@/content/facts";
import type { ServiceSlug } from "@/content/services";
import { track } from "@/lib/analytics/track";
import type { CtaLocation } from "@/lib/analytics/events";

/**
 * "Partner with us" — the main call to action since TDL's review (2026-10-16). It opens WhatsApp with a
 * prefilled first message, in a new tab, to the number in `src/content/facts.ts` (TODO(client): Q20 — confirm
 * it takes WhatsApp).
 *
 * The visible label is TDL's, exactly. Because it does not itself say WhatsApp opens, the button carries the
 * WhatsApp mark and its accessible name is "Partner with us on WhatsApp" — which contains the visible label, as
 * WCAG 2.5.3 requires of an accessible name.
 *
 * Styling is the existing primary button, unchanged: paper on dark grounds, ink on light, never --signal.
 *
 * `showFormLink` adds the secondary route, "Prefer a form?", to the enquiry form — pre-ticked with the service on
 * a service page. It is left off where there is no room for it (the desktop header).
 */
export function PartnerCta({
  location,
  service,
  showFormLink = true,
  fullWidth = false,
  className = "",
}: {
  location: CtaLocation;
  /** On a service page: the slug and display name, so the message and the form both carry it. */
  service?: { slug: ServiceSlug; name: string };
  showFormLink?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  const message = service ? company.whatsappMessage.service(service.name) : company.whatsappMessage.general;
  const href = `${company.whatsappHref}?text=${encodeURIComponent(message)}`;
  const formHref = service ? `/become-a-client?service=${service.slug}` : "/become-a-client";

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${fullWidth ? "flex-col items-stretch" : ""} ${className}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partner with us on WhatsApp"
        onClick={() => track({ name: "whatsapp_clicked", location, service: service?.slug ?? "none" })}
        className={`inline-flex items-center justify-center gap-2.5 rounded-[2px] bg-ink px-5 py-3.5 text-[15px] font-medium leading-none text-paper transition-colors duration-150 hover:bg-ink/85 [.on-ink_&]:bg-paper [.on-ink_&]:text-ink [.on-ink_&]:hover:bg-paper/85 ${fullWidth ? "w-full" : ""}`}
      >
        <WhatsAppMark />
        Partner with us
      </a>
      {showFormLink ? (
        <Link href={formHref} className="text-[15px] underline underline-offset-4 decoration-1 hover:decoration-2 [.on-ink_&]:text-paper">
          Prefer a form?
        </Link>
      ) : null}
    </div>
  );
}

/**
 * WhatsApp's glyph from Simple Icons 16.35.0 (CC0-1.0), in the button's own text colour rather than WhatsApp
 * green — palette tokens only. Decorative: the accessible name already says WhatsApp.
 */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true" focusable="false" className="shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
