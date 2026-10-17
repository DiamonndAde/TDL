import type { Metadata } from "next";
import { Clients } from "@/components/home/clients";
import { Close } from "@/components/home/close";
import { Coverage } from "@/components/home/coverage";
import { Hero } from "@/components/home/hero";
import { Lifecycle } from "@/components/home/lifecycle";
import { Office } from "@/components/home/office";
import { Proof } from "@/components/home/proof";
import { Services } from "@/components/home/services";
import { Testimonials } from "@/components/home/testimonials";
import { Work } from "@/components/home/work";
import { JsonLd } from "@/components/seo/json-ld";
import { company, headline } from "@/content/facts";
import { emptyFramesHidden, placeholdersEnabled } from "@/content/placeholders";

export const metadata: Metadata = {
  // Matches the hero headline (TDL review, 2026-10-16). Absolute, so the "— Total Data Limited" template is not
  // appended twice. TODO(client): Q23 — headline approval covers this too.
  title: { absolute: `Total Data Limited — ${headline.default}` },
  description: `${company.description} ISO 9001:2015 certified, Lagos.`,
  alternates: { canonical: "/" },
};

/**
 * Home, the brief's nine sections plus one reserved photograph before the close. Ink brackets paper: hero and proof on ink, six reading sections on
 * paper, the close on ink. The Roster runs behind the whole length; each section owns the slot it draws into.
 */
export default function Home() {
  return (
    <main id="main" className="relative">
      <JsonLd />
      <Hero />
      <Proof />
      <Coverage />
      <Services />
      <Lifecycle />
      <Work />
      <Testimonials monograms={placeholdersEnabled} hideEmpty={emptyFramesHidden} />
      <Clients />
      <Office />
      <Close />
    </main>
  );
}
