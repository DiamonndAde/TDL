import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { headline } from "@/content/facts";

// Milestone 2 placeholder — replaced by the nine home sections at milestone 4.
export default function Home() {
  return (
    <main id="main">
      <section className="on-ink bg-ink text-paper">
        <Container className="py-24">
          <h1 className="display max-w-[14ch] text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem]">
            {headline.default}
          </h1>
          <p className="mt-6 max-w-[34em] text-[1.125rem] md:text-[1.1875rem]">{headline.sub}</p>
          <div className="mt-9 flex items-center gap-6">
            <Button href="/become-a-client">Become a client</Button>
            <Button variant="link" href="/services">
              See the services
            </Button>
          </div>
        </Container>
      </section>
      <Register id="foundation" title="Foundation" note="Layout primitive check">
        <p>The register primitive: caption column left, content right, stacked on phones.</p>
      </Register>
    </main>
  );
}
