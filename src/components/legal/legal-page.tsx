import { Container } from "@/components/layout/container";
import { legalUpdated, type LegalBlock } from "@/content/legal";

/**
 * Renders a policy verbatim from src/content/legal.ts. Numbered section lines are headings; consecutive list
 * items form one list. No Roster, no GSAP, no Lenis work here — legal pages carry the smallest possible bundle.
 */
export function LegalPage({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  const groups: (LegalBlock | LegalBlock[])[] = [];
  for (const b of blocks) {
    const last = groups[groups.length - 1];
    if (b.type === "li") {
      if (Array.isArray(last)) last.push(b);
      else groups.push([b]);
    } else groups.push(b);
  }
  return (
    <main id="main" className="bg-paper">
      <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_minmax(0,42rem)] lg:gap-10">
        <div className="mb-6 lg:mb-0">
          <p className="text-[15px] font-medium">{title}</p>
          <p className="data mt-1.5 max-w-[12rem] text-olive">Last updated {legalUpdated}</p>
        </div>
        <article>
          <h1 className="display text-[1.75rem] md:text-[2.25rem]">{title}</h1>
          <div className="mt-8 space-y-4 text-[15px] leading-relaxed">
            {groups.map((g, i) =>
              Array.isArray(g) ? (
                <ul key={i} className="list-disc space-y-2 pl-6">
                  {g.map((li) => (
                    <li key={li.text}>{li.text}</li>
                  ))}
                </ul>
              ) : g.type === "h2" ? (
                <h2 key={i} className="pt-4 text-[1.0625rem] font-medium">
                  {g.text}
                </h2>
              ) : (
                <p key={i}>{g.text}</p>
              ),
            )}
          </div>
        </article>
      </Container>
    </main>
  );
}
