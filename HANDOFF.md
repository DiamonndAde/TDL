# Handoff

Completed at milestone 9. Sections are added as milestones close; the content the client still owes is tracked in `docs/CLIENT-QUESTIONS.md`, decisions in `docs/DESIGN-DECISIONS.md`.

## Content lives in `src/content/`

There is no CMS and no database. Every number, claim, service, testimonial and logo is a TypeScript file under `src/content/`, tagged `TODO(client): Q<n>` where it is unconfirmed. To change copy, edit the file and redeploy. The site is fully static; the enquiry form posts to a configurable webhook (`FORM_WEBHOOK_URL`, see `.env.example`). Placeholder imagery is a presentation-only flag (`PLACEHOLDERS.md`).

### When a CMS or data layer would become worth it

Not a gap — a phase-two conversation. Today a schema plus a client bundle would buy nothing: nine pages of copy that changes a few times a year, and a form that already delivers. The trigger would be content that changes on a schedule someone other than a developer keeps:

- **Careers listings are the first real case.** If TDL posts roles regularly, `/careers` should read from something HR can edit without a deploy. Before introducing anything new, **check what they already run**: an ATS (applicant tracking system) or a CRM with a careers feed beats adding a CMS. A job feed from an existing tool is a fetch at build time, not a content platform.
- **Insights, if they commit to publishing.** Same test: a real cadence, a named owner. MDX in the repo is enough for a post a month; a CMS is for a team.
- **Case studies with client sign-off** stay in `src/content/` — they change rarely and every word needs approval anyway.

If the trigger arrives: prefer the client's existing system's API, then a hosted headless CMS scoped to the one collection that needs it (careers), never a database for the marketing site. Keep `src/content/` as the source for everything else.
