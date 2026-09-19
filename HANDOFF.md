# Handoff

## Before launch — do these first

1. **Remove `PLACEHOLDER_IMAGES` and `PLACEHOLDER_PRESENTATION_BUILD` from the Vercel Production environment, then redeploy.** With both set, a Production deployment builds *with* presentation placeholders (initials monograms in the testimonial frames, and any stock that is ever registered). The build log prints a boxed warning every time this happens; it is a warning, not a stop. Check the Vercel dashboard → Settings → Environment Variables → Production, and confirm the live build log has no `PLACEHOLDER IMAGERY IS ON` block.
2. Confirm `FORM_WEBHOOK_URL` is set in Production and a test submission arrives where TDL expects it (Q20).
3. Resolve every open row in `docs/CLIENT-QUESTIONS.md` marked blocking: logo lockup set (Q16), client logos in SVG/high-res (Q17), reference and quote sign-off (Q21–Q24), legal review (Q25). `grep -rn "TODO(client)" src/` must return only rows the client has explicitly accepted as-is.
4. Replace the empty photo frames with TDL's own photography (Q18, Q26, Q27) or accept them empty for launch — never stock.

## Running a client presentation with placeholder imagery (Windows PowerShell)

What the flag does today: the three testimonial portrait frames show initials monograms instead of "Portrait to come". No photograph is placeholdered anywhere (see `PLACEHOLDERS.md` for why). The office frame on the home page stays empty in every mode.

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

## Content lives in `src/content/`

There is no CMS and no database. Every number, claim, service, testimonial and logo is a TypeScript file under `src/content/`, tagged `TODO(client): Q<n>` where it is unconfirmed. To change copy, edit the file and redeploy. The site is fully static; the enquiry form posts to a configurable webhook (`FORM_WEBHOOK_URL`, see `.env.example`). Placeholder imagery is a presentation-only flag (`PLACEHOLDERS.md`).

### When a CMS or data layer would become worth it

Not a gap — a phase-two conversation. Today a schema plus a client bundle would buy nothing: nine pages of copy that changes a few times a year, and a form that already delivers. The trigger would be content that changes on a schedule someone other than a developer keeps:

- **Careers listings are the first real case.** If TDL posts roles regularly, `/careers` should read from something HR can edit without a deploy. Before introducing anything new, **check what they already run**: an ATS (applicant tracking system) or a CRM with a careers feed beats adding a CMS. A job feed from an existing tool is a fetch at build time, not a content platform.
- **Insights, if they commit to publishing.** Same test: a real cadence, a named owner. MDX in the repo is enough for a post a month; a CMS is for a team.
- **Case studies with client sign-off** stay in `src/content/` — they change rarely and every word needs approval anyway.

If the trigger arrives: prefer the client's existing system's API, then a hosted headless CMS scoped to the one collection that needs it (careers), never a database for the marketing site. Keep `src/content/` as the source for everything else.
