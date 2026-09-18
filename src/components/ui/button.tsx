import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Two treatments only. `primary` is the one filled button on a surface; it inverts with the ground
 * (paper-on-ink, ink-on-paper) and never uses --signal. `link` is the plain underlined secondary action.
 * The ground is set by an ancestor carrying `.on-ink`.
 */
type Variant = "primary" | "link";

const base =
  "inline-flex items-center justify-center rounded-[2px] text-[15px] font-medium leading-none transition-colors duration-150";
const styles: Record<Variant, string> = {
  primary:
    "px-5 py-3.5 bg-ink text-paper hover:bg-ink/85 [.on-ink_&]:bg-paper [.on-ink_&]:text-ink [.on-ink_&]:hover:bg-paper/85",
  link: "underline underline-offset-4 decoration-1 text-ink hover:decoration-2 [.on-ink_&]:text-paper",
};

type Props = { variant?: Variant; children: ReactNode; className?: string } & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "className">)
);

export function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  const cls = `${base} ${styles[variant]} ${className}`;
  if ("href" in rest && rest.href) {
    const { href, ...linkProps } = rest as { href: string } & Omit<ComponentProps<typeof Link>, "href">;
    return (
      <Link href={href} className={cls} {...linkProps}>
        {children}
      </Link>
    );
  }
  const buttonProps = rest as Omit<ComponentProps<"button">, "className">;
  return (
    <button type="button" className={cls} {...buttonProps}>
      {children}
    </button>
  );
}
