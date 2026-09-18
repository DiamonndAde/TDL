/**
 * The seven service lines. Slugs are the CURRENT site's slugs — they carry years of indexing and are preserved,
 * not redirected (AGENTS.md, SEO). Order is the Roster's column order and the services-section row order.
 *
 * `removes` names what the service takes off the buyer's plate (brief §11). All copy here is
 * TODO(client): Q23 — new service copy needs approval before publishing.
 */
export type ServiceSlug =
  | "human-resources-outsourcing"
  | "business-process-outsourcing"
  | "recruitment-background-check"
  | "learning-and-development"
  | "payroll-management"
  | "business-advisory"
  | "technology-solutions";

export interface Service {
  slug: ServiceSlug;
  name: string;
  /** One line: what it removes from the buyer's plate. */
  removes: string;
  /** What is included, from the current site's own descriptions — not invented. */
  includes: string[];
  metaDescription: string;
}

export const services: Service[] = [
  {
    slug: "human-resources-outsourcing",
    name: "HR outsourcing",
    removes: "Contracts, onboarding, performance, welfare and exits, run by us under your name.",
    includes: ["Employee onboarding", "Employee performance", "Talent management", "Exit management"],
    metaDescription:
      "HR outsourcing from Total Data Limited: onboarding, performance, talent and exit management for staff across Nigeria and Benin Republic.",
  },
  {
    slug: "business-process-outsourcing",
    name: "Business process outsourcing",
    removes: "Finance, accounting and legal process work handled as a function, not a project.",
    includes: ["Business function outsourcing", "Finance and accounting outsourcing", "Legal process outsourcing"],
    metaDescription:
      "Business process outsourcing from Total Data Limited: finance and accounting, legal process and core function outsourcing in Nigeria.",
  },
  {
    slug: "recruitment-background-check",
    name: "Recruitment and background checks",
    removes: "Sourcing, screening and pre-employment checks, so the person you hire is the person you interviewed.",
    includes: ["Executive, professional and graduate recruitment", "Pre-employment background checks", "Cultural fit assessment"],
    metaDescription:
      "Recruitment and pre-employment background checks from Total Data Limited, for executives, professionals and graduates in Nigeria.",
  },
  {
    slug: "learning-and-development",
    name: "Learning and development",
    removes: "Leadership and skills programmes for the people we place and the people you already have.",
    includes: ["Leadership development", "Skills programmes", "Tailored organisational programmes"],
    metaDescription:
      "Learning and development programmes from Total Data Limited: leadership and skills training tailored to your organisation.",
  },
  {
    slug: "payroll-management",
    name: "Payroll management",
    removes: "PAYE, pension, HMO and every statutory remittance, on one calendar, every month.",
    includes: ["Payroll processing", "Statutory remittances: PAYE, pension, HMO", "Compliance and accuracy"],
    metaDescription:
      "Payroll management from Total Data Limited: accurate, compliant payroll and statutory remittances for staff across Nigeria.",
  },
  {
    slug: "business-advisory",
    name: "Business advisory",
    removes: "Strategy and operating advice from a firm that runs operations itself.",
    includes: ["Strategic advisory", "Growth and operating guidance"],
    metaDescription:
      "Business advisory services from Total Data Limited, a Lagos management consultancy operating since 2000.",
  },
  {
    slug: "technology-solutions",
    name: "Technology solutions",
    removes: "Software and digital transformation built around how your operation actually runs.",
    includes: ["Software development", "Digital transformation"],
    metaDescription:
      "Technology solutions from Total Data Limited: software development and digital transformation for Nigerian businesses.",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
