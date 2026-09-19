// zod/mini: the tree-shakeable, functional build. The full "zod" import measured ~90 KB gzip on this route.
import * as z from "zod/mini";
import { services, type ServiceSlug } from "@/content/services";

/**
 * The three-step qualification form (brief §9). One schema per step so each step validates on its own, and one
 * combined schema the server action validates the whole submission against. Error messages say how to fix it.
 */
const slugs = services.map((s) => s.slug) as [ServiceSlug, ...ServiceSlug[]];

export const headcountOptions = [
  { value: "1-50", label: "1 to 50 people" },
  { value: "51-200", label: "51 to 200 people" },
  { value: "201-1000", label: "201 to 1,000 people" },
  { value: "1000+", label: "More than 1,000 people" },
] as const;

export const arrangementOptions = [
  { value: "in-house", label: "Run in-house" },
  { value: "provider", label: "Another outsourcing provider" },
  { value: "mixed", label: "A mix of in-house and outsourced" },
  { value: "none", label: "No formal arrangement yet" },
] as const;

export const contactTimeOptions = [
  { value: "morning", label: "Morning (9am to 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm to 5pm)" },
  { value: "any", label: "Any time on a working day" },
] as const;

const values = <T extends readonly { value: string }[]>(o: T) => o.map((x) => x.value) as [T[number]["value"], ...T[number]["value"][]];

const text = (msg: string) => z.string().check(z.trim(), z.minLength(2, msg));

export const step1 = z.object({
  services: z.array(z.enum(slugs)).check(z.minLength(1, "Choose at least one service.")),
  headcount: z.enum(values(headcountOptions), { error: "Choose the range that fits." }),
});

export const step2 = z.object({
  organisation: text("Enter your organisation’s name."),
  industry: text("Tell us the industry, in a word or two."),
  location: text("Enter the city or state your people are in."),
  arrangement: z.enum(values(arrangementOptions), { error: "Choose the option closest to today." }),
});

export const step3 = z.object({
  name: text("Enter your name."),
  role: text("Enter your role."),
  email: z.email({ error: "Enter an email address we can reply to." }),
  phone: z
    .string()
    .check(z.trim(), z.regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a phone number, digits only, with or without the country code.")),
  contactTime: z.enum(values(contactTimeOptions), { error: "Choose when to call." }),
  consent: z.literal(true, { error: "Tick the box so we can process your details under the NDPR." }),
  // honeypot: humans never see it; anything in it is a bot
  website: z.optional(z.string().check(z.maxLength(0))),
});

export const enquirySchema = z.extend(z.extend(step1, step2.shape), step3.shape);
export type Enquiry = z.infer<typeof enquirySchema>;
export const parseEnquiry = (data: unknown) => z.safeParse(enquirySchema, data);

export const stepFields: (keyof Enquiry)[][] = [
  ["services", "headcount"],
  ["organisation", "industry", "location", "arrangement"],
  ["name", "role", "email", "phone", "contactTime", "consent"],
];
