import type { ReactNode } from "react";

/** Page gutter: 16px on phones (AGENTS.md), 40px from md, max 80rem. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[80rem] px-4 md:px-10 ${className}`}>{children}</div>;
}
