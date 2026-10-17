import { Register } from "@/components/layout/register";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { company } from "@/content/facts";
import { homePhotographs, homePlaceholderSlides, standInCaption } from "@/content/photographs";
import { emptyFramesHidden, placeholders, placeholdersEnabled } from "@/content/placeholders";
import { PhotoSlider, type Slide } from "./photo-slider";

/**
 * "At work": the photograph slider, directly after the proof bar (TDL review, 2026-10-17 — it was near the close).
 * The figures say how many people; this shows who they are. Three states, decided at build time:
 *  - TDL's own photographs (src/content/photographs.ts, Q27): the slider.
 *  - Presentation build with none yet: the slider over stand-in images, under one caption line that says what
 *    they are and claims nothing about TDL — no address, no "our team" (AGENTS.md, Placeholders, rule 3).
 *    Credits live in PLACEHOLDERS.md, not on the images (TDL review, 2026-10-17).
 *  - Otherwise: the compact reservation note; behind PRESENTATION_HIDE_EMPTY_FRAMES the section is left out.
 * The id stays "office": screenshot and test scripts address the section by it.
 */
export function Office() {
  const note = "The people behind the marks";

  if (homePhotographs.length) {
    const slides: Slide[] = homePhotographs.map((p) => ({ ...p }));
    return (
      <Register id="office" title="At work" note={note}>
        <PhotoSlider slides={slides} label="Photographs of Total Data Limited at work" />
      </Register>
    );
  }

  if (placeholdersEnabled) {
    const slides: Slide[] = homePlaceholderSlides.map(({ key, position }) => {
      const p = placeholders[key];
      return { src: p.file, width: p.width, height: p.height, alt: `Stand-in image: ${p.scene}`, position, placeholder: key };
    });
    return (
      <Register id="office" title="At work" note={note}>
        <figure>
          <PhotoSlider slides={slides} label="Stand-in images of people at work" />
          <figcaption className="data mt-2 text-olive">{standInCaption}</figcaption>
        </figure>
      </Register>
    );
  }

  if (emptyFramesHidden) return null;
  const place = `${company.address.street}, ${company.address.locality}, ${company.address.region}`;
  return (
    <Register id="office" title="At work" note={note}>
      <PhotoFrame
        alt="Photographs of the Total Data Limited team at the Ilupeju office, to come"
        note={`Photographs to come: TDL’s own team at work at ${place}.`}
        detail="Four to six, at least 2,400 px wide. They run here as a slideshow, cropped wide (21:9)."
        todo="Q27"
      />
    </Register>
  );
}
