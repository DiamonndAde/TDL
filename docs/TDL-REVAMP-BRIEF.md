# Total Data Limited — Website Revamp
### Creative brief + agent prompt for Claude Code

This file does double duty: read it yourself as the brief, and hand it to your agent as the spec. Sections 1–4 are context, 5–12 are the build instruction, 13 is the skills setup.

---

## 0. Kickoff prompt (paste this into Claude Code first)

> Read `TDL-REVAMP-BRIEF.md` in full before writing any code.
>
> Then do this and stop: produce a design plan — palette (4–6 named hex values), type (families and their roles), layout concept (one-sentence prose plus ASCII wireframes for the home page), and the motion system (the one orchestrated idea and how it recurs). Sample the actual brand colours from `https://totaldatalimited.com/images/marketing/rebrand0623/home/logo.png` and reconcile my proposed palette against them.
>
> Before you show me the plan, critique it: for each decision, ask whether you'd have produced the same thing for any HR consultancy brief. Where the answer is yes, revise it and tell me what you changed and why.
>
> Do not scaffold the project or write components until I approve the plan.

After approval, work through the milestones in section 12 one at a time. Do not let it build all seven service pages before the home page is right.

---

## 1. Who the client actually is

Pulled from the live site — use these as the real content, not placeholders.

| Fact | Detail |
|---|---|
| Name | Total Data Limited (TDL) |
| Incorporated | Year 2000 |
| What it is | Management consultancy — HR and business process outsourcing |
| Scale | Manages **over 5,000 staff** across all states in Nigeria and in Benin Republic |
| Certification | ISO 9001:2015 |
| Clients | 100+, including Chi Limited, Carlcare Development Nigeria (TECNO, Infinix, itel, Oraimo), Transsnet Music |
| Office | 69 Coker Road, Ilupeju, Lagos |
| Contact | Info@totaldatalimited.com · +234 818 546 1010 |
| Vision | To be the preferred outsourcing company in Nigeria/Africa |
| Core values | **S**trategy · **P**rofessionalism · **I**nnovation · **C**ustomer Satisfaction · **E**fficiency (the "SPICE" acronym) |
| Leadership | TOluwalase Ayeni (MD), Yetunde Braimoh-Habeebu (Deputy MD); board: Theo Ola Ayeni Esq (founder/chairman), Adedamola A. Adams, Musi A. Braimoh |
| Compliance note | Operates under Nigeria Data Protection Regulations 2019 |

**The seven service lines** (each needs its own page):
1. HR Outsourcing — onboarding, performance, talent management, exit management
2. Business Process Outsourcing — incl. finance & accounting outsourcing, legal process outsourcing
3. Recruitment / Pre-Employment Background Check
4. Learning and Development
5. Payroll Management
6. Business Advisory Services
7. Technology Solutions — software development, digital transformation

---

## 2. What's wrong with the current site

Diagnose before prescribing. The current build isn't ugly — it's *inert*, and it undersells them.

**Credibility leaks (fix these in copy, they're free wins):**
- The homepage stat block says **"10+ Years Experience"** while the about page says incorporated in **2000**. That's 26 years being thrown away. Biggest single miss on the site.
- Stats disagree: homepage says "4000+ Seconded Employees", about page says "over 5,000 staff". Pick one number, source it, use it everywhere.
- "Projects" and "Blog" in the main nav link to `#` — dead links in the primary navigation.
- The footer "Youtube" link points at a Facebook profile URL.
- Copyright reads 2024 on some pages, 2026 on others.
- Testimonial typos: "personned", "conisttently", "hgh level". These are quotes from named executives at real companies — typos there read as carelessness with the client's words.
- Check whether "TOluwalase" is intentional brand styling or a data-entry error. Ask before "fixing".

**Structural problems:**
- Seven services presented as seven near-identical stacked blocks with `01`–`07` counters. No hierarchy, no way to self-select. A COO looking for payroll has to scroll past six things they don't want.
- 100+ clients and 26 years of work, and **zero case studies**. Fifteen logos in a row is not proof. The testimonials are strong — they're buried below six service blocks.
- No pricing signal, no engagement-model explanation, no "what happens after I contact you" beyond one line on the contact page.
- Careers and client acquisition are fighting for the same page. Job-seekers and enterprise buyers need separate funnels; right now the homepage's final CTA is aimed at job-seekers, which wastes the buyer's last scroll moment.
- Long unbroken paragraphs of service prose. Nobody reads them.

**Motion:** essentially none. Static images, no state, nothing that suggests a firm that operates in real time.

---

## 3. The strategic read (this is what the motion has to serve)

The buyer here is an HR director, COO, or country manager. They are about to hand a stranger responsibility for **thousands of people's livelihoods** and for their own statutory compliance exposure — PAYE, pension, HMO, NDPR. What closes that person is not sparkle. It's the unmistakable feeling of a firm that is **in total control at scale**.

So the site should feel like an **operations surface** — precise, instrumented, alive — not a consultancy brochure with animations bolted on. Every animated moment should say *we can see and handle 5,000 moving parts*. That's the thrill: competence made visible.

This also means: **no generic agency motion**. Fade-and-slide-up on every section, hover-lift on every card, a bouncy blob gradient in the hero — that's the template look, and a serious enterprise buyer reads it as a small shop trying hard. Spend the boldness in one place and keep everything around it disciplined.

---

## 4. The creative concept: **The Roster**

One idea, carried the whole way down the page.

5,000 people is the company's whole story. Render it literally: a field of **5,000 small marks**, one per managed employee, drawn on canvas. As the visitor scrolls, that same field of marks **reconfigures** — it never resets, it never re-enters, it *reorganizes*:

| Scroll position | The field becomes |
|---|---|
| Hero | Loose drift — a living population, marks breathing, faintly reactive to the cursor |
| Scale / proof | Collapses into a tight tabular grid; counters run up beside it (5,000 · 100+ · 26 · ISO 9001:2015) |
| Coverage | Redistributes into the outline of Nigeria + Benin Republic, denser at Lagos, Abuja, Port Harcourt |
| Services | Splits into seven columns, one per service line; the hovered service's column brightens and the others recede |
| Lifecycle | Flows along a single drawn path — hire → onboard → perform → develop → exit — as a continuous stream |
| Close (CTA) | Condenses into the TDL mark, then settles |

Because it's one continuous object, scrolling feels like watching an operation run rather than watching sections animate in. It is specific to this client — data plus people is literally their name — and it is not a thing you can get from a template.

**Guardrails on the concept:**
- It must degrade cleanly. On `prefers-reduced-motion`, the marks render in each section's final state, no transitions, no drift. On low-power or narrow devices, drop to 800–1,200 marks. Under `Save-Data`, render a static SVG of each state.
- It must never block reading. The marks live behind or beside content at low contrast — they are the instrument panel, not the message.
- Everything *else* on the page is quiet: sharp, disciplined typography, no secondary decoration, motion elsewhere only in response to a user action (opening a service, stepping through the form, dragging a testimonial).

**One alternative if the canvas work proves too heavy:** "The Ledger" — the whole site as a living operations ledger, with row-based layouts, tabular figures everywhere, and numbers that tick. Cheaper, still subject-grounded. Don't pursue both.

---

## 5. Design system

Propose, critique, then commit. Starting positions, not orders:

**Colour** — **approved 2026-09-18 after sampling the logo** (see `DESIGN-DECISIONS.md` for the sample, the three-ground comparison and the reasoning). The logo is cyan `#54C4D0`, olive `#606135`, lime `#A4CE3C` and a red tagline; none of the originally proposed values existed in the brand. Instrument palette, dark ground with one live-data signal, and the signal is now the logo's own people-colour:
- `--ink: #0F1B2D` — navy, the ground for hero and close; body text on paper
- `--paper: #FAFAF8` — reading sections
- `--olive: #606135` — the logo wordmark colour: rules, borders, secondary text on paper
- `--ink-light: #8D97B0` — secondary text and rules on ink
- `--signal: #54C4D0` — the logo cyan, used *only* for people and live/changing data: the Roster marks, counters, active service column, form progress. **Not the CTA** — the primary button is paper-on-ink / ink-on-paper
- `--signal-deep: #1C7580` — the same cyan darkened for live data on paper (`--signal` fails AA on paper)

Lime and red are not tokens; they live only inside the logo. An olive-black ground derived from the wordmark was considered and rejected: dark olive and khaki read as military and NYSC in Nigeria.

Deliberately avoided: cream-and-terracotta, near-black-with-acid-green, and gradient washes as decoration. Those read as generated. Green-and-white is also off the table — too literal a flag reference for a firm that operates in Benin Republic too.

**Type** — **approved 2026-09-18: one family, Archivo, varied by width.**
- **Archivo** variable, via `next/font/google` with `axes: ['wdth']`. Expanded (125) for display and the proof figures, normal (100) for body and UI, semi-condensed (~87) for data labels and captions, light (300) at normal width for testimonials and the MD's garden quote.
- Source Serif 4 was in the original plan for prose and testimonials and was cut: the sans-plus-serif pairing is the current agency default, and it costs a second font download on metered mobile. **Checkpoint at milestone 4:** if the garden quote and testimonials read cold at final size, add one serif scoped to quotes only.
- **All figures tabular lining.** Numbers are this company's product; they should align in columns everywhere they appear. Set `font-variant-numeric: tabular-nums` globally on data.
- Body line length under 75 characters. The voice setting gets extra line-height.

**Typographic don'ts** (these are the tells):
- No tracked-out ALL-CAPS eyebrow labels above headings. The current site's "What we do" eyebrow plus `01`–`07` counter is exactly this pattern — don't carry it over. Keep the numbering *only* where content is genuinely sequential (the lifecycle, the onboarding process, the multi-step form).
- No single accented word in a headline.
- No `→` glued onto button text.
- No meta strings joined with middle dots.

**Structure:** borders, rules and numbering must encode information, not decorate. A rule between two rows should mean those rows are a list; if it doesn't mean anything, delete it.

---

## 6. Stack

**Updated 2026-09-18 to match the installed Next.js 16.3.5.** The bundled docs in `node_modules/next/dist/docs/` win over anything here.

```
Next.js 16.3.5 (App Router, Turbopack by default, React Compiler on) + TypeScript (strict)
React 19.2
Tailwind CSS v4
motion (the `motion` package — successor to framer-motion) — installed, kept OFF the home route;
  CSS transitions for accordion, quote switching and form steps; use only where layout animation is needed
gsap 3.15 + ScrollTrigger + SplitText + DrawSVG, via the @gsap/react useGSAP hook
lenis for smooth scroll
Plain 2D canvas for The Roster. NOT three.js — this is 2D point work and WebGL is dead weight here.
shadcn/ui for form primitives only (input, select, dialog) — do not let its look define the site
react-hook-form + zod for validation
next/font/google for self-hosted Archivo (axes: ['wdth'])
app/sitemap.ts + app/robots.ts (built-in file conventions — NOT next-sitemap)
JSON-LD as a plain <script type="application/ld+json"> for Organization, LocalBusiness + Service schema
@next/bundle-analyzer — first-load JS per route, reported at the end of every milestone
Deploy: Vercel
```

What changed from the Next.js 15 version of this brief:
- `params`/`searchParams` are Promises — always `await`; use the generated `PageProps<'/services/[slug]'>` helper.
- `redirects()` with `permanent: true` returns **308**, not 301. Equivalent for SEO.
- `middleware.ts` is `proxy.ts` now (Node runtime only). Not needed for this site.
- `next lint` is removed; ESLint runs directly and `next build` does not lint.
- `next build` no longer prints First Load JS — hence the bundle analyzer.
- `next/image` defaults tightened: `qualities` is `[75]`, `16` removed from `imageSizes`, `remotePatterns` replaces `domains`.
- Next no longer overrides CSS `scroll-behavior` on navigation; with Lenis, set neither.
- `cacheComponents` (the new PPR) exists but stays off — all pages are static.

**GSAP licensing, so the agent doesn't get this wrong:** every GSAP plugin is now free, including for commercial use — since Webflow's acquisition there is no Club GSAP paid tier. Install from the public npm package (`npm i gsap`) and import plugins as `gsap/SplitText`, `gsap/DrawSVGPlugin`. Do **not** generate an `.npmrc` with a GreenSock auth token or reference `npm.greensock.com`; that guidance is outdated.

**On Aceternity UI:** it's copy-paste component source, not a dependency. Lift a specific effect if it earns its place, but don't let a component library set the visual identity — Aceternity components are widely recognisable and the point of this project is that TDL doesn't look like anyone else. Same caution for Magic UI.

---

## 7. Sitemap

```
/                          Home
/services                  Index — pick your problem, not our org chart
/services/[slug]           Seven pages: hr-outsourcing, business-process-outsourcing,
                           recruitment-background-check, learning-and-development,
                           payroll-management, business-advisory, technology-solutions
/work                      NEW — case studies (see §8)
/about                     Meet TDL: story since 2000, SPICE values, leadership, board
/careers                   Job-seeker funnel, separate from the client funnel
/careers/[role]            Individual openings
/insights                  Blog — the current one is a dead link; either build it or remove it from nav
/contact                    Address, map, direct lines
/become-a-client           Multi-step qualification form (the money page)
/certifications            ISO 9001:2015, quality policy + objectives PDFs, licences
/privacy  /cookies         NDPR-compliant, keep current legal text
```

---

## 8. Home page, section by section

1. **Hero.** Dark ink ground. The Roster drifting. One headline, set large in expanded Archivo, and it must say something only TDL can say — not "Optimize your business with our services". Direction: *"5,000 people go to work for our clients every morning."* Sub: one line on end-to-end HR and business process outsourcing across Nigeria and Benin Republic, since 2000. Primary CTA `Become a client`, secondary `See the services`. Headline reveals once, by line, via SplitText — a single orchestrated page-load moment, not a cascade of section entrances.

2. **Proof bar.** Four figures in tabular type, counting up on first view only: **5,000+** staff managed · **100+** clients · **26** years · **ISO 9001:2015**. Fix the 10-years error here. If the client can supply retention rate or payroll volume processed, add it — those are the numbers a COO actually weighs.

3. **Coverage.** The Roster becomes the map. Nigeria's states plus Benin Republic, with density at Lagos, Abuja, Port Harcourt. Copy: presence in all 36 states plus FCT, and cross-border. This is a genuine differentiator over Lagos-only competitors and no one is showing it.

4. **Services.** Reframed around the buyer's problem, not TDL's org chart. Seven rows; hovering or focusing one brightens its column in The Roster and expands a plain-language line about what it removes from your plate. Keyboard accessible, and on touch it works as an accordion. No `01`–`07` counters, no seven identical cards.

5. **Lifecycle.** A drawn SVG path (DrawSVG) scrubbed by scroll: hire → onboard → perform → develop → exit. Marks flow along it. This is where sequential numbering *is* legitimate. It makes "end-to-end" concrete instead of asserted.

6. **Case studies.** The gap that costs them most. Three, built from what's already public: Carlcare (formalised HR policy and employment records during Nigeria's compliance tightening, 10+ year partnership, freed them to focus on after-sales for TECNO/Infinix/itel/Oraimo); Chi Limited (supply chain and logistics staffing at scale); Transsnet Music (HR operations and compliance). Each: situation → what TDL ran → outcome. **Get the client to confirm every claim and approve each named reference before publishing.** Where a number is missing, say what was done rather than inventing a percentage.

7. **Testimonials.** Three strong ones already exist from named executives. Move them up. Draggable, snap-scrolling, with the quote set in Source Serif at generous size. Fix the typos with the client's permission. Show the logo and the person's title — the attribution is the proof.

8. **Client logos.** Fifteen exist. Infinite marquee, grayscale to colour on hover, pauses on hover and on reduced-motion. This is a supporting detail, not a centrepiece.

9. **Close.** Aimed at the *buyer*, not the job-seeker. The Roster condenses into the TDL mark. One CTA: `Become a client`. Careers gets its own entry point in the nav and footer, not the final homepage scroll position.

---

## 9. The conversion path

This is the actual point of the project. Currently a five-field form and "we'll contact you within 24 hours."

**`/become-a-client` — a three-step form.** Step 1: what do you need (the seven services, multi-select) and how many staff are involved. Step 2: your organisation — name, industry, location, current arrangement. Step 3: you — name, role, email, phone, preferred contact time. Progress in signal amber. Motion here is functional: it shows what changed as you advance. Each step should feel like it costs nothing to answer.

Then set expectations concretely: *what happens next, in order* — a call within one business day, a scoping session, a proposal inside five working days. Nobody else in this market states a process; stating one is a trust advantage.

**Also add:** a sticky, quiet CTA in the header on scroll; WhatsApp and direct phone as first-class options (a Nigerian enterprise buyer will often reach for WhatsApp before a form); every service page ends with a CTA scoped to that service, pre-filling step 1; downloadable one-pagers per service line in exchange for an email, if the client wants a nurture list.

---

## 10. Non-negotiables

**Performance.** The primary audience browses on mobile, often on metered data. This constrains the design and the agent must treat it as a hard requirement, not an afterthought.
- LCP under 2.5s on simulated 4G; CLS under 0.1; INP under 200ms
- First-load JS under 200KB gzipped. Lazy-load GSAP plugins and the canvas per-route; never ship them on `/privacy`
- Canvas: `requestAnimationFrame` with a frame budget, particle count scaled by `devicePixelRatio`, viewport width and `navigator.hardwareConcurrency`; pause entirely when off-screen via IntersectionObserver; suspend on tab blur
- AVIF/WebP with `next/image`, explicit dimensions on everything
- Test on a throttled mid-range Android profile, not just a laptop

**Accessibility.**
- `prefers-reduced-motion: reduce` kills all non-user-triggered motion, including the canvas drift and the counters. It is not an afterthought path — build it as a first-class branch.
- Visible keyboard focus everywhere. The services interaction, the testimonial carousel and the multi-step form must all be fully operable by keyboard.
- AA contrast minimum, verified on the dark ground.
- Canvas gets `aria-hidden="true"`; every state it depicts is also stated in text.
- Semantic headings, real landmarks, labelled form fields with inline error text that says how to fix the problem.

**SEO.** Preserve every existing URL or 301 it — they have years of indexing on `/services/...` paths. Unique title and meta per page. JSON-LD for Organization, LocalBusiness and each Service. Sitemap and robots. The current site reuses one canonical and one meta description across every page; fix that.

**Legal.** Keep the NDPR consent language. Cookie consent before any analytics fires.

---

## 11. Copy rules for the agent

- Plain verbs, sentence case, active voice. A CTA says what happens: `Become a client`, not `Submit`.
- Cut the existing marketing abstraction. "Unlock Potentials with Our Unparalleled HR Solutions" becomes something a COO would say out loud. Every service headline should name the thing it removes from the buyer's plate.
- Keep the MD's garden quote — it's a real human voice and rare on a site like this. Give it space.
- Never invent a statistic, a client name, or an outcome. Where a number would help and doesn't exist, mark it `TODO(client)` and list it in a handoff file so the user can go ask.

---

## 12. Milestones — do these in order

1. **Plan.** Design plan + self-critique. Stop for approval.
2. **Foundation.** Next.js scaffold, Tailwind v4, fonts, design tokens as CSS custom properties, layout primitives, header/footer, reduced-motion infrastructure. No content yet.
3. **The Roster.** Canvas component in isolation with a dev harness that lets you jump between states. Get performance right here, before it's entangled with page content. This is the highest-risk piece — prove it early.
4. **Home page.** All nine sections, wired to The Roster. Screenshot and critique against §3 and §5 before moving on.
5. **Conversion.** `/become-a-client` three-step form, validation, submission handler, success state. Service-scoped CTAs.
6. **Services.** Index plus seven detail pages from one well-structured template with real per-service content.
7. **Remaining pages.** About, work, careers, contact, certifications, legal.
8. **Hardening.** Lighthouse, axe, throttled-mobile pass, keyboard pass, reduced-motion pass, redirect map, JSON-LD, sitemap.
9. **Handoff.** `HANDOFF.md`: content the client still owes, every `TODO(client)`, the claims needing sign-off, and how to edit copy without touching code.

---

## 13. Skills worth installing

Verified install commands:

**GSAP — official GreenSock agent skills.** The one that matters most here. Covers core, timelines, ScrollTrigger, plugins, the React `useGSAP` hook, and performance — and it explicitly corrects the outdated Club GSAP licensing guidance that models still generate.
```bash
npx skills add https://github.com/greensock/gsap-skills
```

**`frontend-design`** — visual direction, typography, avoiding the templated look. Already available in Claude chat; for Claude Code:
```bash
npx skills add https://github.com/skillcreatorai/Awesome-Agent-Skills --skill frontend-design
```

**`webapp-testing`** — Playwright-driven verification so the agent can screenshot its own work and critique it. Genuinely raises output quality on a visual project; without it the agent is designing blind.
```bash
npx skills add https://github.com/skillcreatorai/Awesome-Agent-Skills --skill webapp-testing
```

In your Claude plugin catalog, two are relevant: **Design** (critique, design-system management, accessibility audits, dev handoff) and **Modern Web Guidance** (current web best practices). Both are worth enabling for this project.

For **Motion** (framer-motion) I didn't find an official first-party skill — point the agent at `motion.dev` docs directly, and note the package is now `motion`, not `framer-motion`. **Aceternity UI** is copy-paste source rather than an installable skill; see §6 on why to use it sparingly here.

Also add a project `CLAUDE.md` with the short version of §5, §6 and §10 — tokens, stack, performance and accessibility budgets. Agents drift on long documents across sessions; the budgets need to be in front of it on every turn.

---

## 14. Before you start — three things to get from the client

1. **Brand assets.** Logo in SVG, any existing brand guideline, the correct hex values. Everything on the current site is a PNG.
2. **The numbers.** Is it 4,000 or 5,000+ staff? Confirm 2000 as incorporation year. Any retention, time-to-hire or payroll-volume figures they'd let you publish.
3. **Reference approvals.** Written sign-off to name Chi Limited, Carlcare and Transsnet Music in case studies, and permission to correct the typos in their executives' quotes.

Without #1 the palette is guesswork, and without #3 the strongest section on the new site can't ship.
