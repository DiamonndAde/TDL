/**
 * Presentation-only placeholders. The registry is EMPTY by decision (docs/DESIGN-DECISIONS.md, 2026-09-19):
 * every photo frame on the site is captioned as a real TDL person, place or address, and any stock photograph
 * under such a caption asserts something false — the wrong city, a railway station, another institution's
 * headquarters. The honest presentation state is the empty frame reading "Photograph to come", which is also
 * the better prompt to the client. `PlaceholderKey` is therefore `never`: <PhotoFrame placeholder=…> will not
 * type-check until someone adds an entry here deliberately, with attribution in PLACEHOLDERS.md.
 *
 * What PLACEHOLDER_IMAGES still does: initials monograms in the named-person frames (never a face).
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

export const placeholders = {} satisfies Record<string, Placeholder>;

export type PlaceholderKey = keyof typeof placeholders;

/** Read at build/prerender time in server components. Off by default. */
export const placeholdersEnabled = process.env.PLACEHOLDER_IMAGES === "true";
