"use client";

import { useState, useTransition } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Select, Textarea } from "@/components/ui/field";
import { company } from "@/content/facts";
import { services } from "@/content/services";
import { submitApplication, type ApplyResult } from "@/app/careers/actions";
import { parseApplication, type Application } from "./schema";

const resolver: Resolver<Application> = async (values) => {
  const r = parseApplication(values);
  if (r.success) return { values: r.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0] ?? "root");
    if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors: errors as unknown as FieldErrors<Application> };
};

/** One short form for the talent pool (Q14). Openings are in Zoho Recruit; this is for people whose role is not listed. */
export function ApplicationForm() {
  "use no memo";
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState } = useForm<Application>({
    resolver,
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", location: "", area: "", message: "", consent: undefined, website: "" },
  });
  const errors = formState.errors;

  if (result?.ok)
    return (
      <div aria-live="polite">
        <h3 className="display text-[1.5rem] md:text-[1.75rem]">Received.</h3>
        <p className="mt-4 max-w-[40em] text-[15px]">
          Your details are in our talent pool. When a role matches, we get in touch on the number and email you gave.
        </p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit((d) => startTransition(async () => setResult(await submitApplication(d))))} noValidate className="space-y-7">
      <div className="grid gap-7 md:grid-cols-2">
        <Field label="Your name" htmlFor="ap-name" error={errors.name?.message}>
          <Input id="ap-name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="ap-email" error={errors.email?.message}>
          <Input id="ap-email" type="email" inputMode="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="ap-phone" error={errors.phone?.message}>
          <Input id="ap-phone" type="tel" inputMode="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field label="Where are you based?" htmlFor="ap-location" hint="City or state." error={errors.location?.message}>
          <Input id="ap-location" autoComplete="address-level2" invalid={!!errors.location} {...register("location")} />
        </Field>
      </div>
      <Field label="Area of work" htmlFor="ap-area" error={errors.area?.message}>
        <Select id="ap-area" defaultValue="" invalid={!!errors.area} {...register("area")}>
          <option value="" disabled>
            Choose one
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="Other">Something else</option>
        </Select>
      </Field>
      <Field
        label="Anything we should know"
        htmlFor="ap-message"
        hint="Experience, the kind of role you want, a link to your CV. Optional."
        error={errors.message?.message}
      >
        <Textarea id="ap-message" invalid={!!errors.message} {...register("message")} />
      </Field>
      <div className="border-t border-olive">
        <ChoiceRow
          type="checkbox"
          label="You may process these details to consider me for roles."
          description={`Held under the ${company.ndpr}. Full policy at /privacy-policy.`}
          {...register("consent")}
        />
        {errors.consent ? (
          <p role="alert" className="data mt-1.5 text-[#B3261E]">
            {errors.consent.message}
          </p>
        ) : null}
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="ap-website">Website</label>
        <input id="ap-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {result && !result.ok ? (
        <p role="alert" className="border-l-2 border-[#B3261E] pl-3 text-[15px]">
          {result.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending" : "Join the talent pool"}
      </Button>
    </form>
  );
}
