"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Select } from "@/components/ui/field";
import { company, process as processFacts } from "@/content/facts";
import { services, type ServiceSlug } from "@/content/services";
import { submitEnquiry, type SubmitResult } from "@/app/become-a-client/actions";
import {
  arrangementOptions,
  contactTimeOptions,
  headcountOptions,
  parseEnquiry,
  stepFields,
  type Enquiry,
} from "./schema";

/**
 * Three steps, each cheap to answer (brief §9): what you need and how many people; your organisation; you.
 * Progress is the one place --signal appears on this page: it is live. Motion is functional — the step panel
 * slides in the direction you moved, 200 ms, only in response to your action. Fully keyboard operable: native
 * controls, focus moves to the new step's heading, errors are inline and say how to fix them.
 *
 * Validation is zod per step (react-hook-form `trigger` on the step's fields) and the whole schema again in the
 * server action. No @hookform/resolvers: the ten-line resolver below is all that is needed for zod 4.
 */
const resolver: Resolver<Enquiry> = async (values) => {
  const r = parseEnquiry(values);
  if (r.success) return { values: r.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0] ?? "root");
    if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors: errors as unknown as FieldErrors<Enquiry> };
};

const stepTitles = ["What do you need?", "Your organisation", "You"] as const;

export function EnquiryForm() {
  // react-hook-form's formState is a read-tracking proxy; React Compiler memoisation can skip the reads that
  // subscribe it (react-hooks/incompatible-library). This component is compiled without memoisation.
  "use no memo";
  const params = useSearchParams();
  const preselected = params
    .getAll("service")
    .filter((s): s is ServiceSlug => services.some((x) => x.slug === s));
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<Enquiry>({
    resolver,
    mode: "onTouched",
    defaultValues: {
      services: preselected,
      headcount: undefined,
      organisation: "",
      industry: "",
      location: "",
      arrangement: undefined,
      name: "",
      role: "",
      email: "",
      phone: "",
      contactTime: undefined,
      consent: undefined,
      website: "",
    },
  });
  const { register, handleSubmit, trigger, formState, watch } = form;
  const errors = formState.errors;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const next = async () => {
    const ok = await trigger(stepFields[step], { shouldFocus: true });
    if (!ok) return;
    setDirection(1);
    setStep((s) => Math.min(2, s + 1));
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };
  const onSubmit = (data: Enquiry) => {
    startTransition(async () => {
      const r = await submitEnquiry(data);
      setResult(r);
      if (r.ok) window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  if (result?.ok) return <Success services={watch("services")} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="enquiry-title">
      <Progress step={step} />

      <h2 ref={headingRef} tabIndex={-1} id="enquiry-title" className="display mt-8 text-[1.75rem] outline-none md:text-[2rem]">
        {stepTitles[step]}
      </h2>
      <p className="data mt-1 text-olive">
        Step {step + 1} of 3
      </p>

      <div key={step} className="mt-8 space-y-7 motion-safe:animate-[step-in_200ms_ease-out]" style={{ "--step-dir": direction } as React.CSSProperties}>
        {step === 0 ? (
          <>
            <Field label="Which services do you need?" hint="Choose everything that applies." htmlFor="services" error={errors.services?.message}>
              <div id="services" role="group" aria-label="Services" className="border-t border-olive">
                {services.map((s) => (
                  <ChoiceRow key={s.slug} type="checkbox" value={s.slug} label={s.name} description={s.removes} {...register("services")} />
                ))}
              </div>
            </Field>
            <Field label="How many people are involved?" htmlFor="headcount" error={errors.headcount?.message}>
              <div id="headcount" role="radiogroup" aria-label="Headcount" className="border-t border-olive">
                {headcountOptions.map((o) => (
                  <ChoiceRow key={o.value} type="radio" value={o.value} label={o.label} {...register("headcount")} />
                ))}
              </div>
            </Field>
          </>
        ) : step === 1 ? (
          <>
            <Field label="Organisation" htmlFor="organisation" error={errors.organisation?.message}>
              <Input id="organisation" autoComplete="organization" invalid={!!errors.organisation} {...register("organisation")} />
            </Field>
            <Field label="Industry" hint="For example: manufacturing, telecoms, financial services." htmlFor="industry" error={errors.industry?.message}>
              <Input id="industry" invalid={!!errors.industry} {...register("industry")} />
            </Field>
            <Field label="Where are the people?" hint="City or state. Benin Republic counts." htmlFor="location" error={errors.location?.message}>
              <Input id="location" autoComplete="address-level2" invalid={!!errors.location} {...register("location")} />
            </Field>
            <Field label="How is this handled today?" htmlFor="arrangement" error={errors.arrangement?.message}>
              <Select id="arrangement" defaultValue="" invalid={!!errors.arrangement} {...register("arrangement")}>
                <option value="" disabled>
                  Choose one
                </option>
                {arrangementOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : (
          <>
            <div className="grid gap-7 md:grid-cols-2">
              <Field label="Your name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
              </Field>
              <Field label="Your role" htmlFor="role" error={errors.role?.message}>
                <Input id="role" autoComplete="organization-title" invalid={!!errors.role} {...register("role")} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" inputMode="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
              </Field>
              <Field label="Phone" hint="We call or WhatsApp this number." htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} />
              </Field>
            </div>
            <Field label="When should we call?" htmlFor="contactTime" error={errors.contactTime?.message}>
              <Select id="contactTime" defaultValue="" invalid={!!errors.contactTime} {...register("contactTime")}>
                <option value="" disabled>
                  Choose a time
                </option>
                {contactTimeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="border-t border-olive">
              <ChoiceRow
                type="checkbox"
                label="You may process these details to respond to this enquiry."
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
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>
          </>
        )}
      </div>

      {result && !result.ok ? (
        <p role="alert" className="mt-6 border-l-2 border-[#B3261E] pl-3 text-[15px]">
          {result.error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-6">
        {step < 2 ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? "Sending" : "Send the enquiry"}
          </Button>
        )}
        {step > 0 ? (
          <Button type="button" variant="link" onClick={back}>
            Back
          </Button>
        ) : null}
        <p className="data ml-auto text-olive">
          Prefer to talk?{" "}
          <a href={company.whatsappHref} className="text-signal-deep underline underline-offset-4" rel="noopener" target="_blank">
            WhatsApp
          </a>{" "}
          or{" "}
          <a href={company.phoneHref} className="text-signal-deep underline underline-offset-4">
            {company.phone}
          </a>
        </p>
      </div>
    </form>
  );
}

/** Three segments; completed and current fill with --signal. Live, so cyan is right here. */
function Progress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {stepTitles.map((t, i) => (
        <li key={t} aria-current={i === step ? "step" : undefined}>
          <span
            className={`block h-1 rounded-[1px] transition-colors duration-300 ${i <= step ? "bg-signal-deep" : "bg-olive/30"}`}
            aria-hidden="true"
          />
          <span className={`data mt-2 block ${i <= step ? "text-ink" : "text-olive"}`}>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function Success({ services: chosen }: { services: ServiceSlug[] }) {
  const names = chosen.map((s) => services.find((x) => x.slug === s)?.name).filter(Boolean);
  return (
    <div aria-live="polite">
      <h2 className="display text-[1.75rem] md:text-[2rem]">Received. Here is what happens next.</h2>
      <ol className="mt-8 border-t border-olive">
        <li className="grid grid-cols-[2rem_1fr] border-b border-olive py-4">
          <span className="data text-olive">1</span>
          <span>{processFacts.responsePromise}</span>
        </li>
        <li className="grid grid-cols-[2rem_1fr] border-b border-olive py-4">
          <span className="data text-olive">2</span>
          <span>
            We talk through {names.length ? names.join(", ").toLowerCase() : "what you need"} and the people involved.
          </span>
        </li>
        {/* TODO(client): Q12 — a fuller process (scoping session, proposal inside five working days) needs the
            client's approval before it is promised here. Only the site's own 24-hour line is stated. */}
      </ol>
      <p className="mt-8 text-[15px]">
        Need it sooner?{" "}
        <a href={company.whatsappHref} className="text-signal-deep underline underline-offset-4" rel="noopener" target="_blank">
          WhatsApp us
        </a>{" "}
        or call{" "}
        <a href={company.phoneHref} className="text-signal-deep underline underline-offset-4">
          {company.phone}
        </a>
        .
      </p>
      <p className="mt-10">
        <Link href="/" className="text-[15px] text-signal-deep underline underline-offset-4">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
