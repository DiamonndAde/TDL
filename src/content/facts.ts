/**
 * Every number and claim on the site lives here, once.
 * Anything not in CLIENT-QUESTIONS.md §A (confirmed) carries a TODO(client) pointing at its row.
 * Before handoff: grep -rn "TODO(client)" src/ and check every hit has a row.
 */

export const company = {
  name: "Total Data Limited",
  shortName: "TDL",
  legalName: "Total Data Limited",
  incorporated: 2000,
  tagline: "professionalism anchored on integrity", // from the logo lockup; not used in copy until Q16 settles the lockup
  // The site-wide meta description. Matches the hero headline (TDL review, 2026-10-16). TODO(client): Q23.
  description:
    "We run the HR so you can run the business: HR outsourcing, payroll, recruitment and business process outsourcing across Nigeria and Benin Republic, since 2000.",
  address: {
    street: "69 Coker Road",
    locality: "Ilupeju",
    region: "Lagos",
    country: "NG",
  },
  email: "Info@totaldatalimited.com",
  phone: "+234 818 546 1010",
  phoneHref: "tel:+2348185461010",
  // TODO(client): Q20 — confirm this number takes WhatsApp. Since 2026-10-16 it is the main call to action,
  // "Partner with us", so this confirmation is now blocking for launch.
  whatsappHref: "https://wa.me/2348185461010",
  /**
   * The prefilled first message for "Partner with us". Generic everywhere except a service page, which names its
   * service so TDL knows what the conversation is about before replying. No personal data — the visitor adds
   * their own details in WhatsApp if they choose to.
   */
  whatsappMessage: {
    general: "Hello Total Data Limited, I would like to talk about partnering with you.",
    service: (serviceName: string) => `Hello Total Data Limited, I would like to talk about ${serviceName.toLowerCase()}.`,
  },
  iso: "ISO 9001:2015",
  ndpr: "Nigeria Data Protection Regulations 2019",
  social: {
    linkedin: "https://www.linkedin.com/company/total-data-ltd",
    instagram: "https://www.instagram.com/totaldataltd_",
    x: "https://x.com/totaldataltd_",
    // TODO(client): Q4 — the old footer labelled this "Youtube"; it is a Facebook profile. Ask if a YouTube channel exists.
    facebook: "https://m.facebook.com/profile.php/?id=100083561119652",
  },
  siteUrl: "https://totaldatalimited.com",
  /**
   * The HRIS login for TDL's managed staff. Shown in the header and footer as a secondary link, opening in a new
   * tab. TODO(client): Q31 — the URL and the label TDL uses for it. Until the URL is set, the link is hidden on
   * the live site and points at a holding page in demo builds (src/lib/staff-portal.ts).
   */
  staffPortal: { label: "Staff portal", url: "" },
} as const;

export const figures = {
  // TODO(client): Q1 — homepage said 4000+, about page said over 5,000. Building with 5,000+ (the more recent claim).
  staff: { value: 5000, display: "5,000+", label: "Managed staff" },
  // TODO(client): Q6 — "100+ Happy Clients" on the current site; is it current?
  clients: { value: 100, display: "100+", label: "Clients" },
  // Q2 — "since 2000" rather than a year count; sidesteps the 10-years error and ages better.
  operating: { display: "since 2000", label: "Operating" },
  certified: { display: "ISO 9001:2015", label: "Certified" },
} as const;

/**
 * Hero headline. TDL asked for a headline that says what TDL does (review, 2026-10-16); these three are theirs.
 * TODO(client): Q23 — approval of the default and the two alternates. Swap the default by changing `default`.
 * The sub names the services, the coverage and "since 2000" (Q2 — never a year count).
 */
export const headline = {
  default: "We run the HR. You run the business.",
  alternates: ["HR, payroll and recruitment, run for you.", "Your people, managed end to end."],
  sub: "HR outsourcing, payroll, recruitment, training and business process outsourcing, across Nigeria and Benin Republic since 2000.",
} as const;

export const coverage = {
  // TODO(client): Q7 — "all states" on the current site; do not render "36 states + FCT" until confirmed.
  line: "Nationwide across Nigeria, plus Benin Republic.",
  // TODO(client): Q8 — no density hotspots on the map until the client names the heavy-headcount cities.
  hotspots: [] as { name: string; lat: number; lng: number; weight: number }[],
  // TODO(client): Q15 — coverage only; no office claim for Benin Republic.
} as const;

export const process = {
  // TODO(client): Q12 — the fuller "call in one business day, scoping, proposal in five days" was invented; keep the site's own line.
  responsePromise: "One of our representatives will contact you within 24 hours.",
} as const;

export const values = [
  { letter: "S", name: "Strategy" },
  { letter: "P", name: "Professionalism" },
  { letter: "I", name: "Innovation" },
  { letter: "C", name: "Customer satisfaction" },
  { letter: "E", name: "Efficiency" },
] as const;

export const leadership = [
  // TODO(client): Q5 — "TOluwalase" is the spelling on the current site. Kept as-is; never silently change a person's name.
  { name: "TOluwalase Ayeni", role: "Managing Director" },
  { name: "Yetunde Braimoh-Habeebu", role: "Deputy Managing Director" },
] as const;

export const board = [
  { name: "Theo Ola Ayeni Esq", role: "Founder and Chairman" },
  { name: "Adedamola A. Adams", role: "Director" },
  { name: "Musi A. Braimoh", role: "Director" },
] as const;

/** The MD's garden quote, verbatim from the current site. Brief §11: keep it, give it space. */
export const gardenQuote = {
  text:
    "Great talent isn’t found; it’s nurtured. Like a garden, it requires careful selection, patient cultivation, and the right environment to flourish. In the world of business, hiring exceptional individuals isn’t a mere transaction; it’s the essential groundwork for success.",
  by: "TOluwalase Ayeni",
  role: "Managing Director",
} as const;
