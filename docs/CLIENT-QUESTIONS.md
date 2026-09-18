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
| 14 | Careers — is there a live job feed, an ATS, or is it a general application inbox? | Single general application form |
| 15 | Benin Republic — separate entity, office, or serviced from Lagos? | Mention coverage only, no office claim |

---

## D. Assets I need before the design is final

| # | Asset | Why it blocks |
|---|---|---|
| 16 | **Logo lockup set in SVG** + any brand guideline + the correct brand hex values. Specifically: **(a)** a header mark for dark grounds — no tagline, legible on navy `#0F1B2D` (the current olive wordmark is 2.5:1 on navy, unreadable); **(b)** the full lockup with tagline for paper; **(c)** a single-colour version for the favicon and small sizes. Also a decision on the **lime arc `#A4CE3C` and red tagline `#EA2126`**: both are outside the site palette (see `DESIGN-DECISIONS.md`) and will appear only inside the logo asset itself — confirm that is acceptable, or supply a version without them | Everything on the current site is PNG. Sampled values from the PNG (cyan `#54C4D0`, olive `#606135`, lime `#A4CE3C`, red `#EA2126`) are close, not exact. Until the set arrives, the header uses the PNG and will look wrong on navy |
| 17 | Client logos in SVG or high-res PNG | The current ones are small and will look soft on retina |
| 18 | Photography — office, team, leadership headshots at higher resolution | Current leadership images are small cutouts |
| 19 | Quality Policy + Quality Objectives PDFs, ISO certificate, any licences | For the `/certifications` page |
| 20 | Form submissions — where do they go? Email inbox, CRM, ATS? | Determines the submit handler. Building against a simple email send until told otherwise |

---

## E. Needs written sign-off before publishing

| # | Item |
|---|---|
| 21 | Permission to name **Chi Limited**, **Carlcare Development Nigeria** and **Transsnet Music** in case studies — the testimonials are public, a case study is a stronger claim |
| 22 | Permission to **correct typos inside the quotes** ("personned", "conisttently", "hgh level"). Never silently edit an attributed quote |
| 23 | Approval of the new headline and any rewritten service copy |
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
