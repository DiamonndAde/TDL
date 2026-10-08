# Behavioural analytics on `/careers` and `/become-a-client` — proposal

**Status: approved with conditions and built 2026-09-30 — and switched off.** No project key is set in any
environment, so the banner does not render, the SDK is never fetched and no request is made. What was built and
measured is recorded in `docs/DESIGN-DECISIONS.md` ("Built 2026-09-30"). The weekly LLM digest at the end of
this document is **not** built and is the one piece still awaiting a decision (Q30).
Researched 2026-09-29 against each vendor's current docs and pricing; every size figure was measured, not quoted.

TDL wants to know where people drop off on `/careers` — what they click, how far they scroll, where they give up. The same question applies to `/become-a-client`, which is the money page. This sets out the tool, the events, the consent gate, the masking, and a weekly digest, with the costs and the things that need TDL's decision.

---

## 1. Tool: PostHog, with the weight cost stated plainly

| | Microsoft Clarity | PostHog |
|---|---|---|
| Price at TDL's traffic | Free forever, no traffic limit, no sampling below 100k sessions/day | Free tier 1M events and 5,000 replays a month — TDL will not approach either |
| Funnels | Yes, code-free. Per stage: count and percentage that progressed and that didn't, plus median time to convert. Steps are page visits, button clicks or API events | Yes. Per-step drop-off, breakdowns by any event property, arbitrary date ranges |
| **Event properties** | **None.** `clarity("event", "name")` takes a string and nothing else | Arbitrary properties per event |
| Custom events available as funnel steps | Max 20 user-defined smart events per project | No practical limit |
| Session replay | Yes, unlimited | Yes, 5,000/month free |
| Heatmaps | Yes (click, scroll) | Yes |
| Input masking | All input contents and dropdowns masked in every mode, **not customisable** | `maskAllInputs` true by default; text masked by selector; masking happens in the browser |
| Hosting region | Microsoft Azure; EU customers contract with Microsoft Ireland | Choice of US or EU (Frankfurt) at project creation |
| **Legal posture** | **Microsoft is a data controller** — it uses the data for its own purposes, including advertising optimisation | Processor under a DPA; the data is TDL's |
| Retention | Playback 30 days; click data and favourited sessions 9 months | Configurable |
| Aggregate API for a digest | Export API: last **1–3 days only**, **10 requests/day**, dashboard metrics by dimension — **no funnel data** | Full query API over any date range, funnels included |
| **Measured script weight** | **26.1 KB** over the wire (brotli), v0.8.19, everything included | **96 KB** `array.js`, plus **40 KB** `recorder.js` when replay is on |

**Recommendation: PostHog.** Three reasons, in order:

1. **Field-level drop-off needs event properties, and Clarity has none.** "Which field do people abandon on?" is one PostHog event (`form_field_left`) with a `field` property. In Clarity it is one distinct named event per field — and user-defined smart events are capped at 20, against roughly 25 fields across the two forms. Clarity can tell you *which step* people leave at; it cannot tell you *which field* without exhausting its own budget. The brief weighted funnel drop-off most, so this decides it.
2. **The weekly digest is impossible on Clarity without us storing data.** Its export API reaches back 1–3 days, allows 10 calls a day, and returns no funnel data. A weekly summary would mean pulling daily and keeping the numbers somewhere — a database we have deliberately refused to build (`docs/DESIGN-DECISIONS.md`, recruitment adapter). PostHog answers a 7-day funnel query in one call.
3. **Microsoft is a data controller, not a processor.** Clarity is free because the behavioural data feeds Microsoft's own advertising and product work. On a site whose subject is other people's employment — including applicants' behaviour on a job form — handing that stream to an advertising business as its own controller is a harder thing to defend to TDL's own clients than paying nothing to a processor under a DPA. This alone would not decide it; combined with (1) and (2) it is settled.

**The honest cost of choosing PostHog is weight: ~96 KB after consent, against Clarity's 26 KB, for an audience on metered mobile data.** Mitigations, to be measured during the trial rather than assumed: load nothing until consent *and* first paint (the existing `useAfterFirstPaint` pattern), keep session replay off `/` entirely and enable it only on the two funnel routes, and evaluate PostHog's slim build, which drops roughly 40 KB by making extensions opt-in. **First-load JS impact is zero on every route** — the consent banner is our own markup and about 1–2 KB of our own code; the vendor script is fetched only after a click, so it never enters the first-load budget measured by `scripts/first-load.mjs`.

Two things to check before committing, both quick: Clarity's docs state it "shouldn't be used on any websites/apps targeting users under the age of 18" — worth confirming the equivalent PostHog position given a careers page may attract school leavers; and PostHog's EU region must be selected **at project creation**, because it cannot be changed afterwards.

---

## 2. Events

Naming: `snake_case`, past tense, one verb. Every event carries `route` and `step`. **No event ever carries a field's value** — only that the field was reached, left empty, or completed.

### `/careers`

| Event | Properties | Fired when |
|---|---|---|
| `careers_viewed` | — | Page view |
| `openings_clicked` | `destination: "ats"` | "See current openings" pressed — the handoff out to the ATS |
| `talent_pool_started` | — | First interaction with any form field |
| `form_field_focused` | `field`, `index` | A field receives focus |
| `form_field_left` | `field`, `index`, `state: "empty" \| "filled" \| "invalid"` | Blur. **`state`, never the value** |
| `form_validation_failed` | `field`, `reason` (the schema's error code, not the input) | Submit blocked |
| `talent_pool_submitted` | `fields_completed` (count) | Server action returned ok |
| `talent_pool_failed` | `reason: "delivery" \| "unconfigured"` | Delivery failed |

Scroll depth comes from PostHog's autocapture of scroll, not a custom event.

### `/become-a-client`

| Event | Properties | Fired when |
|---|---|---|
| `enquiry_viewed` | `preselected_service` (slug or `none`) | Page view |
| `enquiry_step_viewed` | `step: 1 \| 2 \| 3` | Step rendered |
| `enquiry_step_completed` | `step` | "Continue" accepted |
| `enquiry_step_blocked` | `step`, `first_invalid_field` | "Continue" rejected by validation |
| `enquiry_step_back` | `step` | "Back" pressed |
| `form_field_focused` / `form_field_left` | as above | as above |
| `enquiry_submitted` | `services_count`, `headcount_band` | Server action returned ok |

`headcount_band` is the band the visitor selected (it is already a bucket, not a number), and `services_count` is a count. Neither identifies anyone.

### Funnels to build

1. **Careers:** `careers_viewed` → `talent_pool_started` → `talent_pool_submitted`, with `openings_clicked` as a separate exit path, since leaving for the ATS is a success, not a drop-off. This distinction matters and is easy to get wrong.
2. **Careers, field level:** `form_field_left` broken down by `field` and `state`, which answers "which question loses people".
3. **Enquiry:** `enquiry_viewed` → step 1 → step 2 → step 3 → `enquiry_submitted`, plus the same field breakdown.

### Where the code would live

- A thin `src/lib/analytics/` module with one `track(event, props)` function and a no-op when consent is absent. Pages and forms call that, never the vendor SDK — the same shape as the recruitment adapter, so the vendor is swappable and `scripts/check-adapter.mjs` can be extended to enforce it.
- **Anything touching recruitment goes through the recruitment adapter**, as instructed: `openings_clicked` and the outbound URL's source parameter belong behind `RecruitmentProvider`, because how an ATS records "where did this candidate come from" is provider knowledge. That means adding one optional member to the interface — `applyHandoffUrl(opening, source)` — so the analytics module asks the adapter for the decorated URL and never knows the parameter's name.

---

## 3. The handoff gap we cannot close ourselves

Applications finish inside the ATS. We can see the click that leaves our site; we cannot see whether it became an application. That is the single largest blind spot in the funnel, and it is the difference between "112 people clicked through" and "9 of them applied".

Zoho Recruit has a `Source` field on candidate records and its career site URLs are known to accept a `?source=` parameter, but **Zoho's public documentation does not state that the career site writes a URL parameter into that field**, and I could not confirm it without access to TDL's org. Their administrator can answer it in minutes. Added to Q29. If it works, our outbound links carry a stable source value and TDL can match our click counts to real applications inside Zoho; if not, the honest position is that the funnel ends at the handoff, and we say so on the dashboard rather than implying otherwise.

---

## 4. Consent

Nothing loads before consent. The order is: first paint → banner → visitor accepts → script fetched.

- **Our own design**: a bottom-anchored bar on `--ink`, Archivo, the two buttons ("Accept", "Reject") visually identical apart from the word, because a dark-patterned refusal is both wrong and, in the EEA, non-compliant. No cookie-icon, no pre-ticked anything, and it does not block the page.
- The choice is stored in `localStorage`, not a cookie, so declining sets nothing.
- Declining is durable and re-offerable: "Analytics choice" in the footer reopens it.
- **`/privacy-policy` and `/cookies-policy` both need a new section** before this ships. Drafted below for Q25 legal review, **not published**.
- This is the first non-essential script on the site, so it also activates the consent gate the brief requires (§10) and `HANDOFF.md` item 5.

### Draft privacy-notice addition — for Q25 review, not for publication

> **Website analytics.** With your consent, we use PostHog, a product analytics service, to understand how visitors use our careers and enquiry pages — which pages are viewed, which links are selected, how far pages are scrolled, and at which point a form is abandoned. This helps us make those pages easier to complete.
>
> We do not send the contents of any form field to this service. What you type into a form is masked in your browser before anything is transmitted, and is never recorded. We do not use this service to identify you, and we do not combine it with the details you submit to us.
>
> Analytics runs only if you accept it. If you decline, nothing is loaded and nothing is collected, and you can change your choice at any time using "Analytics choice" in the footer.
>
> **Where this data goes.** Analytics data leaves Nigeria. It is processed on our behalf by PostHog Inc. under a data processing agreement and stored in PostHog's European Union region, in Frankfurt, Germany, on Amazon Web Services infrastructure. PostHog's other subprocessors for this service are listed at posthog.com/subprocessors. [If PostHog AI is enabled — see the note below — add: "When we use PostHog's built-in assistant to ask questions about these statistics, the data it reads is passed to Anthropic, OpenAI and Google as PostHog's subprocessors, in the United States, under the same agreement; they may not use it to train their models."]
>
> We keep a recording of how a small, random share of visitors use the careers page, so that we can see where the page is hard to use. These recordings never contain what you type: every form field and all page text is masked in your browser before anything is sent. If a submission fails, we record only that it failed and the general reason — for example, that our server could not be reached — never what you had entered.
>
> We do not identify you, we do not create a profile of you, and we do not combine this information with the details you submit to us. You have the rights set out in this notice, including the right to object, under the Nigeria Data Protection Regulation.

**Notes for the reviewer.** (1) The transfer outside Nigeria is the material point: the NDPR permits it to a jurisdiction with adequate protection or under appropriate safeguards, and the reviewer should confirm the DPA and the EU region satisfy that. (2) The bracketed PostHog AI sentence applies only if TDL enables that feature (§10); it adds three US subprocessors. (3) "A small, random share" is 5% of careers visitors (§7) — state the figure if the reviewer prefers precision to plain language.

---

## 5. Masking, and how it gets verified

Configuration as built: `maskAllInputs: true` (PostHog's default, stated explicitly anyway), `maskTextSelector: "*"` so all text is masked and nothing is deliberately unmasked, and `mask_all_text: true` so autocapture cannot read the text of what it records a click on. PostHog applies masking in the browser; masked content is never transmitted. (`ph-no-capture` on the form containers, proposed here originally, was not needed: with every input and every text node masked, the replay shows the form's layout and nothing in it, which is more useful for diagnosing drop-off than a blank block.)

**Verification is a recorded test session, not a reading of the config.** The test: fill both forms end to end with marked canary values — an email, a phone number, a name and a sentence of free text, each containing a unique token. Then, from the PostHog UI, open the resulting replay and confirm visually that every field renders masked; and separately, query the captured events and the replay's own export for each canary token, which must return nothing. Both halves matter: the visual check catches a field rendering in clear, the token search catches a value that was transmitted but not displayed. This would be scripted as `scripts/masking-proof.py` and run on every change to a form, in the same style as the existing proofs. **If the token search returns anything at all, analytics does not ship.**

---

## 6. Weekly digest

### First: most of this already exists

PostHog ships a **weekly digest** and **alerts on insights**, and **PostHog AI** answers plain-English questions about the data and builds insights. So the recommendation is deliberately smaller than the brief:

**Phase one — zero code, zero cost.** Turn on PostHog's own weekly digest and point it at TDL's HR recipient; build the three funnels above as saved insights; set an alert on the talent-pool conversion rate. Then see whether TDL actually reads it. A great many "weekly summary" builds die unread, and this costs nothing to find out.

**Phase two — only if TDL wants it in their own words, in their own inbox.** Then build the cron job below. It is worth building only if phase one is being read and the answer is "yes, but plainer / in our words / to these three people".

### If phase two is approved

- **Vercel Cron** (`vercel.json`, 100 jobs per project on every plan, UTC only) hitting a route that requires `CRON_SECRET`, `0 6 * * 1` — Monday 06:00 UTC, which is 07:00 Lagos.
- The route queries PostHog for **aggregate numbers only** over the previous seven days: sessions per funnel, conversion rate per step, drop-off count and rate per step, the worst three fields by abandonment rate, and the same four figures for the previous week for comparison.
- An LLM turns that into six or seven plain sentences. **Provider by env var** (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`) so DeepSeek, Anthropic or another can be swapped without code. Cost at one call a week with a payload this small is negligible — cents per month on any provider — but it is a running cost and a vendor, which is why Q30 asks TDL to approve it.
- Email via whichever service TDL already uses; if none, Resend. One more vendor, and Q30 covers it.

### The hard rule, enforced in code

No personal data, no session content, no free text from any form may reach the LLM or the email. Enforced, not commented:

- The payload has a **zod schema whose leaves are numbers, ISO dates, and a closed enum of step and field *names*** — `services`, `headcount`, `email` as identifiers, never as values. Anything else fails the parse.
- A second `assertAggregateOnly()` pass runs over the serialised payload and **throws** on: any `@`, any run of 7+ digits, any string longer than 40 characters, and any key not in the schema's allow-list. Belt and braces, because the schema protects the shape and the scan protects against a shape that is legal but carries a smuggled string.
- The digest route **never queries session-level or person-level endpoints** — only aggregate funnel and trend queries. This is a lint-style check in `scripts/check-adapter.mjs`, extended to the analytics module.
- Unit tests assert that a payload containing an email, a phone number or a sentence of free text is rejected. Those tests are the specification; if they pass, the rule holds by construction rather than by review.

---

## 7. Viral-posting guard: replay at 5%

A popular job posting can send tens of thousands of people to `/careers` in a few days. Replay is the product
with a hard monthly allowance — 5,000 recordings on the free plan — and with the billing limits at zero (§11),
a spent allowance does not cost money: **PostHog stops ingesting replay for the rest of the month and that data
is lost for good.** So the risk is not a bill; it is that one viral week spends the month's recordings on whoever
happened to arrive first, and replay is dark when it is next needed.

| | Visitors | at 25% (old default) | **at 5% (new default)** |
|---|---|---|---|
| A viral week | 20,000 | 5,000 — the whole month, gone | **1,000 — 20% of the month** |
| A whole viral month | 80,000 | 20,000 — four times the allowance | **4,000 — inside the allowance** |
| A normal month (a few hundred) | ~300 | ~75 | ~15 |

**Five per cent survives 20,000 visitors in a week, and survives four such weeks back to back.** The cost is the
bottom row: in an ordinary month 5% yields around fifteen recordings. That is enough to see a pattern and not
enough to study one, which is why the rate is an environment variable
(`NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE`): raise it to 0.25 for a deliberate investigation in a quiet fortnight,
check the arithmetic above against current traffic, and put it back.

The other guards were already in place and still hold: replay is **URL-scoped** to `/careers` (and
`/become-a-client` only if Q30d approves it), never the home route, so a viral posting's visitors who land
elsewhere cost nothing; the sampling draw is made once per session so the 5% are whole sessions, not fragments;
and nobody is identified (`person_profiles: "never"`, no `identify()` anywhere — `scripts/check-adapter.mjs`
fails the build on either, and was shown to catch `client?.identify(...)` and `posthog.setPersonProperties(...)`
before being trusted).

Funnels and events are unaffected by any of this. The free allowance for events is 1,000,000 a month; a viral
week of 20,000 visitors producing perhaps 15 events each is 300,000. Measurement does not need a guard; only
replay does.

## 8. Error tracking on the two forms

TDL needs to know when a submission fails. Both forms now send a failure event — `talent_pool_failed` and
`enquiry_failed` — whose only property is a **reason from a closed list**: `delivery` (the ATS or webhook
refused), `unconfigured` (nothing is wired up to receive it — a deployment mistake, and the loudest one),
`validation` (the server disagreed with the browser), `network` (the request never completed).

**PostHog's exception autocapture is deliberately left off** (`capture_exceptions: false`, enforced by the
boundary check). An unhandled error's message and stack carry whatever was being processed when it threw, and
on these two routes that is an applicant's answers. A fixed vocabulary tells TDL that submissions are failing and
which way, and can contain nothing else by construction. The server actions now return the reason alongside the
visitor-facing sentence, so nothing has to string-match the message to classify it — the first version did, and
would have misfiled failures the moment the wording changed.

**The canary test found two real bugs here, both now fixed:**

1. **A network failure was invisible.** When the server action cannot be reached it throws rather than returning
   `{ok: false}`. Nothing caught it: the visitor was left looking at "Sending" with no message, and no failure
   event fired, so TDL would never have heard of it. Both forms now catch it, tell the visitor "We could not
   reach our server. Check your connection and try again.", reset the button, and report `network`.
2. **An attempt to save a request silently killed replay.** Setting `advanced_disable_flags` while the experiment
   is off — to avoid one flags request per page — also disables the remote config that switches recording on.
   Replay recorded nothing, with no error anywhere. Removed; the comment where it was says why.

**Verified with the canary test**, which now submits the fully-filled talent-pool form with the server action
cut off, so the failure path runs with every canary present: **15 payloads, 66,597 bytes — 12 event payloads
and 3 replay payloads — the `talent_pool_failed` event present, and no canary token under any decoding.** The
test fails if the failure event is absent, so it cannot pass by never reaching the error path.

## 9. Prepared and switched off: the careers survey and the CTA experiment

Both are wired and both are off. TDL switches each on with one environment variable and a few minutes in the
PostHog project; no code changes.

### Survey — "Did you find a role that fits you?"

The SDK only loads the surveys script when `NEXT_PUBLIC_ANALYTICS_SURVEYS=true`; today it is `disable_surveys:
true`. The survey itself lives in PostHog, so this is its exact definition, to create when TDL is ready:

| Setting | Value |
|---|---|
| Type | Popover |
| Question | Did you find a role that fits you? |
| Answers | Single choice: *Yes* / *Not yet* / *I wasn't looking for one* |
| Follow-up (only after *Not yet*) | Optional open text: "What kind of role were you hoping to find?" |
| Shown on | URL contains `/careers` |
| When | After 30 seconds on the page, or on scroll past 50% — not on arrival |
| How often | Once per visitor; never again after an answer or a dismissal |
| Appearance | Background `#0F1B2D`, text `#FAFAF8`, button `#FAFAF8` on `#0F1B2D`, no PostHog branding, Archivo |

Two cautions for whoever creates it. **The open-text follow-up is free text**, the one place on the site where a
visitor's own words are deliberately collected by the analytics vendor rather than by TDL's ATS — the privacy
notice must say so before it is switched on, and it should be left out if TDL would rather not hold it. And
PostHog renders the popover in its own markup: the colours above bring it close to the site, not identical, and
it should be screenshotted against the design before going live. The free allowance is 1,500 responses a month.

### Experiment — the careers call-to-action

`useCtaVariant()` returns the button's wording. With `NEXT_PUBLIC_ANALYTICS_EXPERIMENTS` unset it **always
returns the control** — "See current openings", exactly as today — and never reads a flag. Switched on, it reads
the PostHog flag `careers-cta` and maps the variant to one of three labels:

| Variant | Label | Hypothesis |
|---|---|---|
| `control` | See current openings | — |
| `roles` | See open roles | Names the thing offered, not the act of looking |
| `apply` | Find a role and apply | Names the outcome the visitor wants |

The variant is attached to the `openings_clicked` event, so the result can be read from the funnel as well as
from PostHog's experiment view. The success metric is click-through on that button. The design rules:

- **No flicker.** The control is server-rendered and stays put unless a known variant arrives within four
  seconds; a slow or missing flag means the visitor simply sees today's button. A call-to-action that changes
  under the reader is worse than no experiment.
- **Unknown variants are ignored**, so a typo in the PostHog dashboard cannot put an arbitrary string on the
  page.
- **Variant names live in the event contract** (`CtaVariantName` in `events.ts`) and the label map is typed
  against it, so the two cannot drift.

To switch on: create a multivariate flag `careers-cta` with variants `control`, `roles`, `apply` at a third
each, create an experiment on it with `openings_clicked` as the goal, then set the environment variable and
redeploy. Run it until PostHog reports significance — at a few hundred careers visitors a month that is likely
to be months, not weeks, which is worth knowing before starting. Flags are free up to 1,000,000 requests a month.

## 10. PostHog AI: phase one of the AI digest

**Yes, with one decision attached.** PostHog's built-in assistant answers plain-English questions about the
project's data — "where do people drop off on the careers form this week?", "is the talent-pool conversion rate
lower than last month?" — by building the funnel or trend query itself and explaining the result. That is the
core of what the phase-two digest would do, available now with no code.

Availability and cost: PostHog's documentation describes the capability but not the plan rules; secondary
sources consistently report **2,000 free AI credits a month on every plan, including free, then $0.01 a credit**.
With the AI billing limit at zero (§11) the assistant cannot cost money — it stops at the allowance. Confirm the
credit figure in the billing page when the project is created.

**The decision: PostHog AI sends the data it reads to third parties.** PostHog's own AI FAQ states that PostHog
AI runs on third-party providers and that messages and all data the assistant accesses pass through them;
PostHog lists **Anthropic, OpenAI and Alphabet** as subprocessors for it, plus Azure for semantic search. The DPA
forbids them from training on it. Two consequences:

- It is **off until an organisation administrator approves AI features** — PostHog will not send anything to an
  AI provider without that. So it is not on by accident, and turning it on is a deliberate act.
- If TDL turns it on, **the privacy notice gains the bracketed sentence in §4**, because the data now reaches
  three more companies in the United States. Also switch off "Enable AI training on anonymized data" in the
  organisation settings, which is a separate PostHog setting from the subprocessors' own training ban.

So the AI digest now has three phases, each optional and each cheaper than the next:

| Phase | What | Cost | Data leaves to |
|---|---|---|---|
| **1a** | PostHog's own weekly digest and alerts | Free, no code | PostHog only |
| **1b** | PostHog AI, asked by someone at TDL in the dashboard | Free up to the credit allowance; capped at zero | + Anthropic, OpenAI, Google |
| **2** | Our cron job writing a plain-English email to HR (below) | ~1 day to build; cents a month | + one LLM of TDL's choosing, aggregates only |

The honest difference between 1b and 2: PostHog AI answers whoever asks, inside the tool, and needs a PostHog
seat. Phase two delivers an answer nobody asked for, to an inbox, to people who will never log in. If TDL's HR
team is the audience, that difference is the whole case for building it.

## 11. Billing limits at zero, on every product

**This is a setting in the PostHog organisation, and it cannot be done from the codebase.** No PostHog project
exists yet; whoever creates it must set it before the key is ever deployed. It is item 1 of the analytics block
in `HANDOFF.md`'s launch checklist.

What PostHog's billing documentation confirms: limits are set **per product**, in the organisation's billing
settings; once a limit is reached **PostHog stops ingesting and processing that product's data so you are not
charged over it, and the excess data is lost for good**; and alert emails go to the organisation owner at **80%
and 100%** of each limit — the same alerts fire for the free allowance. Secondary sources state explicitly that
**$0 is a valid limit**; confirm that in the billing page.

Set a $0 limit on every product: product analytics, session replay, feature flags, surveys, error tracking,
PostHog AI, and any product added later. The effect is that the free allowance becomes a ceiling rather than a
starting point — nothing can be billed, and the 80% email is the signal to look at the sample rate before the
ceiling is hit. Combined with §7, a viral posting degrades replay gracefully rather than either spending money or
switching replay off mid-month.

---

## 12. What TDL needs to decide

Added to `docs/CLIENT-QUESTIONS.md` as Q30, and one part appended to Q29:

- **Q29(g)** — does the Zoho career site record a `?source=` URL parameter onto the candidate record, so TDL can match clicks from this site to real applications? Needs their administrator.
- **Q30** — who receives the weekly digest (name and address), how often (weekly is proposed; monthly may suit better), and approval of the running costs and the vendors: PostHog free tier, an LLM provider at pennies a month, and an email service. Also whether TDL wants analytics at all on `/become-a-client` as well as `/careers`, since the enquiry form carries commercial information about prospective clients rather than job applicants.

---

## 13. If approved, the build order

1. Consent banner and the two policy sections (Q25 sign-off first — the notice must be live before anything collects).
2. `src/lib/analytics/` with the no-op default, and the adapter member for the ATS handoff URL.
3. Events on `/careers`, then `/become-a-client`.
4. `scripts/masking-proof.py`, run before the first deploy. Nothing ships if a canary token appears.
5. Funnels and PostHog's own weekly digest. **Stop here and watch for a month.**
6. Cron digest only if TDL asks for it after that month.

---

## Phase two: a written weekly digest — optional, not built

**Phase one is what ships and what TDL should try first: PostHog's own weekly digest and insight alerts.** They
cost nothing, need no code, no extra vendor and no further legal review, and they are turned on in the PostHog
project settings in about a minute. Point them at TDL's HR recipient, build the three funnels, set an alert on
the talent-pool conversion rate, and leave it for a month.

This section is here so the option can be pitched, not because it should be built now.

### What the built-in digest does and does not do

| | PostHog's built-in digest | A written digest we build |
|---|---|---|
| Effort and cost | None. A setting | ~1 day, plus a running cost |
| Format | PostHog's own layout and vocabulary — "insights", "cohorts", "trends" | Six or seven plain sentences in TDL's language |
| Content | Whatever changed across the project, chosen by PostHog | Only the two funnels, only what a recruiter or an HR director can act on |
| Judgement | Reports movement | Can say *which field* lost the most people this week and whether that is worse than last week |
| Audience | Someone who knows the tool | Someone who has never opened it and never will |
| Access | The recipient needs a PostHog seat to follow a link | Plain email, no account, no login |

That last row is the real argument. If the people who should read this are TDL's HR team rather than whoever
administers the analytics account, a digest that requires a seat to act on is a digest that gets forwarded and
then ignored.

### What it would be

- **Vercel Cron** (`vercel.json`; 100 jobs per project on every plan, UTC only) calling a route guarded by
  `CRON_SECRET`, at `0 6 * * 1` — Monday 06:00 UTC, 07:00 Lagos.
- The route runs **aggregate queries only** over the previous seven days: sessions per funnel, conversion rate
  and drop-off per step, the worst three fields by abandonment, and the same four figures for the week before
  so the summary can say "better" or "worse" rather than just a number.
- An LLM writes six or seven sentences from those numbers. **Provider by environment variable**
  (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`) so DeepSeek, Anthropic or another can be swapped without code.
- Email through whatever service TDL already uses; if none, Resend.

### The hard rule, and how it is enforced

No personal data, no session content, and no free text from any form may reach the LLM or the email. Enforced in
code, in three places, not asserted in a comment:

1. A **zod schema whose leaves are numbers, ISO dates and a closed enum of step and field names** — `email` as
   an identifier, never as a value. Anything else fails the parse and the job aborts.
2. An **`assertAggregateOnly()` pass** over the serialised payload that throws on any `@`, any run of seven or
   more digits, any string longer than 40 characters, and any key outside the schema's allow-list. The schema
   protects the shape; this protects against a shape that is legal but carries a smuggled string.
3. The route **never calls a session-level or person-level endpoint** — only aggregate funnel and trend
   queries. This is a static check in `scripts/check-adapter.mjs`, extended to the analytics module, so it
   fails the build rather than being noticed in review.

Unit tests assert that a payload containing an email address, a phone number or a sentence of free text is
rejected. Those tests are the specification.

### Running cost, honestly

The LLM call is one request a week against a payload of a few dozen numbers: **cents per month on any provider**,
and it would stay in that range even at ten times TDL's traffic. The email service is free at this volume on
every major provider's entry tier. PostHog itself stays on its free allowance (1M events and 5,000 replays a
month; TDL will not approach either). So the running cost is negligible — but it is three vendors instead of
one, three places for a key to leak, and one more thing to maintain, which is the actual price and the reason
this is a decision rather than a default. Q30 asks TDL to approve it.

### Recommendation

Run phase one for a month. If the built-in digest is being read and acted on, stop there. Build this only if
TDL says the built-in one is going unread *because* of how it reads — which is a real and common answer, and
the only one that justifies the extra vendor.
