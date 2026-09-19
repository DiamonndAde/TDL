import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { caseStudies, testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Three accounts of what Total Data Limited runs for its clients: Carlcare Development Nigeria, Chi Limited and Transsnet Music, in their own words.",
  alternates: { canonical: "/work" },
};

/**
 * The three accounts in full: situation → what TDL ran → what the client said, followed by the whole testimonial
 * that the account is built from. Nothing here goes beyond what the client has published; no outcome figures
 * (Q10). Naming the companies in this form needs written sign-off before launch (Q21); the quotes keep their
 * original typos until corrections are permitted (Q22).
 */
export default function WorkPage() {
  return (
    <main id="main" className="bg-paper">
      <section aria-labelledby="work-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Work</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">Three accounts, built only from what each client has said in public</p>
          </div>
          <div>
            <h1 id="work-title" className="display max-w-[18ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              What running someone else&rsquo;s people actually involves.
            </h1>
            <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive md:text-[1.125rem]">
              Each account is in three parts: the situation the client was in, what TDL ran, and what the client said
              about it afterwards. Where a number would help and the client has not published one, none is given.
            </p>
          </div>
        </Container>
      </section>

      {caseStudies.map((c) => {
        const t = testimonials.find((x) => x.id === c.id)!;
        return (
          <Register key={c.id} id={c.id} title={c.company} note={c.sector}>
            <dl className="grid max-w-[54rem] gap-6 border-t border-olive pt-6 md:grid-cols-3 md:gap-8">
              <div>
                <dt className="data text-olive">Situation</dt>
                <dd className="mt-1 text-[15px] leading-relaxed">{c.situation}</dd>
              </div>
              <div>
                <dt className="data text-olive">What TDL ran</dt>
                <dd className="mt-1 text-[15px] leading-relaxed">{c.ran}</dd>
              </div>
              <div>
                <dt className="data text-olive">What the client said</dt>
                <dd className="mt-1 text-[15px] leading-relaxed">{c.said}</dd>
              </div>
            </dl>
            <figure className="mt-10 max-w-[54rem] border-t border-olive pt-8">
              <blockquote className="voice max-w-[30em] text-[1.25rem] md:text-[1.375rem]">
                {t.full.map((para) => (
                  <p key={para.slice(0, 40)} className="mt-4 first:mt-0">
                    {para}
                  </p>
                ))}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                <Image src={t.logo.src} alt="" width={t.logo.width} height={t.logo.height} className="h-8 w-14 object-contain object-left mix-blend-multiply" />
                <span className="data text-olive">
                  {t.person}, {t.role}, {t.company}
                </span>
              </figcaption>
            </figure>
          </Register>
        );
      })}

      <section className="on-ink bg-ink text-paper" aria-labelledby="work-close">
        <Container className="py-16 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10 lg:py-20">
          <div className="hidden lg:block" />
          <div>
            <h2 id="work-close" className="display max-w-[16ch] text-[1.75rem] md:text-[2.25rem]">
              Your account could be the fourth.
            </h2>
            <div className="mt-8">
              <Button href="/become-a-client">Become a client</Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
