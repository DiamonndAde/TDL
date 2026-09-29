/**
 * TDL's public careers board — the page job-seekers are sent to and where applications are made.
 *
 * It belongs to TDL, not to whichever adapter happens to deliver talent-pool submissions: a deployment with
 * only a webhook configured must still send people to the real openings. The URL lives in `src/content` with
 * the rest of the copy; `RECRUITMENT_BOARD_URL` overrides it without a content edit, which is what a move to
 * another ATS would use first.
 */
import { careers } from "@/content/about";

export function boardUrl(): string | null {
  const override = (process.env.RECRUITMENT_BOARD_URL ?? "").trim();
  if (override) return override;
  return careers.openingsUrl || null;
}
