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
  // The home slider (TDL review, 2026-10-16, item 8). Chosen 2026-10-17; candidates and rejections in
  // PLACEHOLDERS.md. Faces are fine here: the slider names no one and claims no premises.
  interview: {
    file: "/placeholders/pexels-30688591.jpg",
    width: 1600,
    height: 1067,
    scene: "Two professionals in conversation across a desk, Lagos office, natural light",
    photographer: "Ninthgrid",
    photographerUrl: "https://www.pexels.com/@ninthgrid-2149521550/",
    sourceUrl: "https://www.pexels.com/photo/professional-interview-in-modern-lagos-office-30688591/",
    licence: "Pexels",
  },
  "files-desk": {
    // Cropped to the left 83% of the original to take out a monitor's maker's logo.
    file: "/placeholders/pexels-30970394.jpg",
    width: 1600,
    height: 1285,
    scene: "A man working through files at a desk lined with folders, office in Osun State",
    photographer: "Oluwapamilerinayo Ajala",
    photographerUrl: "https://www.pexels.com/@oluwapamilerinayo-ajala-1663970972/",
    sourceUrl: "https://www.pexels.com/photo/professional-in-busy-office-environment-30970394/",
    licence: "Pexels",
  },
  "laptop-pair": {
    file: "/placeholders/unsplash-kwzWjTnDPLk.jpg",
    width: 1600,
    height: 1067,
    scene: "A woman and a man working through a problem at a laptop, open-plan Lagos workspace",
    photographer: "@disruptxn", // the profile's display name is "X"; the handle is the unambiguous credit
    photographerUrl: "https://unsplash.com/@disruptxn",
    sourceUrl: "https://unsplash.com/photos/man-using-black-laptop-computer-kwzWjTnDPLk",
    licence: "Unsplash",
  },
  "laptop-work": {
    // Cropped to 9–89% of the original's width to take out a monitor's and the laptop's makers' logos. Indoor
    // fluorescent light with a cool cast: the weakest of the five, kept for the scene (Lagos, at work, unposed).
    file: "/placeholders/pexels-1405769.jpg",
    width: 1600,
    height: 1333,
    scene: "A man in a waistcoat working at a laptop in a Lagos office",
    photographer: "Oladipupo Ajisegiri",
    photographerUrl: "https://www.pexels.com/@ladiwayne/",
    sourceUrl: "https://www.pexels.com/photo/man-sitting-on-chair-indoor-1405769/",
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
