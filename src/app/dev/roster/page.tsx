import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Harness } from "./harness";

export const metadata: Metadata = { title: "Roster harness", robots: { index: false, follow: false } };

// Dev-only route. Shipped to production only when NEXT_PUBLIC_DEV_ROUTES is set.
export default function RosterHarnessPage() {
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_DEV_ROUTES) notFound();
  return <Harness />;
}
