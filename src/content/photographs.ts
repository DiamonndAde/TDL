import type { PlaceholderKey } from "./placeholders";

/**
 * TDL's own photographs for the home slider: their team at work, at 69 Coker Road. TODO(client): Q27 — four to
 * six shots, at least 2,400 px wide (the slider is cropped 21:9 and a 2x screen needs the width). Empty until they arrive; while it is empty the section shows the
 * reservation note (or, in a presentation build, the placeholders below).
 *
 * When they land: copy each into public/photographs/, add it here with alt text that says who and where (a caption
 * may name the office, because these ARE the office), and delete nothing else — the placeholders stop rendering
 * on their own once this list has entries.
 */
export interface Photograph {
  src: string;
  width: number;
  height: number;
  alt: string;
  position?: string;
}

export const homePhotographs: Photograph[] = [];

/** The one caption line under stand-in images in presentation builds (TDL review, 2026-10-17). */
export const standInCaption = "Stand-in photographs. TDL’s own to come.";

/** Presentation builds only (PLACEHOLDER_IMAGES), in slide order. `desk-work` left out 2026-10-17: it is portrait, and a
 * 21:9 band of it shows only her back. */
export const homePlaceholderSlides: { key: PlaceholderKey; position?: string }[] = [
  { key: "interview", position: "50% 45%" },
  { key: "files-desk", position: "50% 35%" },
  { key: "laptop-pair", position: "50% 40%" },
  { key: "laptop-work", position: "50% 20%" },
];
