/**
 * Licensed stock placeholders for client presentations ONLY. Rendered by <PhotoFrame> when PLACEHOLDER_IMAGES
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
