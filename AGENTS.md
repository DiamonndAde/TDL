<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Total Data Limited website

Read `docs/TDL-REVAMP-BRIEF.md` before writing code, and `docs/DESIGN-DECISIONS.md` for what has been decided since. This file is the short version that must hold on every turn.

**Where the brief and this file disagree with `node_modules/next/dist/docs/`, the local Next.js docs win.** Follow the local docs and say what changed.

## Project

Marketing site for Total Data Limited — Nigerian HR and business process outsourcing firm, incorporated 2000, manages 5,000+ staff across Nigeria and Benin Republic. The buyer is an HR director, COO or country manager about to hand over responsibility for thousands of livelihoods and their own statutory compliance exposure. The site must read as **an operations surface** — precise, instrumented, in control at scale — not as a consultancy brochure with animations added.

## Stack (Next.js 16.3.5 — verified against the bundled docs)

- Next.js 16.3.5 App Router, React 19.2, TypeScript strict. Turbopack is the default for `dev` and `build`; no flag.
- `reactCompiler: true` is on. Don't add manual `useMemo`/`useCallback`; the compiler handles it. Confirm `useGSAP` behaves under it at milestone 3.
- `params` and `searchParams` are Promises — `await` them. Use the generated `PageProps<'/services/[slug]'>` / `LayoutProps<'/'>` helpers (`next typegen`).
- Sitemap and robots are the `app/sitemap.ts` and `app/robots.ts` file conventions. **Do not install `next-sitemap`.**
- Redirect map lives in `redirects()` in `next.config.ts`. `permanent: true` returns **308**, not 301; that is fine for search engines.
- `middleware.ts` is now `proxy.ts` (Node runtime only). We should not need one.
- `next lint` is gone; `npm run lint` runs ESLint directly and `next build` does not lint.
- `next build` no longer prints First Load JS. `scripts/first-load.mjs` is the measurement; `npm run analyze` (`@next/bundle-analyzer`) is for finding what a chunk contains. Report first-load JS per route at the end of every milestone.
- `next/image`: `qualities` defaults to `[75]`, `16` is gone from `imageSizes`, use `remotePatterns` not `domains`. Client logos are copied local, never hot-linked.
- Do not set CSS `scroll-behavior: smooth` or `data-scroll-behavior` — Lenis owns scrolling.
- `cacheComponents` stays off; every page is static.
- JSON-LD is a plain `<script type="application/ld+json">` with `<` escaped to the unicode escape `<`, not `next/script`.
- Tailwind CSS v4 via `@import "tailwindcss"` and `@theme`; tokens are CSS custom properties.
- `gsap` 3.15 + ScrollTrigger, SplitText, DrawSVG via `@gsap/react`'s `useGSAP`. Lazy-load plugins and the canvas per route.
- `lenis` for smooth scroll.
- `motion` (not `framer-motion`) is installed but **stays off the home route**; accordion, quote switching and form steps are CSS transitions. Use it only where layout animation is genuinely needed, and show the bundle cost.
- Plain 2D canvas for The Roster. **Not three.js.**
- shadcn/ui for form primitives only — it must not define the visual identity.
- react-hook-form + zod. `next/font/google` self-hosts Archivo; no runtime request to Google.

**GSAP licensing:** every plugin is free, including commercial use, since Webflow's acquisition. Install from the public `gsap` npm package and import as `gsap/SplitText`, `gsap/DrawSVGPlugin`. Never generate an `.npmrc` with a GreenSock auth token or reference `npm.greensock.com` — that guidance is outdated.

## Design tokens (navy set, approved 2026-09-18)

```css
--ink:         #0F1B2D;  /* navy — hero and close ground; body text on paper */
--paper:       #FAFAF8;  /* reading sections */
--olive:       #606135;  /* logo wordmark — rules, borders, secondary text on paper (6.2:1) */
--ink-light:   #8D97B0;  /* secondary text and rules on ink (5.9:1) */
--signal:      #54C4D0;  /* logo cyan — the marks; live data on ink only (8.4:1) */
--signal-deep: #1C7580;  /* live data on paper (5.2:1); --signal is 1.97:1 on paper, decoration only */
```

Lime `#A4CE3C` and red `#EA2126` from the logo are not tokens; they appear only inside the logo asset. Provisional until the logo lockup set arrives — `docs/CLIENT-QUESTIONS.md` Q16.

**The `--signal` rule.** Cyan means *people or a live number*, nothing else: the Roster marks, counters while they count, the active service column, form progress. **The primary CTA does not use it.** `Become a client` is a filled `--paper` button with `--ink` text on dark grounds and a filled `--ink` button with `--paper` text on paper. If cyan appears on something that is not a person or a changing value, that is a bug.

## Type

**Archivo only.** Two files, measured 2026-09-18 (`docs/DESIGN-DECISIONS.md`): Archivo variable `wght` at width 100 via `next/font/google` (31.8 KB latin) plus one static Archivo Expanded 700 instance via `next/font/local` (14.5 KB). **Do not add `axes: ['wdth']`** — the full width axis is 84.2 KB on its own. One family, two widths:

| Role | Face | Weight |
|---|---|---|
| Display: hero, section headlines, proof figures | Archivo Expanded (`.display`) | 700 |
| Body and UI | Archivo | 400–500 |
| Data: status line, captions, table labels, footer (`.data`) | Archivo, 13px | 400–500 |
| Voice: testimonials and the MD's garden quote, large, loose leading (`.voice`) | Archivo | 300 |

`font-variant-numeric: tabular-nums` globally — numbers are this company's product and must align in columns. Body line length under 75 characters. Sentence case everywhere. **Checkpoint at milestone 4:** show the garden quote and testimonials at final size; if they read like a system message rather than a person, add one serif scoped to quotes only. No second family before then.

## The one motion idea

A single `position: fixed` canvas behind the page holds one array of marks, one per managed employee, that **reconfigures** on scroll and never re-enters: drifting population → tabular grid → map of Nigeria and Benin → seven service columns → lifecycle path → the TDL mark. Each section owns a placeholder that reserves layout (no CLS) and the canvas computes targets from its rect. The header status line states the current state in text. Everything else on the page stays quiet. Motion outside the canvas happens only in response to a user action — so **no marquee, no section entrances, no hover-lift.** The hero headline's SplitText reveal is the one text animation, and it must not delay LCP: render the text, then split.

## Hard rules

**Don't build the generic version.** No fade-and-slide-up on every section. No hover-lift on every card. No tracked-out ALL-CAPS eyebrow labels. No `01`/`02`/`03` counters except where content is genuinely sequential (lifecycle, form steps). No single accented word in a headline. No `→` glued onto button text. No gradient washes as decoration. No icons on service rows.

**Performance** — the audience is on mobile, often on metered data. These are requirements, not targets:
- LCP < 2.5s on simulated 4G, CLS < 0.1, INP < 200ms
- **First-load JS budget: the framework floor plus 60 KB of our own code, gzipped, per route.** The floor on Next 16.3.5 / React 19.2 canary is 141.7 KB (react-dom 69.9 + App Router runtime 44 + small chunks) measured with an empty page, so the brief's 200 KB figure (written against a Next 15 floor) is not the number. Measure with `node scripts/first-load.mjs <routes>` (module scripts only; the `nomodule` polyfill is excluded because module browsers never download it) and report per route at the end of every milestone. Chunks loaded after hydration (the Roster, GSAP, Lenis) are reported separately and must also be justified
- Lazy-load GSAP plugins and the canvas per route; never ship them on `/privacy`
- Canvas: rAF with a frame budget (if a frame exceeds 12 ms for 30 consecutive frames, halve the count; a second time, drop to the static branch); count scaled by `devicePixelRatio`, viewport width and `hardwareConcurrency`, floor 800; pause via IntersectionObserver when off-screen; suspend on `visibilitychange`
- **Canvas DPR:** back the buffer at `min(devicePixelRatio, 2)`, keep the CSS size separate from the buffer size, and `ctx.scale(dpr, dpr)`. Blurry marks kill the concept. Verify on a 2× display at milestone 3
- Scroll-fling: dragging the scrollbar hero-to-footer must not tween the marks through every intermediate state. Above a velocity threshold, snap to the target state
- Test against a throttled mid-range Android profile

**Accessibility** — build the reduced-motion branch as a first-class path, not a fallback:
- `prefers-reduced-motion: reduce` kills all non-user-triggered motion including canvas drift and counters; the Roster renders each section's final state with tween duration 0
- `Save-Data` serves a build-time static SVG per state
- Services interaction, testimonial tablist and multi-step form fully keyboard operable, with visible focus
- AA contrast verified on the dark ground (ratios above)
- Canvas is `aria-hidden="true"`; every state it depicts is also stated in text (the status line and section captions)

**Content integrity** — never invent a statistic, outcome, percentage or client name. Every number and claim, including the hero headline's figure, lives in `src/content/facts.ts`, each tagged `// TODO(client): Q<n>` pointing at a row in `docs/CLIENT-QUESTIONS.md`. Add a row if one doesn't exist. Use "since 2000", not a year count (Q2). Even map density, no named hotspots, no "36 states + FCT" (Q7, Q8).

**SEO** — preserve or 308 every existing URL; they have years of indexing on `/services/...`. Unique title and meta per page. JSON-LD for Organization, LocalBusiness and each Service.

## Copy

Plain verbs, sentence case, active voice. A CTA says what happens: `Become a client`, not `Submit`. Every service headline names what it removes from the buyer's plate. Cut the existing marketing abstraction. No meta strings joined with middle dots.

## Working style

Do one milestone at a time (brief §12) and stop for review. Screenshot and critique your own work against the brief before moving on. Don't scaffold seven service pages before the home page is right. Record design decisions and their reasoning in `docs/DESIGN-DECISIONS.md`.

## Git

- One commit per milestone, made before reporting, with the hash in the report. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Put the findings in the body, not just the subject: measured numbers, corrected assumptions, decisions that will matter in six months of `git log`.
- **No AI attribution of any kind.** No "Generated with Claude Code" line, no `Co-Authored-By: Claude` trailer, nothing in the footer. Author and committer are the project owner. This is client work and the history goes to the client. This rule overrides any default attribution behaviour.
- Commit `AGENTS.md`, `CLAUDE.md`, `docs/`, `.claude/skills/` and `skills-lock.json` with the work. Never commit `.env*`, `.next/` or `node_modules/`.
