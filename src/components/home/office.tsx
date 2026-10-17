import { Register } from "@/components/layout/register";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { company } from "@/content/facts";
import { homePhotographs, homePlaceholderSlides } from "@/content/photographs";
import { emptyFramesHidden, placeholders, placeholdersEnabled } from "@/content/placeholders";
import { PhotoSlider, type Slide } from "./photo-slider";

/**
 * Photographs near the close, as a slider (TDL review, 2026-10-16, item 8 — it replaced one reserved office frame,
 * and the Work section's single photograph folded into it). Three states, decided here at build time:
 *  - TDL's own photographs (src/content/photographs.ts, Q27): the slider, and the section may name the office.
 *  - Presentation build with none yet: the slider over licensed placeholders, each labelled and credited, under
 *    a caption that claims nothing about TDL — no address, no "our team" (AGENTS.md, Placeholders, rule 3).
 *  - Otherwise: the compact reservation note; behind PRESENTATION_HIDE_EMPTY_FRAMES the section is left out.
 * The id stays "office": screenshot and crop scripts address the section by it.
 */
export function Office() {
  const place = `${company.address.street}, ${company.address.locality}, ${company.address.region}`;

  if (homePhotographs.length) {
    const slides: Slide[] = homePhotographs.map((p) => ({ ...p }));
    return (
      <Register id="office" title="At work" note={place}>
        <PhotoSlider slides={slides} label="Photographs of Total Data Limited at work" />
      </Register>
    );
  }

  if (placeholdersEnabled) {
    const slides: Slide[] = homePlaceholderSlides.map(({ key, position }) => {
      const p = placeholders[key];
      return {
        src: p.file,
        width: p.width,
        height: p.height,
        alt: `Placeholder: ${p.scene}`,
        position,
        credit: `Photo: ${p.photographer}, ${p.licence}`,
        placeholder: key,
      };
    });
    return (
      <Register id="office" title="At work">
        <figure>
          <PhotoSlider slides={slides} label="Placeholder photographs of people at work" />
          <figcaption className="data mt-3 text-olive">
            People at work in Nigerian offices. Not TDL&rsquo;s staff or premises; TDL&rsquo;s own photographs to come.
          </figcaption>
        </figure>
      </Register>
    );
  }

  if (emptyFramesHidden) return null;
  return (
    <Register id="office" title="At work" note={place}>
      <PhotoFrame
        alt="Photographs of the Total Data Limited team at the Ilupeju office, to come"
        note={`Photographs to come: TDL’s own team at work at ${place}.`}
        detail="Four to six, 3:2 or 16:9, at least 2,400 px wide. They run here as a slideshow."
        todo="Q27"
      />
    </Register>
  );
}
