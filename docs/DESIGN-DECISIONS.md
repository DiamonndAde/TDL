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
