import type { ComponentProps, ReactNode } from "react";

/**
 * Native form primitives styled with the tokens. Native controls deliberately: on the phones this audience uses,
 * the OS picker for a <select> beats any JS listbox, and there is no library look to fight. Every control has a
 * visible label, and an error is inline text that says how to fix it (AGENTS.md, accessibility).
 */
const control =
  "block w-full rounded-[2px] border border-olive bg-paper px-3.5 py-3 text-[16px] text-ink placeholder:text-olive/70 " +
  "focus:border-signal-deep focus:outline-none focus:ring-2 focus:ring-signal-deep/30 aria-[invalid=true]:border-[#B3261E]";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[15px] font-medium">
        {label}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="data mt-1 text-olive">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="data mt-1.5 text-[#B3261E]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", invalid, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={`${control} appearance-none pr-10 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", invalid, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={`${control} min-h-[7rem] ${className}`} {...props} />;
}

/** A checkbox or radio row: the whole row is the hit target, the control stays native. */
export function ChoiceRow({
  type,
  label,
  description,
  ...props
}: ComponentProps<"input"> & { type: "checkbox" | "radio"; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-olive py-3.5 has-[:checked]:text-signal-deep">
      <input
        type={type}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--signal-deep)]"
        {...props}
      />
      <span>
        <span className="block text-[16px]">{label}</span>
        {description ? <span className="data block text-olive">{description}</span> : null}
      </span>
    </label>
  );
}
