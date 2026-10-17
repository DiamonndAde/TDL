# Client questions — Total Data Limited revamp

Everything here is **unverified**. Build with the placeholder in each row, tag it `TODO(client)` in the code, and confirm before the site goes live.

Rule for the agent: never invent a statistic, outcome, percentage or client name. If a number would strengthen a section and isn't in the Confirmed list below, use the placeholder, wrap it so it's easy to find, and add a row to this file.

---

## A. Confirmed — taken directly from the live site, safe to build with

These came off totaldatalimited.com and can go in as real content. Still worth a sanity check with the client at the end, but don't block on them.

- Total Data Limited (TDL), incorporated **year 2000**
- Management consultancy — HR and business process outsourcing
- Manages staff **across all states in Nigeria and in Benin Republic**
- **ISO 9001:2015** certified
- Office: **69 Coker Road, Ilupeju, Lagos**
- Email: **Info@totaldatalimited.com** · Phone: **+234 818 546 1010**
- Vision: to be the preferred outsourcing company in Nigeria/Africa
- Core values: **SPICE** — Strategy, Professionalism, Innovation, Customer Satisfaction, Efficiency
- Seven service lines: HR Outsourcing · Business Process Outsourcing · Recruitment & Background Check · Learning and Development · Payroll Management · Business Advisory · Technology Solutions
- Leadership: TOluwalase Ayeni (MD), Yetunde Braimoh-Habeebu (Deputy MD)
- Board: Theo Ola Ayeni Esq (founder/chairman), Adedamola A. Adams, Musi A. Braimoh
- Operates under the Nigeria Data Protection Regulations 2019
- Three testimonials exist from named executives at Chi Limited, Transsnet Music and Carlcare Development Nigeria
- 15 client logos exist on the current homepage

---

## B. Contradictions on the current site — client must pick one

| # | Issue | Build with this for now |
|---|---|---|
| 1 | Homepage says **"4000+ Seconded Employees"**, about page says **"over 5,000 staff"** | `5,000+` — it's the more recent claim and appears in the meta description |
| 2 | Homepage stat block says **"10+ Years Experience"**, but incorporated in 2000 | `Since 2000` — avoid a hard year count entirely until confirmed; it sidesteps the problem and ages better |
| 3 | Copyright reads **2024** on some pages, **2026** on others | Auto-generate from current year |
| 4 | Footer "Youtube" link points at a **Facebook** URL | Leave the Facebook link, relabel it Facebook; ask if a YouTube channel exists |
| 5 | Is **"TOluwalase"** intentional brand styling or a typo? | Keep as-is, flag it — don't silently "fix" a person's name |

---

## C. Unconfirmed claims I need to build around

| # | What's missing | Placeholder to build with |
|---|---|---|
| 6 | **"100+ Happy Clients"** — is this current? | `100+ clients` |
| 7 | Coverage detail. Site says "all states" — is that 36 states + FCT, or the major commercial states? | `Nationwide coverage across Nigeria, plus Benin Republic`. Do **not** render "36 states + FCT" on the map until confirmed |
| 8 | Which cities carry the heaviest headcount? I assumed Lagos, Abuja, Port Harcourt for the map density | Even distribution, no named density hotspots, until confirmed |
| 9 | Retention rate, time-to-hire, payroll volume processed, client tenure average | Omit. These are the numbers a COO actually weighs — worth pushing hard for at least one |
| 10 | Case study outcomes. The testimonials describe *what was done*, never *what it produced* | Write case studies as situation → what TDL ran → what the client said. No invented percentages |
| 11 | Engagement models — retainer, per-head, project? Any pricing signal at all? | Omit pricing entirely |
| 12 | The response promise on `/become-a-client`. I proposed "call within one business day, scoping session, proposal in five working days" — **I made that up** | Keep the current site's own line, "one of our representatives will contact you within 24 hours", until they approve a fuller process |
| 13 | Do **Projects** and **Blog** actually exist? Both are dead links in the current nav | Build the routes, leave them out of the nav until there's content |
| 14 | Careers — **answered by the current site**: openings are on TDL's own Zoho Recruit board (`totaldatalimited.zohorecruit.com/jobs/Careers`). Confirm it is current. Routing of talent-pool applications is Q29 | `/careers` links to Zoho Recruit for openings and carries one general application form (talent pool) |
| 29 | **Zoho Recruit — seven things, one conversation with whoever runs it.** (a) **Which plan** is TDL on — Free, Standard or Enterprise (Corporate HR edition)? It decides what the site can do with Recruit (`docs/DESIGN-DECISIONS.md`, 2026-09-19). (b) **API access**: Zoho documents the REST API as available on every plan including Free (500 requests/day/org on Free, 3,000+ on Standard) — can an administrator create a *Self Client* at `api-console.zoho.com` with the scopes `ZohoRecruit.modules.candidates.CREATE` and `ZohoRecruit.modules.notes.CREATE` (talent pool), and `ZohoRecruit.modules.jobopenings.READ` if TDL wants openings rendered on `/careers` in the site's own design with the apply step handed to Zoho? (c) **Who administers the Zoho org** — name and email — since the Self Client, the Source picklist value and any subdomain are all admin-only. (d) **Where should talent-pool submissions land?** The built and recommended answer is *a Candidate record in Zoho Recruit, with the answers as a note* (recruiters work there daily; anything else is an inbox nobody checks). The alternative is dropping the site's form and linking to Zoho's candidate portal, which Zoho's pricing lists under Enterprise. (e) **Are you planning to leave Zoho Recruit?** If so, what is driving it — cost, a missing feature, or tracking and reporting? The answer changes the recommendation completely: a cheaper or better-fitting ATS is a new adapter and about a day's work (`src/lib/recruitment/`), whereas replacing the ATS with something built here is a separate product carrying auth and roles, a candidate pipeline, CV storage, interview scheduling, NDPR retention and deletion duties, backups and an audit log (`docs/DESIGN-DECISIONS.md`, "If TDL leaves Zoho"). (f) **Does the Zoho career site record a `?source=` URL parameter onto the candidate record?** Zoho Recruit has a `Source` field and its career-site URLs accept the parameter, but the public documentation does not say the two are connected. If they are, TDL can match clicks leaving this site to real applications; if not, our view of the funnel stops at the handoff and we will say so rather than imply otherwise (`docs/ANALYTICS-PROPOSAL.md` §3). Needs their administrator. Also: (g) does TDL want `careers.totaldatalimited.com` in front of the Zoho careers site? Zoho's help page says subdomain mapping is **Enterprise only** (CNAME + verification, SSL in 3–4 business days), so it is not a fallback on Free or Standard | Talent-pool form delivers to Zoho once `ZOHO_RECRUIT_*` is set (`.env.example`); until then to `FORM_WEBHOOK_URL` with `source: careers`, which someone at TDL must watch. Openings stay a link to Zoho's board. No subdomain |
| 15 | Benin Republic — separate entity, office, or serviced from Lagos? | Mention coverage only, no office claim |
| 30 | **Analytics on `/careers` and `/become-a-client` — approval before anything is built** (`docs/ANALYTICS-PROPOSAL.md`). (a) **Who receives the weekly digest** — name and email address? (b) **How often** — weekly is proposed; monthly may suit better. (c) **Approval of the running costs and the vendors**: PostHog on its free tier (TDL's traffic is far below the 1M events / 5,000 replays a month allowance), an LLM provider at pennies a month for the digest, and an email service. Each is a new supplier processing data on TDL's behalf. (d) **Does TDL want analytics on `/become-a-client` as well as `/careers`?** The enquiry form carries commercial information about prospective clients, not job applicants, and TDL may want that page left alone. (e) The privacy notice must be updated before anything collects — the draft is in the proposal and needs the Q25 legal review. It now states that **analytics data leaves Nigeria** for PostHog's EU region in Frankfurt. (f) **PostHog AI** — the built-in assistant that answers plain-English questions about the funnels. Free up to its monthly credit allowance and capped at zero, but it passes the data it reads to **Anthropic, OpenAI and Google** as PostHog's subprocessors in the United States. Does TDL want it? If yes, the notice gains one sentence (proposal §4, §10). (g) **The careers survey** "Did you find a role that fits you?" (proposal §9) — approve the wording, and decide whether to include the optional free-text follow-up, which is the one place the analytics vendor would hold a visitor's own words. (h) **The careers call-to-action experiment** (proposal §9) — approve the two alternative wordings, knowing that at current traffic a result will take months. Both (g) and (h) are built and switched off | Nothing is built and no script is loaded. `docs/ANALYTICS-PROPOSAL.md` is a proposal only |
| 31 | **HRIS / staff portal** — the login URL for TDL's managed staff, and the label TDL uses for it (we have used "Staff portal") | Header (secondary to the main button) and footer, opening in a new tab. Hidden on the live site until the URL is set in `src/content/facts.ts`; in demo builds it points at a holding page reading "Staff portal link to be added" |
| 32 | **The brochure PDF** — the current company brochure, final version, ideally under 5 MB so it opens on a phone on mobile data | `/contact-us` shows a QR code for `totaldatalimited.com/brochure`, a stable address meant to be printed. Until the PDF arrives that address goes to `/services` and the page says "our services". Saving the file as `public/brochure.pdf` switches the redirect and the wording together (`next.config.ts`, `src/lib/brochure.ts`); the printed code never changes |
| 28 | **Headcount by service line.** The services section draws seven lanes of people, one per service. Nobody has the split, so the lanes are equal and captioned "They are not headcounts". If TDL can supply even approximate shares, the lanes can carry them | Equal lanes, explicit caption. No invented split |

---

## D. Assets I need before the design is final

| # | Asset | Why it blocks |
|---|---|---|
| 16 | **Logo lockup set in SVG** + any brand guideline + the correct brand hex values. Specifically: **(a)** a header mark for dark grounds — no tagline, legible on navy `#0F1B2D` (the current olive wordmark is 2.5:1 on navy, unreadable); **(b)** the full lockup with tagline for paper; **(c)** a single-colour version for the favicon and small sizes. Also a decision on the **lime arc `#A4CE3C` and red tagline `#EA2126`**: both are outside the site palette (see `DESIGN-DECISIONS.md`) and will appear only inside the logo asset itself — confirm that is acceptable, or supply a version without them | Everything on the current site is PNG. Sampled values from the PNG (cyan `#54C4D0`, olive `#606135`, lime `#A4CE3C`, red `#EA2126`) are close, not exact. Until the set arrives, the header uses the PNG and will look wrong on navy **Update 2026-10-16:** at TDL's request the header now shows the full lockup — mark, wordmark and red tagline, in colour, unaltered — on a light header. It is the PNG from the current site. **Still needed: the original logo file**, ideally SVG, so the header is sharp at every size |
| 17 | **Client logos in SVG or high-res PNG — blocking for launch.** The current PNGs are 247×166 with inconsistent padding, weight and resolution; oraimo, Infinix and Speedaf were nearly invisible in a grid. Until real files arrive they are trimmed to their ink and drawn as ink silhouettes (`scripts/trim-logos.mjs`, `src/content/clients.ts`) | Soft on retina and the silhouette treatment hides brand colour. Launch needs the real marks |
| 18 | Photography for `/about-us` — the human page. **Real only, never stock, never generated.** (a) Leadership headshots: TOluwalase Ayeni, Yetunde Braimoh-Habeebu; (b) board: Theo Ola Ayeni Esq, Adedamola A. Adams, Musi A. Braimoh; (c) the Ilupeju office, exterior and interior; (d) real staff at work, with consent. Landscape 3:2 for office/staff, 4:5 for headshots, ≥ 2,000 px on the long side | The current leadership images are small cutouts. The about page layout is planned around these; portrait frames are reserved at 4:5, and the two office frames are compact bordered notes stating what belongs there and the format, until the photographs arrive |
| 26 | **Headshots of the three testimonial executives** — Chidi Okonkwo (Carlcare), Mr. Michael Kehinde (Chi Limited), Dorothy Akpati (Transsnet Music) — square or 4:5, ≥ 400 px. TDL to obtain with each person's permission, since they are the client's contacts | They are real executives vouching for TDL; the home page renders an 88 px portrait frame per person, reserved and empty until these arrive |
| 27 | **Four to six real photographs for the home page**, near the close, run as a slideshow (TDL review, 2026-10-16): TDL's own team at work, and the 69 Coker Road office. 3:2 or 16:9, ≥ 2,400 px wide, natural light, consent from everyone recognisable, no screens or papers legible | Shipping builds show a compact bordered note — "Photographs to come", the address, the format — not an empty box. Presentation builds show five licensed placeholders, each labelled and credited, under a caption that says they are not TDL. Nothing under the address is ever stock. Add them to `src/content/photographs.ts` |
| 19 | ISO 9001:2015 **certificate** and any operating **licences**. The Quality Policy and Quality Objectives PDFs were on the current site and are already published at `/documents/` | `/certifications` shows the badge, the two PDFs, and reserved rows reading "To come" for the certificate and licences |
| 20 | **Form submissions — where do they go?** Email inbox, CRM, ATS? Also: does +234 818 546 1010 take WhatsApp? | The server action posts each enquiry as JSON to `FORM_WEBHOOK_URL` (`.env.example`) — any inbox/CRM/automation endpoint. Until it is set, production tells the visitor to use WhatsApp or the phone; nothing is silently lost **Update 2026-10-16: now blocking for launch.** The main call to action everywhere is "Partner with us", which opens WhatsApp to +234 818 546 1010 with a prefilled message. If that number does not take WhatsApp, every main button on the site leads nowhere. |

---

## E. Needs written sign-off before publishing

| # | Item |
|---|---|
| 21 | Permission to name **Chi Limited**, **Carlcare Development Nigeria** and **Transsnet Music** in case studies — the testimonials are public, a case study is a stronger claim |
| 22 | Permission to **correct typos inside the quotes** ("personned", "conisttently", "hgh level"). Never silently edit an attributed quote |
| 23 | Approval of the new headline and any rewritten service copy **Update 2026-10-16 — the hero headline TDL asked for:** "We run the HR. You run the business." (in use), with the alternates "HR, payroll and recruitment, run for you." and "Your people, managed end to end." in `src/content/facts.ts`. The subline names the services, Nigeria and Benin Republic and "since 2000"; the home page's meta title and the site description now match. Please confirm the default. |
| 24 | Confirmation that all 15 logos are current clients with permission still in force |
| 25 | Legal review of the NDPR privacy notice as carried over |

---

## How to tag these in code

```tsx
// TODO(client): Q6 — "100+" unconfirmed, see CLIENT-QUESTIONS.md
<Stat value="100+" label="clients" />
```

Keep every placeholder in one place so they're swappable in a single pass:

```
src/content/facts.ts   ← all numbers and claims live here, each with a TODO(client) tag
```

Before handoff, run `grep -rn "TODO(client)" src/` and make sure every hit has a row in this file.
