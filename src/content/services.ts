/**
 * The seven service lines. Slugs are the CURRENT site's slugs — they carry years of indexing and are preserved,
 * not redirected (AGENTS.md, SEO). Order is the Roster's column order and the services-section row order.
 *
 * `removes` names what the service takes off the buyer's plate (brief §11). `lines` are the sub-services from
 * the current site's own service pages, rewritten in plain verbs — the substance is theirs, the wording is new.
 * All copy here is TODO(client): Q23 — new service copy needs approval before publishing.
 */
export type ServiceSlug =
  | "human-resources-outsourcing"
  | "business-process-outsourcing"
  | "recruitment-background-check"
  | "learning-and-development"
  | "payroll-management"
  | "business-advisory"
  | "technology-solutions";

export interface ServiceLine {
  name: string;
  /** What TDL does under this line, one or two plain sentences. */
  does: string;
}

export interface Service {
  slug: ServiceSlug;
  name: string;
  /** One line: what it removes from the buyer's plate. The page headline. */
  removes: string;
  /** One plain paragraph under the headline. */
  lead: string;
  lines: ServiceLine[];
  /** Short list for the home rows and the form. */
  includes: string[];
  metaDescription: string;
}

export const services: Service[] = [
  {
    slug: "human-resources-outsourcing",
    name: "HR outsourcing",
    removes: "Contracts, onboarding, performance, welfare and exits, run by us under your name.",
    lead:
      "The whole employment relationship, from the first day to the last, handled by a team that does this for thousands of people already. Your managers keep the work; we keep the records, the process and the compliance.",
    lines: [
      { name: "Sourcing and placement", does: "We find, vet and place the people you need, and manage them once they are in post." },
      { name: "Onboarding and exit", does: "Contracts, records, first-day readiness and clean exits, run the same way every time." },
      { name: "Employee relations", does: "Discipline, grievances and day-to-day issues handled properly and documented." },
      { name: "Performance management", does: "Structured reviews, feedback and development plans on a calendar that actually runs." },
      { name: "Talent management", does: "Succession, career paths, engagement and leadership development for the people worth keeping." },
      { name: "Compensation and benefits", does: "Salary structures, benchmarking, benefits administration and incentive schemes." },
    ],
    includes: ["Employee onboarding", "Employee performance", "Talent management", "Exit management"],
    metaDescription:
      "HR outsourcing from Total Data Limited: sourcing, onboarding, employee relations, performance, talent and exit management for staff across Nigeria and Benin Republic.",
  },
  {
    slug: "business-process-outsourcing",
    name: "Business process outsourcing",
    removes: "Finance, accounting, legal process and facilities work handled as a function, not a project.",
    lead:
      "Whole functions run for you, with the people, the process and the accountability in one place. You keep the decisions; we keep them running.",
    lines: [
      { name: "Supply chain and logistics", does: "Factory and logistics operations staffed and run, so your own team stays on the work that grows the business." },
      { name: "Finance and accounting", does: "Bookkeeping, reporting, budgeting and forecasting, delivered accurately and on time." },
      { name: "Legal process", does: "Contract management, compliance monitoring and litigation support from a legal team you do not have to hire." },
      { name: "Cleaning and facility management", does: "Janitorial services, maintenance and post-construction cleaning, planned and executed to your site's needs." },
    ],
    includes: ["Business function outsourcing", "Finance and accounting outsourcing", "Legal process outsourcing"],
    metaDescription:
      "Business process outsourcing from Total Data Limited: supply chain and logistics, finance and accounting, legal process and facility management in Nigeria.",
  },
  {
    slug: "recruitment-background-check",
    name: "Recruitment and background checks",
    removes: "Sourcing, screening and pre-employment checks, so the person you hire is the person you interviewed.",
    lead:
      "From executive search to semi-skilled workforce recruitment, with a background check on every hire so nothing surprises you after the contract is signed.",
    lines: [
      { name: "Executive search", does: "Senior leaders identified, approached and assessed for the role and the organisation." },
      { name: "Experienced hires", does: "Mid and senior professionals from a network built placing people since 2000." },
      { name: "Graduate trainee recruitment", does: "Programmes that attract strong graduates and prepare them for your organisation." },
      { name: "Technical and semi-skilled workforce", does: "Volume recruitment across roles and industries, entry level to specialised." },
      { name: "Pre-employment background checks", does: "Criminal record, address, employment, education and reference checks before anyone starts." },
    ],
    includes: ["Executive, professional and graduate recruitment", "Pre-employment background checks", "Cultural fit assessment"],
    metaDescription:
      "Recruitment and pre-employment background checks from Total Data Limited: executive search, experienced hires, graduate trainees and workforce recruitment in Nigeria.",
  },
  {
    slug: "learning-and-development",
    name: "Learning and development",
    removes: "Leadership and skills programmes for the people we place and the people you already have.",
    lead:
      "Training built around your organisation's actual gaps, delivered in formats people turn up to. Leadership, technical and soft skills, with the outcome defined before the first session.",
    lines: [
      { name: "Leadership development", does: "Workshops, coaching and practical work that build a leadership pipeline at every level." },
      { name: "Technical training", does: "Skills development in specific fields, such as HR, legal, marketing and sales." },
      { name: "Soft skills training", does: "Communication, grooming, teamwork and the rest, tailored to your organisation's challenges." },
    ],
    includes: ["Leadership development", "Skills programmes", "Tailored organisational programmes"],
    metaDescription:
      "Learning and development programmes from Total Data Limited: leadership, technical and soft skills training tailored to your organisation.",
  },
  {
    slug: "payroll-management",
    name: "Payroll management",
    removes: "PAYE, pension, HMO and every statutory remittance, on one calendar, every month.",
    lead:
      "Everyone paid accurately and on time, every deduction correct, every remittance made and evidenced. The part of the month that carries your personal compliance exposure, taken off your desk.",
    lines: [
      { name: "Payroll processing", does: "Wages, deductions, payments and reports, run on secure payroll software to a fixed calendar." },
      { name: "Compliance management", does: "The processes and records that keep you inside the law, the regulations and your own policies." },
      { name: "Statutory deductions and remittances", does: "PAYE, pension, HMO and the rest, planned, remitted and documented so liabilities stay minimal." },
    ],
    includes: ["Payroll processing", "Statutory remittances: PAYE, pension, HMO", "Compliance and accuracy"],
    metaDescription:
      "Payroll management from Total Data Limited: accurate, compliant payroll processing and statutory remittances for staff across Nigeria.",
  },
  {
    slug: "business-advisory",
    name: "Business advisory",
    removes: "Strategy and operating advice from a firm that runs operations itself.",
    lead:
      "Advice from people who manage thousands of staff for other companies, on structure, compliance, succession, process and data protection.",
    lines: [
      { name: "Organisational structure", does: "Workflows, roles and communication lines clarified so the structure matches the strategy." },
      { name: "Regulatory compliance", does: "Evolving regulations tracked and applied to your operations before they become a problem." },
      { name: "Innovation and ideation", does: "Facilitated sessions, design thinking workshops and innovation labs for real problems." },
      { name: "Succession planning", does: "High-potential people identified and developed so leadership changes do not stall the business." },
      { name: "Business process optimisation", does: "Process audits, bottlenecks found, streamlined workflows implemented, costs reduced." },
      { name: "Data protection", does: "NDPR-compliant policies, procedures and technology for your data, from a firm that is NDPR-compliant itself." },
    ],
    includes: ["Strategic advisory", "Growth and operating guidance"],
    metaDescription:
      "Business advisory services from Total Data Limited: organisational structure, regulatory compliance, succession planning, process optimisation and data protection.",
  },
  {
    slug: "technology-solutions",
    name: "Technology solutions",
    removes: "Software and process automation built around how your operation actually runs.",
    lead:
      "Custom software and automation from a team that also runs operations, so the tools fit the work rather than the other way round.",
    lines: [
      { name: "Software development", does: "Web, mobile and enterprise applications built to your requirements, secure and scalable." },
      { name: "Digital transformation and process automation", does: "Repetitive work automated and workflows optimised so people spend their time on judgement, not data entry." },
    ],
    includes: ["Software development", "Digital transformation"],
    metaDescription:
      "Technology solutions from Total Data Limited: custom software development and process automation for Nigerian businesses.",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const serviceIndex = (slug: ServiceSlug) => services.findIndex((s) => s.slug === slug);
