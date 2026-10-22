/**
 * Licensed stock placeholders for client presentations ONLY (the home slider's stock was replaced by generated
 * stand-ins on 2026-10-22 — `sliderStandIns` below). Rendered by <PhotoFrame> when PLACEHOLDER_IMAGES
 * is on (the build guard in next.config.ts governs where that is allowed). Every placeholder renders with a
 * visible "Placeholder — TDL photography required" label and a credit. Attribution: PLACEHOLDERS.md.
 *
 * Rules (docs/DESIGN-DECISIONS.md, 2026-09-19):
 *  - Never under a caption that names TDL's address or a named person. The Coker Road frame and every portrait
 *    frame never take a key; portraits get an initials monogram instead.
 *  - Nigerian, natural light, people mid-work, no visible device or company branding, no legible documents.
 *  - Captions on placeholdered frames must be true without claiming to depict TDL.
 */
export interface Placeholder {
  file: string;
  width: number;
  height: number;
  scene: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
  licence: "Pexels" | "Unsplash";
}

export const placeholders = {
  "desk-work": {
    file: "/placeholders/pexels-36482981.jpg",
    width: 1600,
    height: 2400,
    scene: "A woman standing at a desk, reviewing charts on a laptop, Abuja office, natural light",
    photographer: "Taiye Salawu",
    photographerUrl: "https://www.pexels.com/@taiyesalawu/",
    sourceUrl: "https://www.pexels.com/photo/professional-woman-analyzing-data-on-laptop-36482981/",
    licence: "Pexels",
  },
} satisfies Record<string, Placeholder>;

export type PlaceholderKey = keyof typeof placeholders;

/**
 * AI-generated stand-ins for the home slider — the one client-approved exception to "never generated imagery"
 * (TDL, 2026-10-17; AGENTS.md, Placeholders rule 1). Presentation builds only: rendered only when
 * PLACEHOLDER_IMAGES is on, behind the same build guard as the stock above, under the caption in
 * src/content/photographs.ts. Never in a frame that names a person or claims TDL's premises.
 *
 * Made with scripts/generate-slider-images.mjs (gpt-image-2, 1536x1024, quality medium); the exact prompt of each,
 * the selection and the spend are in PLACEHOLDERS.md. Committed as WebP only; the PNG originals stay in the
 * gitignored photo-picks/generated/. `position` is the CSS object-position: its y sets the 21:9 desktop crop, its
 * x the 4:3 phone crop (a 3:2 image loses only top and bottom in one, only the sides in the other). `phone` is a
 * separate phone source where cropping alone cannot frame it.
 */
export interface GeneratedStandIn {
  file: string;
  width: number;
  height: number;
  scene: string;
  position: string;
  phone?: { file: string; width: number; height: number };
}

const GEN = "/placeholders/generated";
/** In slide order. */
export const sliderStandIns: GeneratedStandIn[] = [
  { file: `${GEN}/gen-meeting-standup.webp`, width: 1536, height: 1024, position: "50% 40%",
    scene: "three colleagues by a window going through a folder together" },
  // Phone: a 1300x975 crop from the left, so the walking figure at the right edge is out of frame rather than halved.
  { file: `${GEN}/gen-admin-open-plan.webp`, width: 1536, height: 1024, position: "40% 45%",
    scene: "two people working at facing desks in an open-plan office",
    phone: { file: `${GEN}/gen-admin-open-plan-phone.webp`, width: 1300, height: 975 } },
  // Painted letterbox bars trimmed off (rows 147-876 kept of 1024).
  { file: `${GEN}/gen-laptop-pair.webp`, width: 1536, height: 730, position: "50% 50%",
    scene: "two colleagues side by side at one laptop" },
  // Painted letterbox bars trimmed off (rows 118-907 kept of 1024).
  { file: `${GEN}/gen-documents-records.webp`, width: 1536, height: 790, position: "55% 40%",
    scene: "a man filing a folder into a shelf of box files" },
  { file: `${GEN}/gen-hr-interview.webp`, width: 1536, height: 1024, position: "45% 25%",
    scene: "an interview across a desk, the interviewer taking notes" },
  { file: `${GEN}/gen-payroll-desk.webp`, width: 1536, height: 1024, position: "35% 8%",
    scene: "a woman checking figures on a printed sheet with a calculator" },
];

/** Read at build/prerender time in server components. Off by default. */
export const placeholdersEnabled = process.env.PLACEHOLDER_IMAGES === "true";

/**
 * PRESENTATION_HIDE_EMPTY_FRAMES=true: every reserved frame that would render its "to come" note renders
 * nothing instead, so a client meeting can show each page as it will read once their photography arrives.
 * Frames that hold a real image, a registered placeholder or a monogram are unaffected. Off by default; it
 * hides rather than shows, so it needs no build guard, but it is a presentation setting: set it in the shell
 * or `.env.local`, never in Vercel (HANDOFF.md, launch checklist).
 */
export const emptyFramesHidden = process.env.PRESENTATION_HIDE_EMPTY_FRAMES === "true";
