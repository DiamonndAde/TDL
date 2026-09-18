import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * The register row: a narrow left column that names the section and states what the Roster is showing,
 * and a wide right column for content. On phones the left column becomes a caption above the content.
 * The caption is functional (sentence case, no tracking) — it is the text twin of the canvas state.
 */
interface RegisterProps {
  id?: string;
  /** Section name, e.g. "Services". Rendered as the section heading. */
  title: string;
  /** What the Roster is showing here, e.g. "5,000 people by service line". */
  note?: string;
  tone?: "paper" | "ink";
  /** Reserve extra vertical room for the canvas placeholder. */
  className?: string;
  children: ReactNode;
  headingLevel?: "h2" | "h3";
}

export function Register({ id, title, note, tone = "paper", className = "", children, headingLevel = "h2" }: RegisterProps) {
  const Heading = headingLevel;
  const ground = tone === "ink" ? "on-ink bg-ink text-paper" : "bg-paper text-ink";
  const noteColor = tone === "ink" ? "text-ink-light" : "text-olive";
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`${ground} ${className}`}>
      <Container className="py-14 md:py-20 lg:grid lg:grid-cols-[12.5rem_1fr] lg:gap-10">
        <div className="mb-6 lg:mb-0">
          <Heading id={id ? `${id}-title` : undefined} className="text-[15px] font-medium">
            {title}
          </Heading>
          {note ? <p className={`data mt-1.5 max-w-[12rem] ${noteColor}`}>{note}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </Container>
    </section>
  );
}
