import * as z from "zod/mini";

/** General application (talent pool). Shared by the client form and the server action. */
export const applicationSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, "Enter your name.")),
  email: z.email({ error: "Enter an email address we can reply to." }),
  phone: z
    .string()
    .check(z.trim(), z.regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a phone number, digits only, with or without the country code.")),
  location: z.string().check(z.trim(), z.minLength(2, "Enter the city or state you are in.")),
  area: z.string().check(z.trim(), z.minLength(2, "Choose the area of work.")),
  message: z.string().check(z.trim(), z.maxLength(2000, "Keep it under 2,000 characters.")),
  consent: z.literal(true, { error: "Tick the box so we can process your details under the NDPR." }),
  website: z.optional(z.string().check(z.maxLength(0))),
});
export type Application = z.infer<typeof applicationSchema>;
export const parseApplication = (data: unknown) => z.safeParse(applicationSchema, data);
