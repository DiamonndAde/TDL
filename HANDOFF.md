# Handoff

## Running a client presentation with placeholder imagery (Windows PowerShell)

The reserved photo frames stay empty unless `PLACEHOLDER_IMAGES` is `true`. The build refuses that flag for production unless the build is explicitly marked as a presentation build. Set the variables in the shell for the session — nothing persists, nothing can leak into a deploy. The testimonial portrait frames stay empty regardless (`PLACEHOLDERS.md`).

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

If `npm run build` prints `PLACEHOLDER_IMAGES=true in a production build` and stops, that is the guard working: the flag is set without the presentation marker. Do not set `PLACEHOLDER_IMAGES` in `.env` or `.env.production`; `.env.local` is acceptable for `npm run dev` only (it is git-ignored), but the shell variable is safer because it dies with the window.

## Verification scripts

- `npm run test:scroll` — scrolls every Roster route top to bottom at two speeds, at 1280 and 390 px, with Lenis on and off, and after client-side navigation in both directions; fails if the footer is not reached. Added after a real trap: Lenis cached the document height of a short page and clamped scrolling on the long one.
- `npm run test:form` — drives `/become-a-client` end to end.
- `node scripts/first-load.mjs / /services ...` — first-load JS per route against the budget.
- Lighthouse runners and the Roster proofs are in `scripts/`; `docs/screenshots/README.md` lists how each capture is regenerated.

Prerequisites for the Python scripts: Python 3.9+ with `playwright` installed (`pip install playwright`) and Chromium at the path in each script's `CHROME` constant (or `python -m playwright install chromium` and update the path). The bash wrappers run under Git Bash on Windows.

Completed at milestone 9. Sections are added as milestones close; the content the client still owes is tracked in `docs/CLIENT-QUESTIONS.md`, decisions in `docs/DESIGN-DECISIONS.md`.

## Content lives in `src/content/`

There is no CMS and no database. Every number, claim, service, testimonial and logo is a TypeScript file under `src/content/`, tagged `TODO(client): Q<n>` where it is unconfirmed. To change copy, edit the file and redeploy. The site is fully static; the enquiry form posts to a configurable webhook (`FORM_WEBHOOK_URL`, see `.env.example`). Placeholder imagery is a presentation-only flag (`PLACEHOLDERS.md`).

### When a CMS or data layer would become worth it

Not a gap — a phase-two conversation. Today a schema plus a client bundle would buy nothing: nine pages of copy that changes a few times a year, and a form that already delivers. The trigger would be content that changes on a schedule someone other than a developer keeps:

- **Careers listings are the first real case.** If TDL posts roles regularly, `/careers` should read from something HR can edit without a deploy. Before introducing anything new, **check what they already run**: an ATS (applicant tracking system) or a CRM with a careers feed beats adding a CMS. A job feed from an existing tool is a fetch at build time, not a content platform.
- **Insights, if they commit to publishing.** Same test: a real cadence, a named owner. MDX in the repo is enough for a post a month; a CMS is for a team.
- **Case studies with client sign-off** stay in `src/content/` — they change rarely and every word needs approval anyway.

If the trigger arrives: prefer the client's existing system's API, then a hosted headless CMS scoped to the one collection that needs it (careers), never a database for the marketing site. Keep `src/content/` as the source for everything else.
