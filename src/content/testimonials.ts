/**
 * Verbatim from the current site, including its typos ("personned", "conisttently", "hgh").
 * TODO(client): Q22 — permission to correct typos inside attributed quotes. Until then, `corrected` is not rendered.
 * TODO(client): Q21 — permission to name these companies in case studies (a stronger claim than a testimonial).
 *
 * `pull` is the sentence shown large in the testimonials section; `full` is the whole quote, shown on expand.
 */
export interface Testimonial {
  id: "chi" | "transsnet" | "carlcare";
  company: string;
  person: string;
  role: string;
  logo: { src: string; width: number; height: number; alt: string };
  pull: string;
  full: string[];
}

export const testimonials: Testimonial[] = [
  {
    id: "carlcare",
    company: "Carlcare Development Nigeria Limited",
    person: "Chidi Okonkwo",
    role: "General Manager",
    logo: { src: "/clients/carc.jpg", width: 160, height: 80, alt: "Carlcare" },
    pull:
      "Total Data Limited has been our longstanding partner for over ten years, and our collaboration with them has been exceptional.",
    full: [
      "When Carlcare Development Nigeria Limited first started business in Nigeria, there were not the extensive Human Resources compliance requirements that there are today. Total Data Limited, our HR Partners, has assisted us by formalizing our policies and updating our employment records to make sure we meet these requirements. This has enabled Carlcare Development Nigeria Limited to focus on what we do best, providing after sales support and promotional services for TECNO Mobile, Infinix Mobility, Itel Mobile, Oraimo accessories, and we continue to provide good services to our customers.",
      "HR services provided by Total Data Limited proved a valuable resource for personned matters including recruitment, payroll management, staff welfare benefits, training, HMO, staff pension, employee taxes, and other statutory requirements. The Total Data Limited team is professional, knowledgeable, creative in their approach and we have confidence in managing employment matters with their involvement and understanding of our organization.",
      "Total Data Limited has been our longstanding partner for over ten years, and our collaboration with them has been exceptional. They have been a supportive HR partner to our organization, conisttently demonstrating a hgh level of professionalism.",
    ],
  },
  {
    id: "chi",
    company: "Chi Limited",
    person: "Mr. Michael Kehinde",
    role: "Head, Supply Chain and Logistics",
    logo: { src: "/clients/chi-limited.jpg", width: 160, height: 80, alt: "Chi Limited" },
    pull:
      "Their dedication, reliability, and adaptability have greatly contributed to the increased efficiency and productivity of our organization.",
    full: [
      "Total Data Limited has shown great passion in delivering people requirement. They have been instrumental in meeting our people needs.",
      "Their dedication, reliability, and adaptability have greatly contributed to the increased efficiency and productivity of our organization. We appreciate their professionalism and seamless coordination towards delivering our business objectives.",
    ],
  },
  {
    id: "transsnet",
    company: "Transsnet Music",
    person: "Dorothy Akpati",
    role: "HR Business Partner",
    logo: { src: "/clients/transnet-music.jpg", width: 160, height: 80, alt: "Transsnet Music (Boomplay)" },
    pull:
      "They possess an impressive breadth of knowledge across various HR functions and are always up-to-date with current industry trends and regulations. This allows us to remain compliant.",
    full: [
      "Our partnership with Total Data Limited goes back in years... And the experience has been nothing short of satisfactory!!!",
      "The exceptional HR service, the level of professionalism, expertise, and support you have consistently demonstrated has truly exceeded our expectations.",
      "Furthermore, I would like to acknowledge the professionalism exhibited by each member of your staff. They possess an impressive breadth of knowledge across various HR functions and are always up-to-date with current industry trends and regulations. This allows us to remain compliant while implementing best practices within our organization.",
      "Thank you once again for helping us optimize our HR operations and contributing significantly towards driving organizational success.",
    ],
  },
];

/**
 * Case studies: situation → what TDL ran → what the client said. Built only from the public testimonials above.
 * No outcomes or percentages — Q10. Names gated on Q21.
 */
export interface CaseStudy {
  id: Testimonial["id"];
  company: string;
  sector: string;
  situation: string;
  ran: string;
  said: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "carlcare",
    company: "Carlcare Development Nigeria",
    sector: "After-sales support for TECNO, Infinix, itel and Oraimo",
    situation:
      "Started operating in Nigeria before today's HR compliance requirements existed, and needed policies and employment records brought up to the current standard.",
    ran: "Formalised HR policies and updated employment records; ran recruitment, payroll, welfare benefits, training, HMO, pension, employee taxes and other statutory requirements. A partnership of over ten years.",
    said: "Enabled Carlcare to focus on what they do best: after-sales support and promotional services.",
  },
  {
    id: "chi",
    company: "Chi Limited",
    sector: "Food and beverage manufacturing",
    situation: "People requirements across supply chain and logistics operations.",
    ran: "Delivered and coordinated the people needed for the supply chain and logistics function.",
    said: "Increased efficiency and productivity, with seamless coordination towards their business objectives.",
  },
  {
    id: "transsnet",
    company: "Transsnet Music",
    sector: "Digital music (Boomplay)",
    situation: "Needed HR operations run to current regulation while implementing best practice internally.",
    ran: "HR services across functions, keeping the organisation compliant with current industry regulations.",
    said: "Helped them optimise HR operations; staff knowledge across HR functions is up to date with current regulations.",
  },
];
