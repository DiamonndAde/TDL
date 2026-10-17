# Handoff

## Before launch — do these first

0. **Take the demo analytics off the live site.** For the demo, the PostHog key of the "TDL Demo" project sits in the Vercel **Production** environment, because the demo URL is a Production deployment of `main`. Before launch:
   - **Replace the demo PostHog key with TDL's**: set `NEXT_PUBLIC_POSTHOG_KEY` to the project key of TDL's own PostHog project (EU cloud), or remove it entirely if TDL has not approved analytics (Q30) — without it, analytics does not exist on the site.
   - **Reset the replay sample rate to 0.05**: set `NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE=0.05`, or delete the variable (0.05 is the default). The demo runs at 1, which would spend the free 5,000 recordings in days on real traffic (`docs/ANALYTICS-PROPOSAL.md` §7).
   - Redeploy — `NEXT_PUBLIC_` values are baked in at build time.
   - On TDL's own project, build the dashboard without the sample-data label: `npm run posthog:setup -- --production` with TDL's personal API key and project ID in `.env.local`. **Never run `posthog:seed` there** — it refuses unless the project is named as a demo, and that should stay true.

1. **Remove `PLACEHOLDER_IMAGES`, `PLACEHOLDER_PRESENTATION_BUILD` and `PRESENTATION_HIDE_EMPTY_FRAMES` from the Vercel Production environment, then redeploy.** With both set, a Production deployment builds *with* presentation placeholders (initials monograms in the testimonial frames, and any stock that is ever registered). The build log prints a boxed warning every time this happens; it is a warning, not a stop. Check the Vercel dashboard → Settings → Environment Variables → Production, and confirm the live build log has no `PLACEHOLDER IMAGERY IS ON` block.
2. Confirm `FORM_WEBHOOK_URL` is set in Production and a test submission arrives where TDL expects it (Q20).
   Set `ZOHO_RECRUIT_CLIENT_ID`, `ZOHO_RECRUIT_CLIENT_SECRET` and `ZOHO_RECRUIT_REFRESH_TOKEN` (Q29) and send one talent-pool submission from `/careers`: it must appear in Zoho Recruit → Candidates with a note titled "Talent pool submission from totaldatalimited.com". Until those three are set, talent-pool submissions go to the webhook instead — an inbox recruiters do not read, so somebody must own it.
3. **Staff portal:** set `company.staffPortal.url` in `src/content/facts.ts` (Q31). Until it is set the link is hidden on the live site — which is safe, but TDL's staff will not find it.
   Resolve every open row in `docs/CLIENT-QUESTIONS.md` marked blocking: logo lockup set (Q16), client logos in SVG/high-res (Q17), reference and quote sign-off (Q21–Q24), legal review (Q25). `grep -rn "TODO(client)" src/` must return only rows the client has explicitly accepted as-is.
4. Replace the empty photo frames with TDL's own photography (Q18, Q26, Q27) or accept them empty for launch — never stock. The home slider's photographs go in `src/content/photographs.ts` (`homePhotographs`); the first entry turns the "Photographs to come" note into the slider.

   **Brochure (Q32):** save TDL's PDF as `public/brochure.pdf` and rebuild. That one file switches `/brochure` from `/services` to the PDF and changes the contact page's wording from "our services" to "our brochure (PDF)"; the QR code does not change. **Only print the QR code from the live site** (`totaldatalimited.com/contact-us`). A demo build's code points at the demo deployment and says "Do not print it"; a printed copy would die with the demo. `/brochure` must keep working for as long as anything printed carries it — it is a 307, so its destination can change, but the address never should.
5. **Analytics is built but switched off.** Before the PostHog key is ever deployed, in this order:
   - **Create the PostHog project in the EU cloud.** The region is fixed at creation and cannot be changed.
   - **Set a $0 billing limit on every product** — Organisation settings → Billing: product analytics, session replay, feature flags, surveys, error tracking, PostHog AI. This cannot be done from the codebase. It turns the free allowances into ceilings: at a limit PostHog stops ingesting that product and the excess data is lost, so nothing can ever be billed. The owner gets an email at 80% and 100%; at 80% on replay, lower `NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE` (`docs/ANALYTICS-PROPOSAL.md` §7, §11).
   - **Leave AI features unapproved** unless TDL has answered Q30(f) yes, and in either case switch off "Enable AI training on anonymized data" in the organisation settings.
   - Leave `NEXT_PUBLIC_ANALYTICS_SURVEYS` and `NEXT_PUBLIC_ANALYTICS_EXPERIMENTS` unset until Q30(g) and (h) are answered.

   Apart from the demo project's key (item 0), no `NEXT_PUBLIC_POSTHOG_KEY` is set anywhere; without one, no banner shows, no SDK is downloaded and no request is made. Before ever setting it, TDL must also have approved Q30 and the privacy and cookies notices must carry the new section (Q25 legal review, draft in `docs/ANALYTICS-PROPOSAL.md` §4). Then run `npm run test:masking` against that build and confirm it reports no canary tokens, the replay stream present, and the failed-submission event present.

## Running a client presentation with placeholder imagery (Windows PowerShell)

What the flag does: three frames fill with one licensed, credited photograph (home Work section, `/about-us` "At work", `/careers` header) and every named-person frame shows an initials monogram. Two things never fill: the frame captioned 69 Coker Road and any portrait of a named person. `PLACEHOLDERS.md` has the per-route table and what was rejected and why.

**Hiding the reserved frames.** Every frame still waiting for TDL's photography is a compact bordered note ("Photograph to come", the place, the format). To show a page as it will read once the photographs exist, add `PRESENTATION_HIDE_EMPTY_FRAMES=true` alongside the flag: the notes and their empty portrait frames are left out, sections that held nothing else go with them, and placeholders and monograms still show. Set it in the shell like the others; it prints a warning on a production build and is on the launch checklist.

**Given `.env.local` already contains `PLACEHOLDER_IMAGES=true`:** `npm run dev` shows the placeholders with nothing else set (dev is never a production target); the presentation build needs only the marker — `$env:PLACEHOLDER_PRESENTATION_BUILD = "1"` then `npm run build` and `npm start`.

The presentation mode is off unless `PLACEHOLDER_IMAGES` is `true`. The build refuses that flag for production unless the build is explicitly marked as a presentation build. Set the variables in the shell for the session — nothing persists, nothing can leak into a deploy. The testimonial portrait frames stay empty regardless (`PLACEHOLDERS.md`).

**Development server** (fast, live reload):

```powershell
$env:PLACEHOLDER_IMAGES = "true"
npm run dev
```

**Production build, the one to run in front of the client:**

```powershell
$env:PLACEHOLDER_IMAGES = "true"
$env:PLACEHOLDER_PRESENTATION_BUILD = "1"
npm run build
npm start
```

Then open http://localhost:3000. Every placeholder carries the label "Placeholder — TDL photography required" and a photo credit.

**Afterwards, clear the variables** (or just close the PowerShell window):

```powershell
Remove-Item Env:PLACEHOLDER_IMAGES
Remove-Item Env:PLACEHOLDER_PRESENTATION_BUILD
npm run build
```

**On Vercel:** a Preview deployment needs only `PLACEHOLDER_IMAGES=true` in the Preview environment. A Production deployment needs both `PLACEHOLDER_IMAGES=true` and `PLACEHOLDER_PRESENTATION_BUILD=1` in the Production environment, and **both must be removed before launch** — the build log says so every time it builds with them set.

If `npm run build` or `npm start` prints `Placeholder guard:` and stops, that is the guard working: the flag is set without the presentation marker. **Note that `.env.local` is read by `next build` and `next start` too**, so if `PLACEHOLDER_IMAGES=true` lives there, every production build and start needs `$env:PLACEHOLDER_PRESENTATION_BUILD = "1"` as well, and a normal build needs the line removed. The shell variable is the safer habit: it dies with the window and cannot follow the repo anywhere.

## Verification scripts

- `npm run test:scroll` — scrolls every Roster route top to bottom at two speeds, at 1280 and 390 px, with Lenis on and off, and after client-side navigation in both directions; fails if the footer is not reached. Added after a real trap: Lenis cached the document height of a short page and clamped scrolling on the long one.
- `npm run test:form` — drives `/become-a-client` end to end.
- `node scripts/first-load.mjs / /services ...` — first-load JS per route against the budget.
- Lighthouse runners and the Roster proofs are in `scripts/`; `docs/screenshots/README.md` lists how each capture is regenerated.

Prerequisites for the Python scripts: Python 3.9+ with `playwright` installed (`pip install playwright`) and Chromium at the path in each script's `CHROME` constant (or `python -m playwright install chromium` and update the path). The bash wrappers run under Git Bash on Windows.

Completed at milestone 9. Sections are added as milestones close; the content the client still owes is tracked in `docs/CLIENT-QUESTIONS.md`, decisions in `docs/DESIGN-DECISIONS.md`.

## Checking it still holds

Three commands, one per tier of the testing policy in `AGENTS.md`. Each includes the tiers below it, exits
non-zero if anything failed, prints a summary of every step with its time, and leaves `.next` as the shipping
build (analytics off, placeholders off) whatever it ran — so `npm start` afterwards never serves a test setup.

```powershell
npm run check         # Tier 1, ~1 min: lint, typecheck, boundary check. Every change.
npm run verify        # Tier 2, ~8 min: + production build, scroll regression, first-load JS. Before a push.
npm run verify:full   # Tier 3, ~45-60 min: everything. Before a client demo or launch.
```

No environment setup is needed: the scripts set `PLACEHOLDER_IMAGES=false` themselves (your `.env.local` turns
it on for presentations) and build the analytics-on configuration they need for the consent and canary tests
against a local PostHog stand-in, so nothing reaches PostHog.

Individual suites, for a change that touches one area — `AGENTS.md` lists which to run when:

```powershell
npm run test:provider  # recruitment adapter, every branch against a stub (no credentials, no network)
npm run test:guard     # placeholder guard under eight environments, and no stock in the shipping HTML
npm run test:scroll    # scroll position after client-side navigation
npm run test:form      # the three-step enquiry form
npm run test:harden    # axe, keyboard, reduced motion, redirects, sitemap, JSON-LD
npm run test:android   # applied 4x CPU + slow 4G: LCP, CLS, interaction latency, scroll-fling
```

Lighthouse in Tier 3 kills Chrome between runs — headless instances leak on Windows and inflate TBT by several
seconds, which has twice sent a session chasing a regression that was not there. It gates only on accessibility
(100) and CLS; the simulated LCP is recorded, not targeted (`docs/DESIGN-DECISIONS.md`, 2026-09-29). The LCP
requirement is gated by the throttled-mobile probe, which uses applied throttling.

## Content lives in `src/content/`

There is no CMS and no database. Every number, claim, service, testimonial and logo is a TypeScript file under `src/content/`, tagged `TODO(client): Q<n>` where it is unconfirmed. To change copy, edit the file and redeploy. The site is fully static; the enquiry form posts to a configurable webhook (`FORM_WEBHOOK_URL`, see `.env.example`). Placeholder imagery is a presentation-only flag (`PLACEHOLDERS.md`).

### When a CMS or data layer would become worth it

Not a gap — a phase-two conversation. Today a schema plus a client bundle would buy nothing: nine pages of copy that changes a few times a year, and a form that already delivers. The trigger would be content that changes on a schedule someone other than a developer keeps:

- **Careers listings are the first real case — and TDL already runs an ATS.** The current site links openings to Zoho Recruit (`totaldatalimited.zohorecruit.com/jobs/Careers`), so `/careers` links there and never duplicates listings. Rendering openings on `/careers` in the site's own design is a build-time fetch of `GET /recruit/v2/JobOpenings` (the API is on every Zoho plan, including Free) with the apply step handed to Zoho — not a CMS; what it needs from TDL is in `docs/CLIENT-QUESTIONS.md` Q29 and the reasoning in `docs/DESIGN-DECISIONS.md` (2026-09-19). The talent-pool form already delivers into Zoho as a Candidate record plus a note (`src/lib/zoho-recruit.ts`) once the three `ZOHO_RECRUIT_*` variables are set, falling back to the webhook until then.
- **Insights, if they commit to publishing.** Same test: a real cadence, a named owner. MDX in the repo is enough for a post a month; a CMS is for a team.
- **Case studies with client sign-off** stay in `src/content/` — they change rarely and every word needs approval anyway.

If the trigger arrives: prefer the client's existing system's API, then a hosted headless CMS scoped to the one collection that needs it (careers), never a database for the marketing site. Keep `src/content/` as the source for everything else.
