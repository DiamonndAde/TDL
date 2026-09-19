/**
 * Licensed stock placeholders for client presentations ONLY. Rendered by <PhotoFrame> when PLACEHOLDER_IMAGES
 * is "true"; the build refuses that flag for a production target (next.config.ts). Every placeholder renders
 * with a visible "Placeholder — TDL photography required" label. Attribution: PLACEHOLDERS.md.
 *
 * Never a portrait for a named person: a stock face under a real executive invents a person. The testimonial
 * portrait frames and the leadership/board frames do not take a placeholder key at all.
 */
export interface Placeholder {
  file: string;
  width: number;
  height: number;
  scene: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
  licence: "Pexels";
}

export const placeholders = {
  "home-office": {
    file: "/placeholders/pexels-30689114.jpg",
    width: 1600,
    height: 1067,
    scene: "Three colleagues around a laptop during a meeting in a Lagos office",
    photographer: "Ninthgrid",
    photographerUrl: "https://www.pexels.com/@ninthgrid-2149521550/",
    sourceUrl: "https://www.pexels.com/photo/team-collaboration-meeting-in-lagos-office-30689114/",
    licence: "Pexels",
  },
  "about-staff": {
    file: "/placeholders/pexels-30688595.jpg",
    width: 1600,
    height: 1067,
    scene: "A group of business professionals indoors, Lagos",
    photographer: "Ninthgrid",
    photographerUrl: "https://www.pexels.com/@ninthgrid-2149521550/",
    sourceUrl: "https://www.pexels.com/photo/diverse-business-team-smiling-indoors-30688595/",
    licence: "Pexels",
  },
  "about-work": {
    file: "/placeholders/pexels-30677719.jpg",
    width: 1600,
    height: 1067,
    scene: "Two colleagues collaborating on a laptop in a Lagos office",
    photographer: "Ninthgrid",
    photographerUrl: "https://www.pexels.com/@ninthgrid-2149521550/",
    sourceUrl: "https://www.pexels.com/photo/professional-collaboration-in-lagos-office-30677719/",
    licence: "Pexels",
  },
} satisfies Record<string, Placeholder>;

export type PlaceholderKey = keyof typeof placeholders;

/** Read at build/prerender time in server components. Off by default. */
export const placeholdersEnabled = process.env.PLACEHOLDER_IMAGES === "true";
