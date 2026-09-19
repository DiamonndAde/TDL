import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { ApplicationForm } from "@/components/careers/application-form";
import { careers } from "@/content/about";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Work at Total Data Limited or join the talent pool for roles with the clients whose people TDL manages across Nigeria and Benin Republic.",
  alternates: { canonical: "/careers" },
};

/**
 * The job-seeker funnel, kept apart from the client funnel (brief §2). Openings are TDL's own Zoho Recruit board
 * — an existing system, linked rather than duplicated (Q14, HANDOFF.md). The talent-pool form is for people
 * whose role is not listed. Diversity and perks text is the current site's own.
 */
export default function CareersPage() {
  return (
    <main id="main" className="bg-paper">
      <section aria-labelledby="careers-title">
        <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Careers</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">For people looking for work. Clients: see Become a client.</p>
          </div>
          <div>
            <h1 id="careers-title" className="display max-w-[16ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              Roles with us, and with the companies whose people we run.
            </h1>
            <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive md:text-[1.125rem]">
              Current openings are listed on our recruitment portal. If your role is not there, join the talent pool
              below and we will contact you when one matches.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Button href={careers.openingsUrl} rel="noopener" target="_blank">
                See current openings
              </Button>
              <a href="#talent-pool" className="text-[15px] underline underline-offset-4">
                Join the talent pool
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Register id="working-here" title="Working here" note="In the firm's own words">
        <dl className="max-w-[42rem] border-t border-olive">
          <div className="border-b border-olive py-5">
            <dt className="text-[1.0625rem] font-medium">Diversity and inclusion</dt>
            <dd className="mt-2 text-[15px] leading-relaxed">{careers.diversity}</dd>
          </div>
          <div className="border-b border-olive py-5">
            <dt className="text-[1.0625rem] font-medium">Perks and benefits</dt>
            <dd className="mt-2 text-[15px] leading-relaxed">{careers.perks}</dd>
          </div>
        </dl>
      </Register>

      <Register id="talent-pool" title="Talent pool" note="If your role is not listed">
        <div className="max-w-[40rem]">
          <ApplicationForm />
        </div>
      </Register>
    </main>
  );
}
