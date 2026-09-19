import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Insights",
  description: "Writing from Total Data Limited.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/insights" },
};

/**
 * The current site's "Blog" was a dead link (Q13). The route exists so /Blog can redirect somewhere real and so a
 * first post has a home; it stays out of the navigation and out of the index until there is content.
 */
export default function InsightsPage() {
  return (
    <main id="main" className="bg-paper">
      <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_minmax(0,42rem)] lg:gap-10">
        <div className="mb-6 lg:mb-0">
          <p className="text-[15px] font-medium">Insights</p>
          <p className="data mt-1.5 max-w-[12rem] text-olive">Nothing published yet</p>
        </div>
        <div>
          <h1 className="display text-[1.75rem] md:text-[2.25rem]">Nothing here yet.</h1>
          <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive">
            When TDL publishes writing on running people at scale, it will live here. Until then, the{" "}
            <Link href="/work" className="text-signal-deep underline underline-offset-4">
              three accounts of client work
            </Link>{" "}
            are the best reading on the site.
          </p>
        </div>
      </Container>
    </main>
  );
}
