/**
 * About-page content. Vision, mission and the biographies are VERBATIM from the current site's about page —
 * the biographies are the client's own words about named people and are not rewritten (TODO(client): Q23 covers
 * the plain-verb framing lines only). Photography: TODO(client): Q18 — every frame here is reserved and empty.
 */
export const about = {
  // Facts only (§A of CLIENT-QUESTIONS.md); the current page's "dynamic and forward-thinking" framing is cut.
  story: [
    "Total Data Limited is a management consultancy, incorporated in 2000, that runs HR and business process outsourcing for other companies. The staff we manage work across all the states in Nigeria and in Benin Republic, in our clients’ organisations, at every level.",
    "The firm is ISO 9001:2015 certified and operates under the Nigeria Data Protection Regulations 2019. It is led by a managing director from HR and a deputy managing director from law, and chaired by its founder.",
  ],
  vision: "To be the preferred outsourcing company in Nigeria/Africa (within our areas of coverage).",
  mission:
    "Help our clients’ business grow through the provision of excellent and bespoke resources and services to help them meet their operational and business needs.",
} as const;

export interface Person {
  name: string;
  role: string;
  /** Post-nominals as printed on the current site, where given. */
  letters?: string;
  bio: string[];
  /** Real headshot, 4:5, ≥ 2,000 px on the long side. Undefined until Q18. Never stock, never generated. */
  portrait?: { src: string; width: number; height: number };
}

export const leadershipTeam: Person[] = [
  {
    // TODO(client): Q5 — "TOluwalase" is the spelling on the current site; kept as-is.
    name: "TOluwalase Ayeni",
    role: "Managing Director",
    bio: [
      "Highly motivated HR professional with over 2 decades of experience dedicated to enhancing employee engagement and driving organizational success. Her leadership roles in multinational corporations showcase adept skills in implementing groundbreaking HR initiatives, leading to elevated morale and productivity. TOluwalase excels in talent acquisition, employee development, and relations, fostering harmonious work environments. With expertise in compliance, policy implementation, and strategic HR planning, she aligns initiatives with organizational goals.",
      "A linguistically adept professional, TOluwalase holds a Bachelor’s in English Language and a MBA in HR, complemented by additional certifications in HR best practices and employment law. Her passion, extensive experience, and outcome-driven approach make her a valuable asset for any organization.",
    ],
  },
  {
    name: "Yetunde Braimoh-Habeebu",
    role: "Deputy Managing Director",
    bio: [
      "An accomplished legal advisor, ensures legal compliance and provides comprehensive counsel in corporate law and labour & employment law. With a robust track record, she excels in delivering legal expertise with strategic leadership by integrating legal considerations into the overall business strategy and ensuring compliance and ethical conduct throughout the organization. Her expertise extends to corporate governance and compliance, strategic leadership, contract management, risk management, corporate communication, stakeholder relations and innovative problem-solving thereby enhancing overall operational efficiency.",
      "Educationally, Yetunde holds a Law degree, an LLM, certification in Leadership and Organizational Development and is an Associate of the Institute of Chartered Secretaries and Administrators, Nigeria. Her multifaceted role as a legal advisor, corporate expert, and labour law specialist contributes to the organization’s long-term success, emphasizing compliance, strategic guidance, and ethical operations. Yetunde is a pivotal asset, navigating legal complexities and fostering growth through her expertise and commitment.",
    ],
  },
];

export const boardOfAdvisory: Person[] = [
  {
    name: "Theo Ola Ayeni Esq",
    role: "Founder and Chairman",
    letters: "B.A.(Hons.) English; LL.B.(Hons.); BL.; FCIPM; MNIM.; ChMC; ACI.Arb.",
    bio: [
      "Mr. Ayeni, a distinguished HR professional, has left a lasting impact on Total Data Limited (TDL). Retiring from Dunlop Nig Plc, he founded TDL and serves as its chairman, leveraging his legal and HR expertise to drive success. Mr. Ayeni’s strategic leadership fosters a productive work environment, while his negotiation skills uphold TDL’s reputation. Educated at renowned institutions, he is recognized for his professional excellence. Mr. Ayeni’s commitment to excellence and productivity continues to shape TDL’s success, establishing it as a reputable industry player.",
    ],
  },
  {
    name: "Adedamola A. Adams",
    role: "Director",
    letters: "M.Scs. (Banking & Finance); FCIB, MMS, MNIM",
    bio: [
      "Mr. Adedamola Adams, a seasoned professional with over 30 years in banking, is the founding Managing Director of Total Data Limited (TDL). His expertise in financial management and negotiations has driven TDL’s success. Prior to TDL, he held key roles at UBA, refining his skills in commercial banking and operations. Mr. Adams’ visionary leadership has steered TDL through changing economic landscapes, ensuring growth and sustainability. He holds degrees from SDA Boccuni, Milan, and the University of Ibadan, with recognition from the Chartered Institute of Bankers. Embracing technology, he keeps TDL innovative and competitive. Known for his exceptional interpersonal skills, Mr. Adams cultivates relationships and expands TDL’s reputation. As a Board member, he continues to shape TDL’s future success, solidifying his status as a respected figure in banking.",
    ],
  },
  {
    name: "Musi A. Braimoh",
    role: "Director",
    letters: "B.Sc. (Hons.) Biology, M.Sc. (Business Admin), FCIPM; MNIM",
    bio: [
      "Mr. Musi Braimoh holds a degree and a master’s degree from reputable universities in the USA. With over 35 years of experience spanning various industries, including Public Health, Banking, Manufacturing, and FMCG, he possesses a deep understanding of human capital management. Mr. Braimoh’s pioneering role at the CHI GROUP and his tenure at NBCI and UAC highlight his expertise in optimizing organizational performance and fostering employee growth. He excels in employee relations, conflict resolution, and ensuring compliance with regulations. Mr. Braimoh’s commitment to professional growth and his strategic mindset position him as a respected HR professional capable of addressing complex workplace issues and driving organizational success.",
    ],
  },
];

/** Careers page text, verbatim from the current site. Openings live in TDL's own Zoho Recruit (Q14, answered). */
export const careers = {
  openingsUrl: "https://totaldatalimited.zohorecruit.com/jobs/Careers",
  diversity:
    "Acknowledging the significance of cultivating an inclusive and diverse workplace, Total Data Limited understands that such an environment propels creativity, innovation, and dynamism. At Total Data Limited, we are committed to ensuring that individuals with disabilities receive all necessary accommodations to effectively fulfill their job responsibilities, actively engage in the interview process, and feel embraced as esteemed members of the Total Data Limited family. Our dedication to inclusivity extends to creating a space where everyone can thrive and contribute their best.",
  perks:
    "Joining Total Data Limited comes with a host of enticing perks and benefits designed to enhance your overall work experience. Our comprehensive package includes competitive salary offerings, opportunities for professional development, and a supportive work environment that fosters growth. We prioritize the well-being of our team members, providing health and wellness programs, flexible work arrangements, and a range of employee assistance initiatives. Join us, and enjoy a fulfilling career with Total Data Limited, where your contributions are valued, and your success is our priority.",
} as const;

/** Certifications page. The two PDFs are the current site's own files, copied to public/documents. */
export const certifications = {
  iso: { name: "ISO 9001:2015", badge: "/clients/iso.svg" },
  documents: [
    { name: "Quality policy", href: "/documents/quality-policy.pdf" },
    { name: "Quality objectives", href: "/documents/quality-objective.pdf" },
  ],
  // TODO(client): Q19 — the ISO certificate itself and any operating licences, to publish here.
} as const;
