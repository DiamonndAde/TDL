import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Register } from "@/components/layout/register";
import { ApplicationForm } from "@/components/careers/application-form";
import { OpeningsLink } from "@/components/careers/openings-link";
import { PageViewed } from "@/components/layout/page-viewed";
import { PhotoFrame, frameShown } from "@/components/ui/photo-frame";
import { careers } from "@/content/about";
import { openingsLinkFor } from "@/lib/recruitment";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Work at Total Data Limited or join the talent pool for roles with the clients whose people TDL manages across Nigeria and Benin Republic.",
  alternates: { canonical: "/careers" },
};

/**
 * The job-seeker funnel, kept apart from the client funnel (brief §2). One page, two routes, in the order TDL
 * asked for (review, 2026-10-16): **open roles first**, then **the talent pool** for people whose role is not
 * listed, then the firm's own words on working here. TDL read "openings" and "careers" as duplicates, so the
 * page says "open roles" once, in one place, and the hero no longer repeats the two routes as buttons — the
 * sections below are the routes.
 *
 * Open roles live in TDL's own applicant tracking system — linked rather than duplicated (Q14, HANDOFF.md) — and
 * the board URL comes from the recruitment adapter, so this page names no provider. Diversity and perks text is
 * the current site's own.
 */
export default function CareersPage() {
  // Decorated by the adapter with a source marker when one is configured (Q29f).
  const board = openingsLinkFor("totaldatalimited.com/careers");
  const showPhoto = frameShown({ placeholder: "desk-work" });
  const columns = showPhoto ? "lg:grid-cols-[12.5rem_minmax(0,1fr)_minmax(0,24rem)]" : "lg:grid-cols-[12.5rem_minmax(0,1fr)]";
  return (
    <main id="main" className="bg-paper">
      <PageViewed event={{ name: "careers_viewed" }} />
      <section aria-labelledby="careers-title">
        <Container className={`py-14 md:py-20 lg:grid ${columns} lg:gap-10`}>
          <div className="mb-6 lg:mb-0">
            <p className="text-[15px] font-medium">Careers</p>
            <p className="data mt-1.5 max-w-[12rem] text-olive">For people looking for work.</p>
          </div>
          <div>
            <h1 id="careers-title" className="display max-w-[16ch] text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]">
              Roles with us, and with the companies whose people we run.
            </h1>
            <p className="mt-6 max-w-[36em] text-[1.0625rem] text-olive md:text-[1.125rem]">
              {board
                ? "Apply for a role that is open now, or join the talent pool and we will contact you when one matches."
                : "Join the talent pool below and we will contact you when a role matches."}
            </p>
          </div>
          {/* No caption: a careers page image needs no claim about whose staff these are. */}
          {showPhoto ? (
            <div className="mt-10 lg:mt-0">
              <PhotoFrame
                alt="Someone at work at a desk — photograph to come"
                aspect="aspect-[3/2]"
                note="Photograph to come: people at work."
                detail="3:2, at least 2,000 px on the long side."
                todo="Q18"
                placeholder="desk-work"
                placeholderPosition="50% 45%"
              />
            </div>
          ) : null}
        </Container>
      </section>

      {/* 1. Open roles — first, as TDL asked. Without a board configured the section is left out and the talent
          pool is the only route. */}
      {board ? (
        <Register id="open-roles" title="Open roles" note="Apply on our recruitment portal">
          <p className="max-w-[36em] text-[1.0625rem]">
            Every role we are hiring for, at TDL and at the companies whose people we run, is listed on our recruitment
            portal. You apply there.
          </p>
          <div className="mt-6">
            <OpeningsLink href={board} />
          </div>
        </Register>
      ) : null}

      {/* 2. The talent pool. */}
      <Register id="talent-pool" title="Talent pool" note="If your role is not listed">
        <div className="max-w-[40rem]">
          <ApplicationForm />
        </div>
      </Register>

      {/* 3. In the firm's own words. */}
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
    </main>
  );
}
