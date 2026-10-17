import Image from "next/image";
import Link from "next/link";
import { Register } from "@/components/layout/register";
import { Monogram } from "@/components/ui/monogram";
import { testimonials } from "@/content/testimonials";

/**
 * Testimonials: three cards, in one row on desktop and stacked on phones (TDL's review, 2026-10-16 — this
 * replaces the earlier tablist). Each card shows ONE verbatim sentence from that person's own quote — excerpted,
 * never rewritten, because these are named people's words — and links to the whole quote on /work, so the
 * excerpting is always one click from the full text. The boundary check fails if an excerpt stops being a verbatim
 * substring of its full quote.
 *
 * A server component now: nothing here is interactive, so the section ships no JavaScript (the tablist did).
 * Flat bordered cards, no shadow and no hover-lift (AGENTS.md).
 *
 * Portraits: a real headshot of the executive when supplied (Q26); behind the presentation flag an initials
 * monogram — never a face, stock or generated, under a real name; otherwise the reserved frame.
 */
export function Testimonials({ monograms = false, hideEmpty = false }: { monograms?: boolean; hideEmpty?: boolean }) {
  return (
    <Register id="testimonials" title="In their words" note="Three clients, quoted">
      <ul className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((t) => (
          <li key={t.id} className="flex flex-col border border-olive p-6 md:p-7">
            <blockquote className="voice flex-1 text-[1.1875rem] leading-snug md:text-[1.3125rem]">
              <p>&ldquo;{t.excerpt}&rdquo;</p>
            </blockquote>
            {/* A fixed minimum height, so the rule above each attribution lines up across the row however many
                lines a role or company name wraps to. */}
            <div className="mt-6 flex min-h-[6.5rem] items-start gap-4 border-t border-olive pt-5">
              {t.portrait || monograms || !hideEmpty ? (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-olive" data-todo="Q26">
                  {t.portrait ? (
                    <Image
                      src={t.portrait.src}
                      alt={`${t.person}, ${t.role}, ${t.company}`}
                      width={t.portrait.width}
                      height={t.portrait.height}
                      sizes="64px"
                      className="h-full w-full object-cover"
                    />
                  ) : monograms ? (
                    <Monogram name={t.person} size={62} />
                  ) : (
                    <span className="data px-1 text-center text-[11px] leading-tight text-olive">Portrait to come</span>
                  )}
                </span>
              ) : null}
              <p className="min-w-0">
                <span className="block text-[15px] font-medium">{t.person}</span>
                <span className="data block text-olive">{t.role}</span>
                <span className="data block text-olive">{t.company}</span>
              </p>
            </div>
            <Link
              href={`/work#${t.id}`}
              className="mt-5 self-start text-[15px] underline underline-offset-4 decoration-1 hover:decoration-2"
              aria-label={`Read the full quote from ${t.person}`}
            >
              Read the full quote
            </Link>
          </li>
        ))}
      </ul>
    </Register>
  );
}
