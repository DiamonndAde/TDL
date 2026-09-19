import Link from "next/link";
import { Register } from "@/components/layout/register";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { caseStudies } from "@/content/testimonials";

/**
 * Work. Three accounts as ledger rows, not cards: situation → what TDL ran → what the client said. Built only
 * from the public testimonials; no outcomes or percentages are stated that the client did not (Q10). Naming the
 * companies in this form needs sign-off (Q21).
 */
export function Work() {
  return (
    <Register id="work" title="Work" note="Three accounts">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-start lg:gap-14">
        <h3 className="display max-w-[22ch] text-[1.75rem] md:text-[2rem]">
          What running someone else&rsquo;s people actually involves.
        </h3>
        {/* One photograph: office work like the work these accounts describe. Placeholdered for presentations;
            the caption is true without claiming to show TDL (Q27 covers the real shot). */}
        <figure className="max-w-[28rem] lg:justify-self-end">
          <PhotoFrame
            alt="Office work like the work these accounts describe — photograph to come"
            aspect="aspect-[3/2]"
            note="Photograph to come: people at the kind of work these accounts describe."
            todo="Q27"
            placeholder="desk-work"
            placeholderPosition="50% 28%"
          />
          <figcaption className="data mt-2 text-olive">Office work like the work these accounts describe. Not TDL&rsquo;s staff; TDL&rsquo;s own photography to come.</figcaption>
        </figure>
      </div>
      <ol className="mt-8 border-t border-olive">
        {caseStudies.map((c) => (
          <li key={c.id} className="border-b border-olive py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h4 className="text-[1.125rem] font-medium">{c.company}</h4>
              <p className="data text-olive">{c.sector}</p>
            </div>
            <dl className="mt-4 grid gap-5 md:grid-cols-3 md:gap-8">
              <Cell term="Situation" text={c.situation} />
              <Cell term="What TDL ran" text={c.ran} />
              <Cell term="What the client said" text={c.said} />
            </dl>
          </li>
        ))}
      </ol>
      <p className="mt-6">
        <Link href="/work" className="text-[15px] text-signal-deep underline underline-offset-4">
          Read the three accounts in full
        </Link>
      </p>
    </Register>
  );
}

function Cell({ term, text }: { term: string; text: string }) {
  return (
    <div>
      <dt className="data text-olive">{term}</dt>
      <dd className="mt-1 text-[15px] leading-relaxed">{text}</dd>
    </div>
  );
}
