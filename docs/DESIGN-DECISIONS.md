# Design decisions log

Running record of design decisions, the critique that produced them, and what was overridden from `TDL-REVAMP-BRIEF.md`. Newest at the bottom. Approved by the project owner unless marked otherwise.

## 2026-09-18 — Milestone 1 plan critique

Test applied to every decision: *would this have been produced for any HR consultancy brief?* Where yes, it was revised.

| Decision in the brief | Generic? | Revised to | Why |
|---|---|---|---|
| Amber signal `#F2A93B` | Yes | Logo cyan `#54C4D0` | In the logo, cyan is the people. The Roster's marks are people. Signal colour and marks are the same thing |
| Structure blue `#2F5DA8` | Yes | Logo olive `#606135` | Rules, borders and secondary text on paper carry the brand's own ink |
| Archivo + Source Serif 4 | Yes (sans-plus-serif is the current agency default) | Archivo alone, width axis as the second voice | One family varied by width is how ledgers are set. Checkpoint at milestone 4: if the MD's garden quote and testimonials read cold at size, add one serif scoped to quotes only |
| Two hero buttons | Yes | Primary button + plain underlined link | The ghost-button pair is template grammar |
| Stats row with count-up | Yes | The counter reads the number of marks that have landed in the grid | Ties the number to the concept; no separate counter animation |
| Draggable testimonial carousel | Yes | Attribution list as a tablist control, one quote shown large; scroll-snap on touch | Puts the proof (who said it) in the interface; keyboard operable by construction |
| Infinite logo marquee | Yes, and it contradicted the brief's own rule that non-canvas motion only follows a user action | Static grid of the 15 logos, captioned with the count | Rule wins |
| Sticky header CTA | Yes | Header carries a status line stating what the Roster currently shows | The accessibility text becomes the design's own voice |
| Service rows with icons | Icons are the tell | Names and one line each, no icons | — |
| Lime `#A4CE3C` and red `#EA2126` from the logo | Lime on near-black is the banned acid-green look; lime fails 3:1 as a stroke on paper | Not tokens. Live only inside the logo | — |

Kept because specific to TDL: The Roster, the coverage map, the lifecycle path (the one legitimate place for numbering), tabular figures, case studies as situation → what TDL ran → what the client said.

### Logo sample (`https://totaldatalimited.com/images/marketing/rebrand0623/home/logo.png`, 885×268)

| Element | Hex | Share of opaque pixels |
|---|---|---|
| Circles ("heads") | `#54C4D0` cyan | ~14% |
| Wedges ("bodies") and wordmark | `#606135` olive | ~30% |
| Arc | `#A4CE3C` lime | ~6% |
| Tagline | `#EA2126` red | <1% |

None of the brief's proposed values exist in the brand.

## 2026-09-18 — Ground colour

The plan first proposed an olive-black ink derived from the wordmark (`#1F2113`) on the grounds that navy fits any enterprise brief. The owner flagged that dark olive and khaki carry military and NYSC associations in Nigeria, and this site sells employment services to Nigerian executives. Three grounds were built side by side in `explorations/ground-comparison.html` with identical type, layout and content, and every text/ground pair was checked for AA.

| Ground | Ink | Result |
|---|---|---|
| (a) Olive-black | `#1F2113` | Rejected. The ground alone is tolerable, but the secondary text it forces (`#AFB08D`) is unmistakably khaki; the proof bar reads NYSC |
| (b) Teal-black | `#122326` | Rejected. Marks sit inside the ground's own hue and lose object-ness; lands on the dark-dashboard look |
| (c) Navy | `#0F1B2D` | **Approved.** Marks separate cleanly (hue 222° vs 186°); olive rules and secondary text sit comfortably; institutional read is right for this buyer |

All three passed AA on every pair (lowest: 5.04 for `--signal-deep` on paper; 5.91 for secondary text on navy).

**Correction to the (b) finding.** The first comparison render backed the canvas at CSS pixels with no `devicePixelRatio` scaling, so all three heroes rendered soft. Re-rendered at 2× with a DPR-backed buffer, the teal marks are crisp individual objects; the "glow rather than population" read was partly a rendering artifact, not purely a colour finding. What survives at 2×: the teal ground is still monochrome with the marks and still reads as a generic dark-mode surface. The navy decision stands, but on the weaker version of the argument. The same DPR bug would kill the real Roster; it is now a hard rule in `AGENTS.md`.

Concession recorded: the ground is now something that would be produced for any HR consultancy. The specificity is carried by what sits on it — cyan reserved for people and live data, olive for structure, the Roster, the type, the status line.

## 2026-09-18 — `--signal` and the primary CTA

The rule "`--signal` is the marks and only live/changing data" conflicted with the primary CTA being a filled cyan button. Resolved: **cyan stays purely people and data.** The primary action is a filled `--paper` button with `--ink` text on dark grounds and a filled `--ink` button with `--paper` text on paper. Form progress stays cyan because it is live data.

Why this way round: the rule's value is its strictness. When the buyer sees cyan anywhere on the site, it is always a person or a number that is live. One exception for the CTA would make cyan mean "important" instead, which is what every site's accent colour means. A paper-on-navy button also reads more institutional than a bright one, which suits the buyer.

## 2026-09-18 — Archivo-only font budget, measured

The plan claimed Archivo-only would save "~60–90 KB" against Archivo + Source Serif 4. Measured against the Google Fonts API with a Chrome UA, latin subset only (the files `next/font/google` downloads at build), woff2 bytes as transferred:

| Composition | Files | Total |
|---|---|---|
| Archivo variable, `wdth` + `wght` (the plan as written) | 1 | **84.2 KB** |
| Archivo variable `wght` only + Source Serif 4 variable `wght` (the original brief) | 2 | **72.9 KB** |
| Archivo variable `wght` (width 100) + Archivo Expanded 700 static instance | 2 | **44.5 KB** |
| Archivo variable `wght` + Archivo Expanded variable `wght` (600–700 display) | 2 | 63.2 KB |
| Source Serif 4 with the `opsz` axis instead of `wght` only | — | +57 KB on top of any row above |

Findings:
- **The claim was wrong.** The width axis alone costs 52 KB (31.8 → 84.2 KB). The plan as written is 11 KB *heavier* than the serif pairing it replaced.
- Google serves one variable-`wght` file for any list of discrete weights; "static weights" do not exist for these families through the API, so requesting fewer weights saves nothing.
- Google only serves a static instance for width 125 (Archivo Expanded). There is no static instance for width 87, so the semi-condensed "data" width is only available by shipping the full axis.

Recommended composition, pending approval: **Archivo `wght` at width 100 + one static Archivo Expanded 700 instance (44.5 KB, two files).** Drops the semi-condensed data width (labels use width 100 at small size) and the 600 display weight. Still one family varied by width. 28 KB lighter than the original pairing, 40 KB lighter than the plan as written. The expanded instance is self-hosted through `next/font/local` from the API's static file, since `next/font/google` `axes` only requests full ranges.

**Approved 2026-09-18:** Archivo `wght` at width 100 + static Archivo Expanded 700 (44.5 KB). The type table in `AGENTS.md` is now two widths, not three. `frontend-design` skill deliberately not installed — AGENTS.md carries the design direction and a second voice on aesthetics is unwanted.

## 2026-09-18 — Milestone 2, foundation: judgement calls

- **Existing URLs preserved, not redirected.** The live site's service slug is `human-resources-outsourcing`, not the brief's `hr-outsourcing`; `/about-us`, `/contact-us`, `/careers`, `/privacy-policy`, `/cookies-policy` also exist. All are kept as the canonical URLs (preservation beats a 308). Only `/new-client` → `/become-a-client` and `/Blog` → `/insights` redirect.
- **Hero headline.** Three tenure variants were drafted: (A) "Every morning since 2000, our clients' people have gone to work through us." (B) "Since 2000, we have run the workforce behind our clients' business." (C) "Our clients' people have clocked in through us every morning since 2000." **A is the default** in `facts.ts` — it keeps the daily-operation image of the headcount version and puts the tenure first. The 5,000 version sits beside it pending Q1.
- **Header is always navy.** A transparent-over-hero header that fills on scroll is the template move and complicates the status line; a constant navy strip reads as the instrument panel it is.
- **Interim logo.** The header shows the people-mark cropped from the PNG plus the name set in type, because the PNG wordmark is 2.5:1 on navy. Replaced when Q16 lands.
- **First-load measurement.** `scripts/first-load.mjs` starts the production server, fetches each route and sums gzipped bytes of every module script (excluding the `nomodule` core-js polyfill that module browsers never download). Baseline with an empty page: **141.7 KB gzip** — react-dom 69.9, App Router runtime 44.0, the rest small. That is the framework floor on Next 16 / React 19.2 canary; the 200 KB budget leaves ~58 KB for everything else.
- **`motion` is not imported anywhere.** The home route's interactive pieces are CSS transitions.

## 2026-09-18 — Milestone 3, The Roster: judgement calls and proofs

- **GSAP-free canvas.** Positions are a pure function of scroll (state index + progress from slot rects), so ScrollTrigger would add ~14 KB for nothing. GSAP is used where it earns its place: SplitText (hero) and DrawSVG (lifecycle path).
- **Document-space anchoring.** Every layout is computed in document coordinates from its slot's rect; the fixed canvas draws at `y - scrollY`. Marks therefore travel with the page between slots, and an iOS toolbar collapse (which changes `innerHeight`, not the document) cannot dislocate them.
- **Reading-order sort.** Every layout is sorted by (y, x) so mark *i* is a spatial neighbour of itself across states; transitions move in sheets instead of tangling.
- **Canvas z-order.** The canvas sits *above* section backgrounds (z-20) and below the header (z-40), pointer-events none. Slots are placed where there is no text; marks may cross text briefly mid-transition, which is accepted.
- **Save-Data: no canvas at all.** The brief's "static SVG per state" was there to avoid shipping the canvas JS; the status line and section captions already state every state in text, so under Save-Data the Roster chunk is simply never loaded. Cheaper than pre-rendering six SVGs and the same intent.
- **Renderer.** Per-mark `drawImage` measured 17–28 ms/frame at 5,000 marks @2× in headless Chromium; batched path fills grouped by colour × 8 alpha steps measured ~2 ms. Shipped the batched version: **2.8–4.8 ms work per frame** across all states, 3× under the 12 ms budget, before GPU rasterisation.
- **Mark colours in the final state.** Heads are `--signal`, bodies and arc are `--ink-light`. Lime stays out of the palette; the Roster depicts the mark's shape, it does not reproduce the logo asset.
- **Column highlight.** Active column draws in `--signal-deep` at full alpha on paper; the other six at 0.55×.

### Proofs (headless Chromium 1228, production build, `scripts/roster-proofs.py`)

| Proof | Result |
|---|---|
| Every state reachable, 2× DPR | All six render crisp; n = 5,000 at 1280×900, 935 at 390×664 |
| Scroll-fling snap | Lenis fling from hero to end: `snapped=true`, states seen `drift → columns→path → mark`. Never passed through grid or map. Threshold 2.5 viewport-heights/s reads Lenis's target scroll |
| Scrollbar-drag equivalent (instant jump) | States seen `drift → mark`, nothing between |
| Viewport resize mid-scroll (address-bar analogue) | Buffer 1328 → 1488 → 1328 device px, CSS height follows `innerHeight`, scrollY unchanged, no errors |
| `useGSAP` under React Compiler | Harness title SplitText runs; `react-hooks` compiler rules pass lint; no runtime errors. One compiler rule caught a ref write during render in the Roster, fixed to an effect |
| Reduced motion | Mode `static`, no loop, states quantised, Lenis not mounted |

**Not proven here:** real iOS Safari. Playwright's Chromium resize exercises the same code path (resize → re-buffer → re-measure), but the iOS toolbar transition, rubber-banding and `position: fixed` repaint behaviour need a device. Flagged at the milestone-3 stop.

## 2026-09-19 — Open risk: iOS Safari and the fixed canvas

Verified only programmatically (Playwright Chromium viewport resize mid-scroll) and in Chrome DevTools at iPhone dimensions. **Unverified on a real device:** the address-bar collapse transition, rubber-band overscroll, and `position: fixed` repaint behaviour in iOS Safari. Milestone 4 proceeds on the programmatic proof. To keep a later device fix contained, all viewport reads and canvas sizing live in `src/components/roster/viewport.ts` behind one interface; the Roster itself never touches `innerHeight`, `visualViewport` or the canvas element's size. A real-device fix is a change to that file, not to the layouts or the frame loop.

## 2026-09-19 — Milestone 4, the home page

### Graphics built, with the concept and the information each carries

- **Coverage outline** — the two national outlines the population fills; the marks are the people, the line says which country. Carries: Nigeria and Benin Republic as distinct territories, their relative size and position. Same projection as the Roster's map layout (`mapGeometry()`), so marks and line coincide. No hotspots, no state count (Q7/Q8).
- **Lifecycle line** — one continuous line with five numbered stops; the population streams along it. Carries: the sequence of the employment lifecycle and what TDL runs at each stage. The only place numbering is used, because the content is sequential. Server-rendered in a 1000×300 box and re-fitted to the slot on the client (Catmull-Rom is affine-invariant, so the stream and the line agree at any size); DrawSVG scrubs it with scroll.
- **Proof figures** — not a graphic, but the two counting figures are a readout of the Roster: they show the share of marks that have landed in the grid. On tall screens where the grid slot is already visible at load, the drift → grid transition runs once on a 1.4 s timer ("count up on first view only"); everywhere else it is scroll-driven.

Nothing else was drawn. No icons on service rows, no decorative figures.

### Judgement calls

- **Header status line is the text twin on desktop; on phones each section's caption carries it** (the header has no room). Both read from `rosterStatusText`.
- **Testimonials**: tablist of attributions as the control, one pull-quote large in the voice setting, "Read the full quote" expands the verbatim text. Scroll-snap on touch was dropped: the tablist works on touch as plain buttons and a second mechanism for the same content is noise.
- **Client logos** are `mix-blend-multiply` so their white PNG backgrounds disappear into paper; greyscale at rest.
- **Lifecycle headline** avoids "employer of record" — a specific legal term the client has not used — in favour of "One employer".
- **Slot placement** keeps marks off text at rest; mid-transition crossings (e.g. the close on phones) are accepted.
- **Services lead line** "Seven things we take off your desk." names the reframing the brief asked for.

### LCP, verified with Lighthouse rather than by eye

The headline is the LCP element in every run (`largest-contentful-paint-element` = `h1#hero-headline`). Findings, in order:

1. **SplitText on the h1 itself cost 3.5 s of render delay** on simulated 4G: splitting the LCP element and reverting it re-inserts its text and registers a fresh LCP candidate after hydration. Fixed: the reveal animates an `aria-hidden` clone laid over the h1; the original only ever receives a `color` style. Verified: disabling the reveal entirely gives the same LCP as leaving it on.
2. **Main-thread work after hydration** (all six layouts computed synchronously, map by rejection sampling): TBT 400 ms. Fixed: Roster mounts on `requestIdleCallback`, layouts compute on demand and warm in idle time, the map is rasterised once by scanline fill. TBT 150–300 ms.
3. **GSAP chunks started at hydration** and competed with the fonts for bandwidth. Fixed: the reveal chunk loads on idle, the DrawSVG chunk when the lifecycle section is within 1.5 viewports. The header logo was preloaded at 1080 px for a 34 px slot; `sizes="120px"` fixed it.
4. **Inlining the display face as a data URI was measured and rejected**: FCP +0.3 s (15 KB more render-blocking CSS), LCP unchanged. Unpreloading the body font: no change. Both reverted.
5. **What remains is the framework floor.** Observed (unthrottled) LCP equals FCP in every run — the h1 is painted once. But that first paint lands after the async framework chunks have executed (DCL 75 ms, FCP ~370 ms), so Lighthouse's Lantern model treats the 142 KB of React/Next bootup as an LCP dependency and bills it at 4G speed. Under applied CDP throttling (150 ms RTT, 1.6 Mbps, 4× CPU) in Chromium, LCP is **1.4 s**; in Lighthouse's default simulated preset it is **2.7–3.1 s** run to run; in Lighthouse's applied mode (which uses a 562 ms RTT) FCP alone is ~3 s.

**Budget status: the brief's "LCP < 2.5 s on simulated 4G" is not met in Lighthouse's default model, by 0.2–0.6 s, and the residual is React 19.2 + Next 16 hydration contending with first paint, not page code.** Levers left are structural: fewer client components on the home route (Header, Proof, Services, Testimonials are client), or a smaller framework. Flagged at the milestone-4 stop as a blown budget.

Desktop: perf 100, LCP 0.6 s, CLS 0.004, TBT 0–20 ms. Accessibility 97 on both (the 3 points are the `link-in-text-block` audit on underline-only links, which meet WCAG via the underline; to revisit).

### Measurement hygiene learned the hard way

Lighthouse headless Chrome instances leak under the server helper on Windows; 37 of them (4.8 GB) made TBT climb 630 → 4,580 ms across three runs. `scripts/lh-mobile-x3.sh` kills Chrome between runs. Treat any Lighthouse run with TBT > 600 ms on this page as suspect until repeated.

### First-load JS, `/`

151.4 KB gzip = floor 141.7 + **9.7 KB own code** (budget 60). Lazy after idle: GSAP core + SplitText ~27 KB, DrawSVG + ScrollTrigger ~19 KB, Roster ~17 KB, Lenis ~11 KB. `motion` is not imported anywhere.

## 2026-09-19 — LCP: the bounded investigation, and the working number

Three checks, all clean:

1. **The h1 is in the initial HTML** at byte 8.9 KB of the response, with no client-component boundary (`<template>`/`<!--$?-->`) ahead of it.
2. **Archivo Expanded 700 is `font-display: swap`** in the generated `@font-face` (all four faces are swap). Nothing blocks on a font.
3. **Render-blocking ahead of first paint:** one stylesheet, 28.8 KB raw / ~7 KB gzip. Preloads: the two font files and the header logo (now `sizes="120px"`).

Two further findings from an elimination test (`scripts/fcp-elimination.py`, unthrottled, `--headless=new`):

- **My earlier "observed" paint timings were unreliable.** Legacy headless at DPR 2.6 reported first paint at 408–1,160 ms; under `--headless=new` at DPR 1 the same page paints at 130–190 ms. The Lighthouse figures (which use new headless) were never affected; the Playwright timelines were.
- **The idle-mounted chunks were landing ahead of the first paint** — `requestIdleCallback` fires before the first frame when the main thread is quiet — costing ~60 ms of FCP ("lazy chunks blocked" 124 ms vs "nothing blocked" 188 ms). Fixed with `useAfterFirstPaint()`: two animation frames, then idle. After: 168 ms both ways. The ~50 ms left to "all chunks blocked" is hydration itself.

Final numbers after the fix:

| Measurement | FCP | LCP | Notes |
|---|---|---|---|
| Chromium, applied 150 ms RTT / 1.6 Mbps / 4× CPU | 1.18 s | **1.18 s** | one LCP candidate, the h1, at first paint |
| Lighthouse mobile, default simulated, 3 runs | 0.9 s | 2.8–3.0 s | perf 93–95, TBT 110–180 ms; observed FCP = observed LCP in every run |
| Lighthouse desktop | 0.2 s | 0.6 s | perf 100 |

Why the simulated figure stays high: Lighthouse's Lantern model takes the unthrottled trace, finds every request that finished before the observed LCP paint, and treats them as its dependencies. On localhost all 142 KB of framework JS finishes in ~50 ms — long before any paint at ~250 ms — so the model bills the framework bootup to LCP at 4G speed even though the browser never waited on it. It is a property of measuring a fast origin, not of the page.

**Working number, accepted 2026-09-19: LCP 1.18 s under applied 4G throttling in Chromium.** The simulated-preset figure is recorded, not targeted. Header, Proof, Services and Testimonials stay client components; the interaction model is worth more than the hydration shave.

## 2026-09-19 — Home page review fixes

- **Proof bar rendered "0+" to the client.** The HTML always carried the final values, but the client set the counters to 0 while the Roster was in its drift state — so anyone who had JS and hadn't scrolled to the grid saw "0+", and the full-page captures did too. Now the count-up is a layered enhancement: final values until the figures enter the viewport, then one 1.4 s ramp from 0, pulled ahead by the Roster's own arrival progress when the marks land faster. Reduced motion: final values, no count. Checked the rest of the page: the counters were the only animated value.
- **Lifecycle was a sine wave.** Hire on a crest, Onboard in a trough, Perform on a crest — the stops alternated because that is where the curve was. It failed the graphic rule (swap the labels, nothing changes). Rebuilt as a left-to-right band through five stages that narrows to 55% of its starting height by the exit, marks at even density per area so the count per stage falls with the taper: the population thins slightly at each stage, which is true of any employment lifecycle without client data. Straight edges and dashed stage ticks; the same fractional geometry serves the SVG and the Roster's flow layout. Captioned "not to scale". Same graphic on phones.
- **Seven equal columns asserted an even headcount split.** Chose to make them visibly non-quantitative rather than vary them from an invented figure: rules span all seven at top and bottom so equal heights read as lanes of a register, not bars of a chart, and the caption says "Lanes group people by service line. They are not headcounts." Q28 asks TDL for real shares if they exist. Inventing a split is the thing the brief bans.
- **Client logos vanished.** Sources are 247×166 PNGs with inconsistent padding, weight and resolution. `scripts/trim-logos.mjs` trims each to its ink (transparent and white padding removed, white backgrounds made transparent); display height follows an optical rule (52/√aspect, clamped 26–46 px) so compact marks and wide wordmarks carry comparable ink; treatment is greyscale darkened to 55% with multiply on paper. A flat ink silhouette was tried first and rejected: MTN's yellow oval and TGI's green box became blobs. Q17 is now blocking for launch.
- Apostrophes normalised to typographic (’) in every content string, including inside attributed quotes (typesetting, not wording).
- Service rows: the seven "Open" labels replaced by a light `+` that rotates to `×` when open.

### Photography (rule extended in AGENTS.md)

- Testimonials: an 88 px portrait frame per executive, reserved and reading "Portrait to come" until the real headshots arrive (Q26). The company logo is now small beside the company name, not standing in for the person.
- Home, before the close: a 16:9 frame reserved for one real photograph of TDL's team or the Ilupeju office (Q27), captioned with the address, visibly empty until then.
- `/about-us` (milestone 7) is planned around real photography: leadership and board headshots at 4:5, office exterior and interior and staff at work at 3:2 (Q18). Spaces will be reserved the same way.
- The hero stays abstract; nothing photographic above the fold.

## 2026-09-19 — Milestone 5, `/become-a-client`

Three steps (brief §9): what you need and how many people; your organisation; you. Progress is three segments in `--signal-deep` — the one live element on the page. Step panels slide 12 px in the direction of travel, 200 ms, user-triggered, off under reduced motion. Focus moves to the new step's heading; every control is native and labelled; errors are inline text that says how to fix it; the whole flow was driven by keyboard in `scripts/form-proof.py`.

### Judgement calls

- **Native form controls, not shadcn/ui.** The brief lists shadcn for form primitives. The form needs inputs, selects, radios and checkboxes; on the phones this audience uses, the OS picker for a native `<select>` beats any JS listbox, and native controls carry no library look to fight. `src/components/ui/field.tsx` styles them with the tokens. shadcn stays an option for a dialog if one is ever needed. No visual identity is defined by a library.
- **No `@hookform/resolvers`.** A ten-line resolver bridges react-hook-form and zod 4.
- **`zod/mini`, not `zod`.** The full build put 106 KB of own code on the route (over budget by 46 KB); the tree-shakeable functional build brings the route to 32.6 KB own code. The schema is shared by the client (per-step `trigger`) and the server action (whole submission again).
- **react-hook-form under the React Compiler.** The compiler's lint flags it as an incompatible library — its `formState` is a read-tracking proxy that auto-memoisation can fail to subscribe. `EnquiryForm` carries `"use no memo"`; the rest of the app stays compiled.
- **The route stays static.** Reading `?service=` on the server made it dynamic (a function per visit); the preselection is read on the client inside a Suspense boundary instead, so a service page's scoped CTA (`/become-a-client?service=payroll-management`) still pre-ticks the service.
- **Delivery (Q20).** The server action re-validates and posts JSON to `FORM_WEBHOOK_URL` (`.env.example`) — any inbox, CRM or automation endpoint, no provider dependency. In development it logs. In production with nothing configured it refuses honestly and points to WhatsApp and the phone; nothing is silently swallowed. A hidden honeypot field discards bots as a fake success.
- **The success state promises only what the client has published (Q12):** the 24-hour line, then "we talk through [the services you chose]". The proposal-in-five-days step from the brief is not stated until approved.

### Proofs (`scripts/form-proof.py`, desktop and 390 px)

Pre-selection from the query string; step 1 refuses without a headcount and names it; radio chosen by keyboard; focus lands on "Your organisation"; step 3 refuses a malformed email and an unticked consent with fix-it messages; with a local webhook the payload arrives as JSON and the success state renders; without one, the fallback message renders. No page errors.

### First-load JS

`/` 151.9 KB (own 10.2 KB). `/become-a-client` 174.3 KB (own 32.6 KB: react-hook-form ~19, zod/mini + schema ~6, form ~8). Budget: floor + 60 KB.

## 2026-09-19 — Placeholder imagery for presentations; no CMS

- **`PLACEHOLDER_IMAGES`** (default off) fills the non-person photo frames with licensed Pexels stock of Lagos workplaces, each rendered with a visible "Placeholder — TDL photography required" label and a credit. `next.config.ts` throws when the flag is true on a production target (Vercel production, or any local production build not marked `PLACEHOLDER_PRESENTATION_BUILD=1`), so it cannot ship by accident — proven: the flagged production build exits 1 with the message; the presentation build renders the labelled image; the default build renders the empty frame with no placeholder markup. Registry and attribution: `PLACEHOLDERS.md`, `src/content/placeholders.ts`. Unsplash+/Getty results were excluded (paid licence).
- **Named-person frames never take a placeholder key** — testimonial portraits now, leadership and board at milestone 7. A stock face under a real name invents a person.
- **No CMS or database.** Content stays in `src/content/`; the site is static and the form already delivers to a webhook. `HANDOFF.md` records when it would become worth revisiting (careers listings if TDL posts regularly; check their existing ATS/CRM first) as a phase-two conversation, not a gap.

## 2026-09-19 — Milestone 6, services

- **Content is the live site's, restructured.** Each of the seven service pages on totaldatalimited.com lists its sub-services; those became `lines` in `src/content/services.ts`, each rewritten in plain verbs with the substance unchanged (e.g. "Executive Poaching" → "Executive search: senior leaders identified, approached and assessed"). Nothing was added that the client has not published. All of it is Q23.
- **One template, seven pages.** The headline is what the service removes from the buyer's plate; the Roster shows the population by service line with this service's lane lifted — where you would sit among the seven — captioned "not headcounts" like the home lanes. Sub-services are ruled rows (a list). The close is scoped: `Become a client` links to `/become-a-client?service=<slug>` and says so under the button. Then the other six, so the page never dead-ends.
- **Index** leads with the brief's own line, "Pick the problem, not the org chart", the lanes, and the seven as rows naming what each removes and its lines of work. A middle-dot-joined list slipped in and was replaced with commas (banned tell).
- **JSON-LD**: the index emits all seven `Service` nodes; each page emits its own.
- **First-load JS**: `/services` and each service page carry 2.8–2.9 KB of own code; the Roster (~17 KB) loads after first paint. `/` 153.6 (own 11.9), `/become-a-client` 176.1 (own 34.4).

## 2026-09-19 — Scroll trap after client-side navigation (fixed, regression-tested)

Reported: scrolling down stopped at the coverage map after coming back from another page; scrolling up worked. Reproduced in Playwright with real wheel events: arriving at `/` from `/services`, scrolling stopped at **1231 px — exactly `/services`' maximum scroll**; from `/become-a-client`, at 801, that page's maximum. Fresh loads and the home → services → home direction never trapped, which is why it looked intermittent.

Cause: Lenis recomputes its scroll limit only when its ResizeObserver on `document.documentElement` fires, and `create-next-app`'s `<html class="h-full">` pinned the html box to the viewport height, so the box never reported growth. After a client-side navigation to a longer page the limit stayed at the shorter page's value and every wheel scroll was clamped to it. Native scrolling (End key, scrollbar) bypassed Lenis, then resynced — hence upward free. Not a pin, not a snap, nothing in the Roster or ScrollTrigger.

Fix: `h-full` removed from `<html>` (body is `min-h-dvh`), and `SmoothScroll` calls `lenis.resize()` on every pathname change, once immediately and once 600 ms later. Regression test `scripts/scroll-proof.py` (`npm run test:scroll`): three Roster routes × slow and fling wheel × 1280 and 390 px × Lenis on and off, plus both navigation directions and the End key; asserts the footer is reached. 60 checks, all passing; the four short → long cases failed before the fix and pass after.

## 2026-09-19 — Placeholder guard: one rule everywhere

Reported: a Vercel build with both `PLACEHOLDER_IMAGES=true` and `PLACEHOLDER_PRESENTATION_BUILD=1` set still failed. Cause: the first version refused any `VERCEL_ENV=production` build unconditionally, before consulting the marker — deliberate at the time ("never on a production deployment"), but it made the escape hatch behave differently on Vercel than locally, and the message didn't say which branch had fired. The failing build was a Production deployment; a Preview would have passed.

Rewritten: both variables read the same way at one point (trimmed, quotes stripped, case-insensitive); a production target is `NODE_ENV=production` unless `VERCEL_ENV` is `preview`/`development`; the marker unlocks a production target everywhere; the error prints every value it saw; a production build that does pass with both set logs a remove-before-launch warning. Verified with seven real builds: local flag-only refused, local both built, Vercel preview flag-only built, Vercel production flag-only refused, Vercel production both built (with the warning), flag off built, quoted/whitespace values handled. Trade-off recorded: a Production deployment with both variables deliberately set will now carry placeholders — that is a launch-checklist item in `HANDOFF.md`, no longer a hard stop.

## 2026-09-19 — Office frame stays empty; milestone 7

- **No photographic placeholder anywhere.** All three sourced candidates for the office frame would have sat under the caption naming TDL's real address and asserted something false; the about-page frames are captioned as TDL's own staff and office and have the same problem. The registry is empty and `PlaceholderKey` is `never`. The flag's only visible effect is the initials monograms. Q18, Q26, Q27 stay open; the empty frame is the honest presentation state and the better prompt to the client.
- **Guard warning is a boxed block** in the build output when the marker is honoured on a production target; HANDOFF.md opens with the launch checklist and item 1 is removing both variables from Vercel Production.

### Milestone 7 — about, work, careers, contact, certifications, legal, insights

- **Content is the live site's.** Vision, mission, all five biographies, the careers diversity and perks text, and both legal policies are carried verbatim (`src/content/about.ts`, `src/content/legal.ts`). The about story is rewritten as plain facts from §A of CLIENT-QUESTIONS.md; the current page's "dynamic and forward-thinking" framing is cut.
- **About opens on the Roster settled as the mark** — the population as one firm — in a single-slot mount; the status line reads "as one firm". Leadership and board get 4:5 portrait frames (empty, or initials monograms behind the flag), the garden quote gets its own section in the voice setting, and two 3:2 office frames are reserved for real photography (Q18).
- **Careers: TDL already runs Zoho Recruit.** The current site's "View openings" links to `totaldatalimited.zohorecruit.com`. `/careers` links there and never duplicates listings; the talent-pool form posts to the same webhook as the enquiry form with `source: careers`. Q14 answered; HANDOFF's CMS note updated — an existing ATS beats a new system, and it exists.
- **Contact links to Google Maps rather than embedding a map**: no third-party script or iframe, nothing fires before consent. Direct lines first.
- **Certifications** shows the current site's ISO badge and its two quality PDFs (real files, copied to `/documents/`), with reserved "To come" rows for the certificate and licences (Q19) rather than omitting them.
- **Legal pages** render the policies verbatim with numbered sections as headings; the smallest bundle on the site (1.0 KB own code). Q25 legal review before launch.
- **Insights** exists (so `/Blog` redirects somewhere real), is `noindex`, out of the nav, and says plainly that nothing is published.
- **Cookie consent**: nothing on the site sets a non-essential cookie or loads analytics, so no banner is shown; the cookies policy describes categories that are not currently in use. If analytics is added, a consent gate must precede it (brief §10) — noted in HANDOFF.
- Scroll regression test now covers `/about-us`; 75 checks pass. First-load JS: about 144.6 (own 2.9), work/contact/certifications/privacy 142.7 (own 1.0), careers 174.2 (own 32.5, the form), become-a-client 176.5 (own 34.8), home 154.1 (own 12.4).

## 2026-09-19 — Placeholders restored, narrowly

The rule that survived: a frame whose caption names TDL's address or a named person never takes a placeholder; anything else may, with a caption that is true without claiming to depict TDL. Where a photograph warms a page: home Work section (three text rows with the Roster quiet), `/about-us` beside the Coker Road frame (one good image beside an empty one reads as deliberate; two beside an empty one reads as padding), and the `/careers` header (a job-seeker page, warmth matters most, no caption needed). `/work` stays text-only: its strength is its structure.

Ten candidates were sourced; one survived. A Zaria greenhouse and a Jimeta construction site were dropped because they move the brand down-market for an FMCG or consumer-electronics buyer. The warmest office image (two women reviewing documents) was dropped after inspection at full size: a legible customer file with a name and an ID photo on the desk, a bank's product banner, uniform logos — and every crop that kept the hands kept the file. The Ninthgrid pairs all carry Apple logos or faces to camera. What remains is Taiye Salawu's woman at a desk reviewing charts, back to camera, no branding, natural light — used three times with different crops (`placeholderPosition`), which is honest because nobody sees two of them at once.

Verified with builds: flag on → `/` 1 filled + 1 empty + 3 monograms, `/about-us` 1 filled + 1 empty + 5 monograms, `/careers` 1 filled; flag off → 0 filled everywhere, every frame "Photograph to come" / "Portrait to come".

## 2026-09-19 — Careers: Zoho Recruit stays; the handoff is what changes

Zoho Recruit is an ATS, not a job board, and recruitment is one of TDL's own service lines — their recruiters work in it daily. It is not rebuilt. What was wrong was the handoff on both sides: openings are a link out to Zoho's page, and the talent-pool form posted to the enquiry webhook with `source: careers`, which is an inbox recruiters will never open. Everything below was checked against Zoho's own help pages today; the plan questions are for TDL (CLIENT-QUESTIONS.md Q29), not assumptions.

### Openings on `/careers` in our own design — available, on every plan

- **The REST API is on every edition, including Free.** Zoho's API-limits page: Free 500 requests/day/org; Standard 3,000–5,000/day (or 250 per user licence, whichever is lower); Professional 5,000–10,000; Enterprise 10,000–30,000. `GET /recruit/v2/JobOpenings` returns up to 200 records a page with `Posting_Title`, `Job_Opening_Status`, `City`/`State`/`Country`, `Job_Type`, `Date_Opened`, `Job_Description`. Authentication is OAuth 2.0 via a *Self Client* an administrator creates at `api-console.zoho.com`; the refresh token lives until revoked, access tokens last an hour. Hosts vary by data centre.
- **How it would be built:** a fetch at build time (one request), rendered as ruled rows in the site's type, each row linking to the opening's page on Zoho for the apply step. So the listing is ours, the apply flow and the candidate record are Zoho's. Freshness is the design question: a static build is stale until the next deploy, so `/careers` would either get an hourly `revalidate` (the one non-static route on the site) or a Vercel cron hitting a deploy hook. The field that marks an opening as published to the careers site, and the exact per-opening URL, need verifying against TDL's org — not every field is in the public examples.
- **Rejected: Zoho's "embed jobs on your website" widget.** A JavaScript snippet with three templates, a `brand_color` option and CSS overrides. It puts Zoho's script on the page before any consent, in Zoho's markup, at a weight we do not control, on a route with a 60 KB own-code budget. The page does not say which editions carry it.
- **Rejected as a fallback: `careers.totaldatalimited.com`.** Zoho's domain-setup page: subdomain mapping is **Enterprise only** (both editions), administrator only; CNAME plus a ZR verification code, then a multi-domain SSL certificate that takes 3–4 business days. The `*.zohorecruit.com` default is what every other plan gets. So this is a fallback only if TDL is already on Enterprise — Q29(e).
- **What it depends on:** the plan (Corporate HR has Free, Standard and Enterprise; no Professional) and an administrator willing to create the Self Client. Both are Q29. Nothing is built for openings until they answer; the link to the board stays.

### Talent pool → a Candidate record in Zoho (built, credential-gated)

Two honest options: route the form into Zoho as a candidate, or drop the form and link to Zoho's own general application. **Routed into Zoho.** Reasons:

- **It works on the plan they are most likely on.** Candidate insert (`POST /recruit/v2/Candidates`, `Last_Name` the only mandatory field) and notes (`POST /recruit/v2/Notes`) are API calls, available on Free. The alternatives inside Zoho are gated: *Webforms* (a Candidates form to embed or link) are "available for all paid plans"; the *candidate portal* — the "register for future openings" path on Zoho's careers site — is listed on Zoho's pricing page under Enterprise. On Free or Standard, "link to Zoho's general application" may have nothing to link to except a specific opening.
- **The form stays ours.** Keyboard-operable, native controls, the NDPR consent line, 32 KB of own code. Zoho's careers page is a 1.79 MB HTML shell before its scripts (measured today) — a lot to hand a job-seeker on metered data for a form that says "we have nothing for you yet, leave your details".
- **It ends in the one place recruiters look.** `src/lib/zoho-recruit.ts` refreshes the token, inserts the Candidate (`First_Name`/`Last_Name` split on the last word, `Email`, `Phone`, `City`; `Source` only when `ZOHO_RECRUIT_SOURCE` names a value that exists in the org's picklist), then attaches a note with the area of work, location, consent timestamp and the free text — so nothing the person wrote is lost to a field that does not exist. The note is best-effort: a candidate without a note is still a candidate; failing the whole submission because a note failed would tell the person something false. Not yet exercised against TDL's org (no credentials); field API names are Zoho's standard layout and an `INVALID_DATA` response names the field to fix.
- **Until the credentials exist the hole is still open** — the action falls back to `FORM_WEBHOOK_URL`, and someone at TDL has to watch that inbox. Said plainly in Q29 and HANDOFF rather than papered over.
- **Next, once records land:** a CV upload. A talent-pool entry without a CV is thin for a recruiter, and Zoho parses résumés it receives — `POST /Candidates/{id}/Attachments` with `attachments_category=Resume`. It needs a file field and `serverActions.bodySizeLimit` above Next's 1 MB default. Deferred until the base integration is proven, not because it is hard.

## 2026-09-19 — Reserved frames: a note, not a hole

- **A large empty 16:9 box was the worst of both options** — it read as a broken image rather than a deliberate gap. `PhotoFrame`'s reserved state is now a compact bordered note, roughly a third the height of the photograph it stands for: the "Photograph to come" line naming what belongs there and, where the frame is captioned with a place, the address; then the format on a second line (`16:9, at least 2,400 px wide` / `3:2, at least 2,000 px on the long side`). Top-left aligned like a note, not centred like an empty image. The `aspect` prop still governs the frame once a real image arrives, so the layout grows then by design. Applied everywhere the state occurs: the home office (Q27), the two about-page office frames, the careers header and the home Work figure. Figcaptions that only said "photograph to come" are gone; the two frames whose caption qualifies a placeholder ("not TDL's own staff") keep it only while the placeholder shows.
- **The about pair are equal height** (`h-full` on the reservation and its figure) so two notes side by side read as one row.
- **`PRESENTATION_HIDE_EMPTY_FRAMES=true`** leaves every reserved frame out — photo frames, and the portrait frames that would say "Portrait to come" — so a client meeting can show each page as it will read once their photography arrives. Wrappers go with them: the home office section disappears, the careers header drops its third column, the about office section goes when neither frame is left (the certifications link it carried is in the footer), and the leadership/board rows lose their portrait column. Frames holding a real image, a registered placeholder or a monogram are untouched, so the likely meeting setup (`PLACEHOLDER_IMAGES=true` + this) shows one placeholder per page, monograms, and no "to come" anywhere. It hides rather than shows, so it is a build warning on a production target, not a stop; it is on the launch checklist regardless.
- Verified with production builds (`scripts/frame-crops.py`, `docs/screenshots/frames-{off,hide,meeting}-*`): flag off → 5 reserved frames on `/`, 7 on `/about-us`, 1 on `/careers`; hide on → 0, 0, 0 with the office section absent from `/`; hide + placeholders → 1 placeholder per page, monograms, no reservations. `npm run lint` 0 errors; `tsc` clean.

## 2026-09-29 — Milestone 8, hardening

One script per pass, all repeatable: `scripts/harden.py` (redirects, sitemap, robots, JSON-LD, axe, keyboard, reduced motion), `scripts/android-probe.py` (applied throttling on a mid-range Android profile, load and interaction), `scripts/lh-clean.sh` (Lighthouse with Chrome killed between runs). Each prints ok/FAIL per check and exits non-zero, so a future session can re-run them rather than re-derive them.

### Three real defects, found and fixed

- **`/become-a-client` shifted by the full height of the form: CLS 0.601 mobile, 0.686 desktop** — six times the 0.1 requirement, on the money page. Cause: the form sat in `<Suspense fallback={null}>` so it could call `useSearchParams` while the route stayed static. The local Next docs are explicit — on a prerendered route that hook makes the client tree *up to the nearest boundary* client-rendered only, so the form was absent from the HTML and appeared on hydration, pushing the footer down. Fixed by reading `window.location.search` in an effect after mount instead: the form is in the prerendered HTML, the route is still static, and the preselection costs one tick in which a checkbox that is already on the page becomes ticked. **CLS is now 0.000 on every route.** Verified that `?service=` still works on direct load (one service, two services, junk slug ignored), on in-app navigation from a service page's scoped CTA, and after back-then-forward remount.
- **Form inputs had no visible focus ring.** `src/components/ui/field.tsx` carried `focus:outline-none` plus a `ring-2 ring-signal-deep/30` box-shadow — 30% alpha on paper is about 1.5:1, present but not visible, and it suppressed the global `:focus-visible` outline every other control on the site uses. Removed both; native controls now show the same 2 px `--signal-deep` outline as buttons and links. This is the brief's "visible keyboard focus everywhere", and it had been quietly false since milestone 5.
- **Two contrast failures** that Lighthouse's a11y score had been hiding at 97 and the earlier note deferred: the footer's in-text `/privacy-policy` link was underline-on-hover only (axe `link-in-text-block`: a link inside a paragraph must be distinguishable without colour alone) — now permanently underlined; and the unselected testimonial portrait frames dimmed to `opacity-70`, which took the reserved "Portrait to come" text to 3.18:1 against paper. The dim now applies only when the frame holds a portrait or a monogram, never to text. **axe: zero serious or critical violations on all 17 routes at 1280 px and 390 px. Lighthouse accessibility 100 on every route measured.**

### Performance: the numbers, and which model produced them

Applied throttling (CDP: 4× CPU, 150 ms RTT / 1.6 Mbps, 412×823 at DPR 2 — a Moto G Power profile), which is the model this project accepted on 2026-09-19 as the working number:

| Route | FCP | LCP | LCP element | CLS |
|---|---|---|---|---|
| `/` | 1.40–1.60 s | **1.40–1.60 s** | `h1#hero-headline` | 0.000 |
| `/services` | 0.38 s | 0.38 s | intro paragraph | 0.000 |
| `/services/payroll-management` | 0.35 s | 0.35 s | `h1#service-title` | 0.000 |
| `/about-us` | 0.42 s | 0.45 s | intro paragraph | 0.000 |
| `/careers` | 0.35 s | 0.35 s | `h1#careers-title` | 0.000 |
| `/become-a-client` | 0.30–0.42 s | 0.63–0.66 s | step caption | 0.000 |
| `/work` | 0.32 s | 0.44 s | intro paragraph | 0.000 |

LCP equals FCP on every route but two — one paint, no second candidate — which is the check that matters for the hero: **the SplitText reveal is not delaying LCP.** Worst interaction latency (the measurement INP is taken from): 136 ms on `/` (service rows, testimonial tabs, full-quote expansion), 144 ms on `/become-a-client` (step change), 48 ms on `/careers`. A full-page fling hero-to-footer produced no long task and landed at the footer. **All three requirements — LCP < 2.5 s, CLS < 0.1, INP < 200 ms — are met under applied throttling.**

Lighthouse simulated (Lantern), same build, for the record: perf 86–97, LCP 2.0–3.3 s, CLS 0, TBT 120–440 ms. The gap to the applied figures is the Lantern-on-localhost artefact already analysed on 2026-09-19 (every framework request finishes before the observed paint, so the model treats them all as LCP dependencies). Recorded, not targeted.

### Two measurement traps, both previously documented and both hit again

- **Leaked headless Chrome inflates TBT.** A first sweep of ten Lighthouse runs left 30 Chrome processes alive and reported home TBT 2,770 ms; with Chrome killed between runs the same build reports 440 ms. `scripts/lh-clean.sh` does the killing. Any Lighthouse figure from a batch run without it is worthless — this is the second time it has cost a session.
- **Blocking time on `/` is too noisy on this machine to optimise against.** Four runs of the same build: 889, 1,414, 1,494, 1,905 ms of blocking at 4× CPU. An experiment removing the `timeout: 1500` from the Roster's idle layout warming measured "worse" (889 → 1,494) and was reverted — then the reverted build measured 1,905, i.e. the difference was noise, not the change. **Reverted; no evidence either way.** The dominant cost is real and identified — one function in the Roster chunk, the map mask rasterise and placement, 561 ms self time at 4× CPU — and it runs after first paint, off the critical path. If it is ever worth removing, precompute the mask at build time rather than re-tuning the idle scheduler; do not re-run the timeout experiment on a machine this noisy.

### Redirects, sitemap, JSON-LD

- Every URL on the live site is checked by following the chain by hand, because a 308 that lands on a 301 or a 404 is not the equivalence the brief asks for: seven preserved paths plus all seven service paths serve 200; each trailing-slash form (how the current site links them) 308s to the canonical path; `/new-client`, `/new-client/`, `/Blog`, `/index.html` reach their destinations by 308s only. The four WordPress leftovers still in the live sitemap (`/sample-page/`, `/2025/04/22/hello-world/`, `/category/uncategorized/`, `/author/admin_4qzhav2h/`) end in a clean 404 — deliberately not redirected: they are a default install's sample content, not indexed pages worth preserving.
- Sitemap lists exactly the 17 indexable routes and nothing else (`/insights` and `/dev` excluded), all absolute https; robots disallows `/dev/` and points at the sitemap; `/insights` is `noindex`.
- Every JSON-LD block parses, carries its expected `@type` and contains no raw `<`: Organization + LocalBusiness on `/` and `/about-us`, LocalBusiness on `/contact-us`, seven Service nodes on `/services`, one per service page.

### Keyboard and reduced motion

Keyboard, all asserting a visible ring at each stop: first Tab reaches the skip link; service rows open on Enter and Space and move on ArrowDown, and Tab from an open row reaches the link inside its panel; the testimonial tablist selects on ArrowDown and End and Tab leaves it cleanly; the form ticks a service and a headcount with Space, Continue moves to step 2 with focus on its heading, Continue with empty fields returns focus to the first invalid field with the error shown, and Back returns to step 1's heading.

Reduced motion: the proof figures are final at `domcontentloaded` and unchanged 1.5 s later (the "0+" regression of 2026-09-19 stays fixed), no web animation is running at rest, Lenis is not mounted, the headline is fully visible with nothing left split-hidden, the status line still changes state on scroll, and the canvas is present and `aria-hidden`. With `Save-Data` no canvas mounts at all.

### First-load JS (floor 141.7 KB, budget floor + 60 KB own)

`/` 154.2 (own 12.5) · `/services` 144.6 (2.9) · `/services/[slug]` 144.7 (3.0) · `/about-us` 144.6 (2.9) · `/careers` 174.2 (32.5) · `/become-a-client` 176.5 (34.8) · `/work`, `/contact-us`, `/certifications`, `/privacy-policy`, `/insights` 142.7 (1.0). Worst route 176.5 KB against a 201.7 KB budget. The two form routes carry react-hook-form and `zod/mini`; everything else is close to the floor.

## 2026-09-29 — Recruitment adapter: the site no longer knows which ATS TDL runs

TDL may move off Zoho Recruit; nobody has said why or when (Q29). That is a reason to keep the *coupling* small, not a reason to build anything. So the site now talks to a port — `RecruitmentProvider` in `src/lib/recruitment/types.ts` — with one adapter per provider behind it.

- **The interface is what the site actually calls**, nothing more: `listOpenings`, `createCandidate`, `addNote`, plus `openingsUrl` (the board the careers page links to) and a `capabilities` flag set. Methods return a result, never throw: `unsupported` (this provider cannot do this at all), `unconfigured` (credentials missing), `failed` (a real error). The distinction matters because only `failed` is worth telling a visitor about.
- **Three adapters.** `zoho.ts` is the existing Zoho Recruit code, unchanged in behaviour. `webhook.ts` posts to `FORM_WEBHOOK_URL` as before. `none.ts` refuses honestly and logs in development — a form that says "thank you" and drops a CV is worse than one that says it is not connected.
- **One contract worth stating:** a provider that reports `addNote: false` must deliver `draft.message` itself inside `createCandidate`. The webhook has no record to annotate, so it posts the whole draft. Nothing an applicant wrote can be dropped by a provider that happens to lack notes.
- **Selection** is `RECRUITMENT_PROVIDER` (`zoho` | `webhook` | `none`) when set, otherwise auto: ATS credentials, then the webhook, then none — which is exactly what every environment does today, so nothing changed operationally. It is evaluated per call, not at module load, so a variable added in the hosting dashboard takes effect on the next request.
- **The board URL moved out of the page.** `/careers` used to read `careers.openingsUrl` from content and hard-link Zoho's board; it now calls `openingsUrl()`. The URL still lives in `src/content/about.ts` (it is copy, and it is TDL's own address), with `RECRUITMENT_BOARD_URL` as the override a move to another ATS would use first. If a provider ever returns `null`, the page drops the "See current openings" button and promotes the talent pool to the primary CTA rather than linking somewhere that does not exist.
- **`src/lib/zoho-recruit.ts` is gone.** Nothing outside `src/lib/recruitment/` imports an adapter, reads a `ZOHO_*` variable or names a provider export.

### Enforced, not just asked for

`node scripts/check-adapter.mjs` fails the check when (a) anything outside the adapter directory imports an adapter module, reads a provider's environment variable, or names a provider's exports; (b) anything on the recruitment path touches the filesystem, a database client or browser storage; (c) `index.ts` re-exports an adapter wholesale, which would let callers reach past the interface. It strips comments before testing, deliberately: a comment saying which ATS TDL runs today is useful, and the board URL in `src/content` is data, not wiring. Prose is not coupling.

`node --experimental-strip-types scripts/provider-proof.mjs` runs every branch against a local stub standing in for the OAuth and API endpoints — 18 checks, all passing: selection precedence and both overrides, the board fallback, the name split on the last word, that the free text is *not* written into a candidate field, that the note attaches to the created record, that only open roles are listed and each applies on the provider, that the webhook carries the message itself, that unsupported is reported as unsupported rather than as a failure, and that the null provider refuses instead of silently accepting. No credentials and no network needed, so it runs in CI and on a laptop.

### No candidate data on our side, deliberately

Every method is a pass-through: validated, forwarded, dropped. The site writes nothing to disk, to a database or to a log. This is not a performance choice — holding applicants' personal data would make this site a data controller under the NDPR, with retention, subject-access and deletion duties attached. The ATS already carries those duties. Check (b) above exists so that this stays true by accident-proofing rather than by memory.

### If TDL leaves Zoho

**Moving to another ATS is a new adapter** — one file implementing five members, plus an environment variable. That is the point of the port, and it is a day's work, not a project.

**Replacing the ATS with something we build is a separate product**, and should be quoted as one. The minimum it would have to carry:

- **Authentication and roles** — recruiters, hiring managers, an administrator; who can see which candidates.
- **A candidate pipeline** — stages, ownership, notes, rejection reasons, duplicate detection across repeat applicants.
- **CV storage** — file upload, virus scanning, access control, and parsing if anyone expects search.
- **Interview scheduling** — availability, invitations, calendar integration, reminders.
- **Retention and deletion under Nigerian data protection law** — the NDPR gives data subjects access, correction and erasure rights, and requires a lawful basis and a retention period for candidate data. That means a records schedule, a way to action a deletion request across every copy, and someone accountable for answering one.
- **Backups and an audit log** — who read or changed which record, and when; restorable without losing the audit trail.

None of that is marketing-site work, and each item is a source of liability that Zoho currently absorbs. The honest recommendation if the question comes up: keep the ATS, change vendors if the reason is cost or a missing feature, and write a new adapter. Q29 asks what is actually driving the question, because "we want our own" and "Zoho is too expensive" have very different answers.

---

## Built 2026-09-30 — switched off by default

Approved with conditions; this section records what was built, what was measured, and the two places the first
attempt was wrong. **No project key is set in any environment, so on every build today the banner does not
render, the SDK is never fetched, and no request is made.** Everything below activates when TDL approves Q30 and
`NEXT_PUBLIC_POSTHOG_KEY` is set.

### Off by default, and it costs almost nothing to be off

`analyticsConfigured` is `NEXT_PUBLIC_POSTHOG_KEY.length > 0`, inlined at build time. The consent banner, the
consent store and the SDK starter live in a chunk behind a `React.lazy` gate, so with no key none of it is
imported and nothing is requested.

The first version rendered the banner and provider directly in the layout, which put **2.9 KB of dead code on
every route**. Moving them behind `next/dynamic` recovered most of it but left 1.6 KB of loadable machinery;
`React.lazy` behind a build-time constant leaves **0.5 KB**. A second mistake was folding `track()` into the same
module as the runtime, so instrumenting a form pulled the consent store and SDK starter into that route's
bundle — `lib/analytics/track.ts` is now deliberately the smallest module that can send an event.

First-load JS, analytics **off** (the shipping default), against the pre-analytics baseline:

| Route | before | now | delta |
|---|---|---|---|
| `/` | 12.4 | 13.0 | +0.6 |
| `/services`, `/about-us` | 2.9 | 3.4 | +0.5 |
| `/work`, `/contact-us`, `/certifications`, `/privacy-policy`, `/insights` | 1.0 | 1.5 | +0.5 |
| `/careers` | 32.5 | 34.1 | +1.6 |
| `/become-a-client` | 34.8 | 36.1 | +1.3 |

The 0.5 KB is the gate; the extra 1.1 KB on the two form routes is the field instrumentation itself. Worst route
177.8 KB against a 201.7 KB budget. With a key set, first-load is **identical** — the SDK is entirely lazy.

### Replay: scope, and the sampling rate

Session replay runs on `/careers` only, and on `/become-a-client` only if TDL approves it (Q30d) via
`NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY`. **Never the home route** — it is the one page where the Roster already
spends the visitor's data, and the funnels that need diagnosing are not there.

**Sampling: 25% of sessions on a permitted route** (`NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE`, default 0.25). The
reasoning: replay is for diagnosis, funnels do the measurement. Nobody watches more than a few dozen recordings,
so at TDL's likely volume a quarter still yields more than anyone will view while recording three-quarters
fewer applicants. The draw is made once per session and kept in `sessionStorage`, because a visitor recorded on
one page and not the next produces a useless half-session. Raise it temporarily to investigate something
specific, then put it back.

### Bundle: the slim build was evaluated and rejected

Measured from the installed package (posthog-js 1.434.18), brotli, which is what a browser actually downloads:

| Build | raw | gzip | **brotli** |
|---|---|---|---|
| `module.js` (what we ship) | 318 KB | 99.8 KB | **84.3 KB** |
| `module.slim.js` | 150 KB | 51.0 KB | **44.5 KB** |
| `module.full.js` | 661 KB | 202 KB | 168.7 KB |

The slim build would save ~40 KB, and it was rejected: composing it with the session-replay extension requires
`__extensionClasses`, a config key the type definitions mark `@internal`, on an entrypoint PostHog's own docs
call experimental. This is client work that has to survive a dependency bump without a developer present.
Revisit when `posthog-js/slim` resolves as a public subpath.

What a consenting visitor actually downloads, measured from the built chunks: **81.5 KB brotli** for the SDK plus
**~11 KB** for our runtime chunk, after first paint, plus PostHog's recorder (~40 KB brotli, fetched from their
CDN) for the 25% of `/careers` sessions that are sampled. Someone who declines downloads none of it.

### Consent banner

Fixed to the bottom, mounted after first paint, early in the DOM so Tab reaches it straight after the skip link.

- **Equal prominence, not just equal size.** The first version had a filled Accept beside an outlined Reject:
  identical geometry, and still a recommendation. Both buttons are now visually identical apart from the word on
  them. Verified from the rendered boxes — same tag, height (44 px), font size, weight, padding and opacity.
- **No layout shift and never the LCP element**, measured on a throttled mobile profile (4× CPU, slow 4G,
  412×823) with the banner on screen. A/B against the same build with analytics off:

  | Route | analytics off | banner showing |
  |---|---|---|
  | `/` | FCP/LCP 1,784 ms, CLS 0.000 | FCP/LCP 1,340 ms, CLS 0.000 |
  | `/careers` | 368 ms, CLS 0.000 | 404 ms, CLS 0.000 |
  | `/become-a-client` | LCP 596 ms, CLS 0.000 | LCP 676 ms, CLS 0.000 |

  Differences are inside this machine's documented run-to-run variance; **CLS is 0.000 in every case** and the
  LCP element is page content on every route, never the banner.
- **Keyboard and screen reader**: focus is not moved when it appears (an automatic jump interrupts someone
  mid-sentence), both buttons take a visible ring, Tab moves Accept → Reject → out of the banner, so there is no
  trap. It is a labelled region, not `aria-modal`, with a polite live announcement.
- **Declining sets nothing.** The choice lives in `localStorage`, not a cookie. The footer carries "Analytics
  choice (on/off)" so a refusal is reversible rather than a dead end.
- Events raised before consent is answered — the page view, and anything done while the banner is up — wait in a
  bounded queue and are sent only on acceptance. **Refusal discards them.**

### Masking, verified on the wire

`maskAllInputs: true`, `maskTextSelector: "*"` (everything masked, nothing deliberately unmasked),
`mask_all_text: true` so autocapture cannot read the text of what it captures a click on, `person_profiles:
"never"` because this site has no accounts and a profile per visitor is data we would have to defend.

`scripts/masking-proof.py` does not read a vendor dashboard. `scripts/posthog-stub.py` stands in for PostHog:
it answers the remote-config endpoints, serves the **real** recorder out of `node_modules` so genuine rrweb
output is produced, and writes every POST body to a file. The proof fills both forms with canary tokens, then
searches every captured byte under every plausible decoding — raw, gzip, zlib, form-encoded, base64, and
base64-then-gzip.

**Result: 13 payloads, 62,787 bytes inspected — 11 event payloads and 2 replay payloads — and no canary token
under any decoding.** A control check confirms the canaries really were typed, so a clean scan is not a scan of
nothing.

Two ways this test passed while proving nothing, both now asserted against:

1. **The recorder never ran.** The first version intercepted the whole PostHog origin, including the script
   host, so the replay stream — the payload that matters most — was never produced. The stub now serves the
   real recorder, and the proof fails if no `/s/` payload is seen.
2. **PostHog drops automated traffic.** It ignores bot-like user agents *and* `navigator.webdriver === true`,
   which every automation driver sets. With that unhandled the SDK captured nothing and the scan read an empty
   file. The proof now presents an ordinary desktop Chrome UA and masks `webdriver`, and fails if no event
   payload is seen. In production this is a feature: bot traffic will not pollute TDL's funnels.

### Hardening, rerun for what analytics adds

Every pass was run twice, once with a key set (banner showing) and once without (the shipping default):

- `harden.py` — redirects, sitemap, robots, JSON-LD, axe on all 17 routes at 1280 and 390, keyboard, reduced
  motion: **no failures in either state**.
- `consent-proof.py` — axe on six routes with the banner **showing and dismissed**: no serious or critical
  violations in either phase.
- `test:scroll` — scroll position after client-side navigation: no failures in either state.
- `check:adapter`, `test:provider`, `tsc`, `lint` (0 errors): clean.

### What is not built

The custom LLM digest. Phase one stands: PostHog's own weekly digest and insight alerts, which cost nothing and
need no code. The phase-two write-up is in `docs/ANALYTICS-PROPOSAL.md` for TDL to accept or decline.

## 2026-10-08 — Analytics additions: viral guard, error events, PostHog AI, survey and experiment prepared

Detail and arithmetic in `docs/ANALYTICS-PROPOSAL.md` §7–§11. The decisions that will matter later:

- **Replay sample rate 0.25 → 0.05.** Sized against a viral posting, not normal traffic: 20,000 careers visitors
  in a week at 5% is 1,000 recordings, 20% of the free monthly 5,000; a whole month of that is 4,000, still
  inside. At 25% the same week would have spent the month alone, and with billing limits at zero PostHog then
  stops ingesting replay and the data is lost — the quota spent on whoever arrived first. The cost is about
  fifteen recordings in an ordinary month; raise it deliberately for an investigation, then put it back.
- **Errors are typed events, not exception capture.** `capture_exceptions: false`, enforced. An error's message
  and stack carry whatever was in flight, which on these routes is an applicant's answers. Failures report a
  reason from a closed list (`delivery`, `unconfigured`, `validation`, `network`), and the server actions now
  return that reason separately from the visitor's sentence — the first version string-matched the message,
  which would have misfiled failures as soon as the wording changed. `form_validation_failed.reason` was a
  free `string` and is now a closed union too.
- **Two real bugs found by the canary test, not by reading code:**
  1. An unreachable server action throws instead of returning `{ok:false}`. Nothing caught it: the visitor sat on
     "Sending" with no message and no failure was ever reported. Both forms now catch it, show "We could not
     reach our server…", reset the button, and report `network`. Verified in a browser with the POST aborted.
  2. Setting `advanced_disable_flags` to save the flags request while the experiment is off also disabled the
     remote config that switches recording on. Replay recorded nothing, silently. Removed, with a comment where
     it was.
  The canary test now submits the fully-filled form with the server action cut off, and fails unless both the
  replay stream and the failure event are present. Result: 15 payloads, 66,597 bytes, 12 event and 3 replay
  payloads, `talent_pool_failed` present, no canary under any decoding.
- **"Never identify" is enforced, and the enforcement was tested.** `scripts/check-adapter.mjs` now fails on any
  `identify`, `alias` or `setPersonProperties` call, on `person_profiles` other than `"never"`, on exception
  capture, and on masking being loosened. Each was proven by introducing the violation. The first version of the
  identify check **missed `client?.identify(...)`** because it did not allow for optional chaining; fixed, and
  re-proven along with `posthog.setPersonProperties(...)`.
- **PostHog AI is phase one of the AI digest, with a cost that is not money.** It answers plain-English funnel
  questions; secondary sources put it at 2,000 free credits a month on every plan, and the $0 limit caps it.
  But PostHog's own FAQ says the data it reads passes to Anthropic, OpenAI and Alphabet as subprocessors. It is
  off until an org admin approves AI features, and turning it on adds a sentence to the privacy notice (Q30f).
- **Survey and experiment are wired and off.** `disable_surveys` follows `NEXT_PUBLIC_ANALYTICS_SURVEYS`; the
  survey itself is defined in PostHog, so the proposal carries its exact definition. The CTA experiment returns
  the server-rendered control unless a known variant arrives within four seconds — no flicker, and an unknown
  variant name from the dashboard is ignored rather than rendered. Variant names live in the event contract and
  the label map is typed against it.
- **Billing limits at zero cannot be set from here.** No PostHog project exists. It is item one of the analytics
  block in `HANDOFF.md`'s launch checklist, before the key is ever deployed.
- **The privacy draft had a hole from the previous round.** The approval asked that it say analytics data leaves
  Nigeria and where it goes; the code and `.env.example` said so, but the draft notice still read "held in the
  [region] region". It now names the transfer, the EU region in Frankfurt and the processor, and carries a
  bracketed sentence for PostHog AI's US subprocessors.

## 2026-10-16 — TDL's review, part 1: light header with the full logo, staff-portal link, anchors clear the header

Changes requested by TDL management after the demo. Recorded as client requests; where one reverses an earlier
decision, the earlier reasoning is noted so it is not re-argued.

- **Header is now light, with TDL's full logo exactly as supplied** — mark, olive wordmark and red tagline, in
  colour, unaltered. This **reverses "header is always navy" (2026-09-18)** at the client's request. The olive
  wordmark is 2.5:1 on navy, so the full lockup could only be shown on a light ground; that was the trade TDL
  chose. Consequences, all handled: the status line moves from ink-light to olive (6.2:1 on paper); the primary
  button inverts to its ink-filled form on its own, because the header no longer carries `.on-ink`; a 25%-olive
  rule separates the header from paper sections below it. The logo's lime and red stay inside the logo asset,
  as the token rules require, and logo text is exempt from WCAG contrast. The PNG has a transparent ground.
- **The footer stays navy and keeps the mark-plus-name lockup**, because the full logo would not read there.
- **The status line now shows from `xl` (1280 px) up.** At 1024 px the full logo, five nav items, the staff
  portal link and the button fill the strip; the status line is also stated in every section's caption, so
  nothing is lost below `xl`.
- **The header was already sticky on every route** — measured at 1280 and 390 px on four routes before any change.
  What was actually wrong: **anchor targets landed underneath it** (`/careers#talent-pool`, the skip link's
  `#main`, `/work#…`). Fixed with `scroll-margin-top` on every element with an id (5 rem, 5.5 rem from `md`);
  verified that each target now lands 15 px below the header at both widths. The mobile menu is capped to the
  viewport and scrolls, so the last item is reachable on short phones.
- **Staff portal (HRIS) link**: header, as an underlined link secondary to the main button, and the footer; opens
  in a new tab. The URL and label live in `src/content/facts.ts`, TODO(client) Q31. **On the live site it is
  hidden until the URL exists** — `/staff-portal` returns 404 and no link is rendered. **In demo builds** it shows
  and points at a one-line holding page, "Staff portal link to be added", so it can be demonstrated without a dead
  link.
- **What a "demo build" is**: the existing presentation flag (`PLACEHOLDER_IMAGES`), exposed as `isDemoBuild` in
  `src/lib/build-mode.ts`. Deliberately not a new flag — that one is already guarded in `next.config.ts` and
  already first on the launch checklist for removal. It is server-only, so client components such as the header
  receive what they need as props.

## 2026-10-16 — TDL's review, part 2: "Partner with us" on WhatsApp, one careers page, a headline that says what TDL does, testimonial cards

- **The main call to action is "Partner with us", and it opens WhatsApp** (`wa.me`, prefilled, new tab) to the
  number in `facts.ts` — TODO(client) Q20, **now blocking for launch**, because every main button depends on it.
  One shared component, `src/components/ui/partner-cta.tsx`, at all nine places "Become a client" was: header,
  mobile menu, hero, home close, both CTAs on every service page, `/contact-us`, `/work`.
  - The label is TDL's exactly. It does not say WhatsApp opens, which the copy rule asks a CTA to do, so the button
    carries WhatsApp's glyph (Simple Icons, CC0, in the button's own colour, not WhatsApp green) and its
    accessible name is "Partner with us on WhatsApp" — which contains the visible label, as WCAG 2.5.3 requires.
  - The prefilled message is generic, except on a service page, where it names the service so TDL knows what the
    conversation is about. No personal data.
  - **"Prefer a form?"** sits beside it and goes to `/become-a-client`, pre-ticked with the service on service
    pages. Not in the desktop header: the strip has no room, and every page body offers it.
  - The separate "WhatsApp us" links in the home close and on service pages were removed: the main button is
    WhatsApp now, so they duplicated it.
  - **Analytics**: a new `whatsapp_clicked` event with `location` (a closed list) and `service` (a slug or "none").
    As with the ATS, the site sees the click and never the conversation.
  - `/become-a-client` and the `/new-client` redirect are unchanged; the form is now the secondary route.
- **`/careers` is one page, open roles first** (TDL read "openings" and "careers" as duplicates). Order: the page
  heading, then **Open roles** (one sentence, one button to the board), then **Talent pool** (the form), then the
  firm's own words on working here. The hero no longer repeats the two routes as buttons — the sections below are
  the routes. "Openings" is gone from every user-facing string; the button is "See open roles", and the two form
  error messages point at "Open roles above". Nav, footer and home already had exactly one Careers entry each.
- **Headline: "We run the HR. You run the business."** — TDL's own, with their two alternates in `facts.ts` (Q23).
  The subline names the services, Nigeria and Benin Republic and "since 2000". The previous headline and its
  headcount variant are retired. The home meta title and the site-wide description now match.
- **Testimonials are three cards**, in a row from `lg`, stacked below, replacing the tablist. Each shows ONE
  verbatim sentence from that person's own quote, as TDL chose them — **excerpted, never rewritten** — and links to
  the whole quote on `/work#<company>`. All three were checked verbatim before use, and the boundary check now
  fails if an excerpt stops being a verbatim substring of its full quote (proven: it caught a one-word rewording
  and a single respelling, "optimize" → "optimise"). The section is now a server component, so it ships no
  JavaScript. The card link is a plain ink link, not cyan — cyan is for people and live numbers. Its accessible
  name, "Read the full quote from <name>", contains its visible text.
- **Headline sentences each get their own line.** Wrapped freely, it broke as "We run the / HR. You run / the
  business." — splitting "HR." from its sentence. Each sentence is now a block span, with a real space between
  them so the heading's text still reads "…HR. You…" to screen readers and search.
- **First-load JS:** `/` 13.0 → 12.0 KB own code (the testimonials no longer ship JavaScript); every other route
  about +2 KB (`/privacy-policy` 1.5 → 3.6, `/careers` 35.4 → 37.9, `/become-a-client` 36.2 → 38.7), because the
  header's "Partner with us" — the WhatsApp glyph, the click event and the analytics `track()` it needs — is now
  in the shared header bundle on every page. Worst route 180.4 KB against 201.7.
- **A testing bug found on the way: `scripts/verify.sh` was not building the shipping configuration.** It
  `unset` the analytics variables, but Next loads `.env.local` itself at build time and applies a value from it
  only when the variable is *absent* from the shell — so once the owner put the demo PostHog key in
  `.env.local`, every "shipping" Tier 2/3 build quietly had analytics on with that key. Proven: one built chunk
  carried the key with `unset`, none with the variables exported as empty strings, which is the fix. Earlier
  Tier 2 results are unaffected — the key arrived after them.
