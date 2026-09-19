import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { RosterMount } from "@/components/roster/roster-mount";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { JsonLd } from "@/components/seo/json-ld";
import { PersonFrame } from "@/components/ui/person-frame";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { about, boardOfAdvisory, leadershipTeam } from "@/content/about";
import { company, gardenQuote, values } from "@/content/facts";

export const metadata: Metadata = {
  title: "About",
  description:
    "Total Data Limited: a management consultancy incorporated in 2000, running HR and business process outsourcing across Nigeria and Benin Republic. Leadership, board, values.",
  alternates: { canonical: "/about-us" },
};

/**
 * The human page. Opens on the Roster settled as the TDL mark — the population as one firm — then the story in
 * plain facts, vision and mission verbatim, the SPICE values (the acronym's letters are the one legitimate
 * numbering-like device here), leadership and board with their own words and reserved portrait frames, the MD's
 * garden quote given room, and the office frames reserved for real photography (Q18).
 */
export default function AboutPage() {
  return (
    <main id="main" className="relative">
      <JsonLd />
      <RosterMount />

      <section className="on-ink bg-ink text-paper" aria-labelledby="about-title">
        <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,32rem)_1fr] lg:gap-14 lg:py-24">
          <div>
            <h1 id="about-title" className="display max-w-[14ch] text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem]">
              Other companies&rsquo; people, run as one firm.
            </h1>
            {about.story.map((p) => (
              <p key={p} className="mt-6 max-w-[34em] text-[1.0625rem] md:text-[1.125rem]">
                {p}
              </p>
            ))}
          </div>
          <div>
            <RosterSlot state="mark" tone="ink" className="h-[260px] lg:h-[360px]" />
            <p className="data mt-3 text-ink-light">{rosterStatusText.mark}. Each mark is one managed employee.</p>
          </div>
        </Container>
      </section>

      <Register id="direction" title="Vision and mission" note="In the firm's own words">
        <dl className="max-w-[42rem] border-t border-olive">
          <div className="grid gap-2 border-b border-olive py-5 md:grid-cols-[10rem_1fr] md:gap-8">
            <dt className="text-[1.0625rem] font-medium">Vision</dt>
            <dd className="text-[1.0625rem] leading-relaxed">{about.vision}</dd>
          </div>
          <div className="grid gap-2 border-b border-olive py-5 md:grid-cols-[10rem_1fr] md:gap-8">
            <dt className="text-[1.0625rem] font-medium">Mission</dt>
            <dd className="text-[1.0625rem] leading-relaxed">{about.mission}</dd>
          </div>
        </dl>
      </Register>

      <Register id="values" title="Core values" note="SPICE">
        <ol className="max-w-[42rem] border-t border-olive" aria-label="Core values">
          {values.map((v) => (
            <li key={v.letter} className="grid grid-cols-[3rem_1fr] items-baseline border-b border-olive py-4">
              <span className="display text-[1.5rem] text-olive">{v.letter}</span>
              <span className="text-[1.0625rem]">{v.name}</span>
            </li>
          ))}
        </ol>
      </Register>

      <Register id="leadership" title="Management" note="Two people run the firm">
        <ul className="max-w-[48rem] border-t border-olive">
          {leadershipTeam.map((p) => (
            <li key={p.name} className="grid gap-6 border-b border-olive py-8 md:grid-cols-[200px_1fr] md:gap-10">
              <PersonFrame person={p} width={200} />
              <div>
                <h3 className="text-[1.25rem] font-medium">{p.name}</h3>
                <p className="data mt-1 text-olive">{p.role}</p>
                {p.bio.map((para) => (
                  <p key={para.slice(0, 40)} className="mt-4 max-w-[60ch] text-[15px] leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Register>

      <Register id="board" title="Board of advisory" note="Founder and two directors">
        <ul className="max-w-[48rem] border-t border-olive">
          {boardOfAdvisory.map((p) => (
            <li key={p.name} className="grid gap-6 border-b border-olive py-8 md:grid-cols-[160px_1fr] md:gap-10">
              <PersonFrame person={p} width={160} />
              <div>
                <h3 className="text-[1.25rem] font-medium">{p.name}</h3>
                <p className="data mt-1 text-olive">{p.role}</p>
                {p.letters ? <p className="data mt-1 text-olive">{p.letters}</p> : null}
                {p.bio.map((para) => (
                  <p key={para.slice(0, 40)} className="mt-4 max-w-[60ch] text-[15px] leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Register>

      <section className="bg-paper" aria-label="A word from the managing director">
        <Container className="py-16 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10 lg:py-24">
          <div className="hidden lg:block" />
          <blockquote className="voice max-w-[26em] text-[1.625rem] md:text-[2rem] lg:text-[2.25rem]">
            <p>&ldquo;{gardenQuote.text}&rdquo;</p>
            <footer className="data mt-6 text-olive">
              {gardenQuote.by}, {gardenQuote.role}
            </footer>
          </blockquote>
        </Container>
      </section>

      <Register id="office" title="The office" note={`${company.address.street}, ${company.address.locality}, ${company.address.region}`}>
        {/* Left: the office itself, captioned with the address, never placeholdered. Right: one frame of office
            work with a caption that claims nothing about TDL; placeholdered for presentations. */}
        <div className="grid gap-6 md:grid-cols-2">
          <figure>
            <PhotoFrame alt="The Total Data Limited office at 69 Coker Road, Ilupeju — photograph to come" aspect="aspect-[3/2]" note="Photograph to come: the office from Coker Road." todo="Q18" />
            <figcaption className="data mt-2 text-olive">{company.address.street}, {company.address.locality}. Photograph to come.</figcaption>
          </figure>
          <figure>
            <PhotoFrame
              alt="Office work — photograph to come"
              aspect="aspect-[3/2]"
              note="Photograph to come: real staff at work, with their consent."
              todo="Q18"
              placeholder="desk-work"
              placeholderPosition="50% 35%"
            />
            <figcaption className="data mt-2 text-olive">At work. Office work like the work TDL runs; not TDL&rsquo;s own staff.</figcaption>
          </figure>
        </div>
        <p className="data mt-4 text-olive">
          Quality policy and objectives, and the ISO 9001:2015 certification, are on the{" "}
          <Link href="/certifications" className="text-signal-deep underline underline-offset-4">
            certifications page
          </Link>
          .
        </p>
      </Register>
    </main>
  );
}
