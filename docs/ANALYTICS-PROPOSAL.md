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

- **Our own design**: a bottom-anchored bar on `--ink`, Archivo, the two buttons at equal weight ("Accept", "Decline") because a dark-patterned decline is both wrong and, in the EEA, non-compliant. No cookie-icon, no pre-ticked anything, and it does not block the page.
- The choice is stored in `localStorage`, not a cookie, so declining sets nothing.
- Declining is durable and re-offerable: a "Cookies" link in the footer reopens the choice.
- **`/privacy-policy` and `/cookies-policy` both need a new section** before this ships. Drafted below for Q25 legal review, **not published**.
- This is the first non-essential script on the site, so it also activates the consent gate the brief requires (§10) and `HANDOFF.md` item 5.

### Draft privacy-notice addition — for Q25 review, not for publication

> **Website analytics.** With your consent, we use PostHog, a product analytics service, to understand how visitors use our careers and enquiry pages — which pages are viewed, which links are selected, how far pages are scrolled, and at which point a form is abandoned. This helps us make those pages easier to complete.
>
> We do not send the contents of any form field to this service. What you type into a form is masked in your browser before anything is transmitted, and is never recorded. We do not use this service to identify you, and we do not combine it with the details you submit to us.
>
> Analytics runs only if you accept it. If you decline, nothing is loaded and nothing is collected, and you can change your choice at any time using the Cookies link in the footer. Data is processed on our behalf under a data processing agreement and held in the [region] region. You have the rights set out in this notice, including the right to object, under the Nigeria Data Protection Regulation.

---

## 5. Masking, and how it gets verified

Configuration: `maskAllInputs: true` (PostHog's default, stated explicitly anyway), `maskTextSelector: "*"` so all text starts masked and is unmasked only where deliberately chosen, and `ph-no-capture` on both form containers so replay shows a blank block of the right size rather than the form's content. PostHog applies masking in the browser; masked content is never transmitted.

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

## 7. What TDL needs to decide

Added to `docs/CLIENT-QUESTIONS.md` as Q30, and one part appended to Q29:

- **Q29(g)** — does the Zoho career site record a `?source=` URL parameter onto the candidate record, so TDL can match clicks from this site to real applications? Needs their administrator.
- **Q30** — who receives the weekly digest (name and address), how often (weekly is proposed; monthly may suit better), and approval of the running costs and the vendors: PostHog free tier, an LLM provider at pennies a month, and an email service. Also whether TDL wants analytics at all on `/become-a-client` as well as `/careers`, since the enquiry form carries commercial information about prospective clients rather than job applicants.

---

## 8. If approved, the build order

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
