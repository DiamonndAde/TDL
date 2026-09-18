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
  description:
    "Management consultancy — HR and business process outsourcing across Nigeria and Benin Republic, since 2000.",
  address: {
    street: "69 Coker Road",
    locality: "Ilupeju",
    region: "Lagos",
    country: "NG",
  },
  email: "Info@totaldatalimited.com",
  phone: "+234 818 546 1010",
  phoneHref: "tel:+2348185461010",
  // TODO(client): Q20 — confirm this number takes WhatsApp; the brief asks for WhatsApp as a first-class contact
  whatsappHref: "https://wa.me/2348185461010",
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

/** Hero headline. Both variants are real copy; the default avoids the unconfirmed headcount. */
export const headline = {
  // Default until Q1 is confirmed. Chosen from three tenure variants — see DESIGN-DECISIONS.md.
  default: "Every morning since 2000, our clients' people have gone to work through us.",
  // TODO(client): Q1 — switch to this once the headcount is confirmed.
  withFigure: "5,000 people go to work for our clients every morning.",
  sub: "End-to-end HR and business process outsourcing across Nigeria and Benin Republic.",
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
    "Great talent isn't found; it's nurtured. Like a garden, it requires careful selection, patient cultivation, and the right environment to flourish. In the world of business, hiring exceptional individuals isn't a mere transaction; it's the essential groundwork for success.",
  by: "TOluwalase Ayeni",
  role: "Managing Director",
} as const;
