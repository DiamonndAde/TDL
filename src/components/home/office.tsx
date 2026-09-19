import { Register } from "@/components/layout/register";
import { PhotoFrame, frameShown } from "@/components/ui/photo-frame";
import { company } from "@/content/facts";

/**
 * One real photograph on the home page, near the close: TDL's own team or office at 69 Coker Road
 * (CLIENT-QUESTIONS.md Q27). No placeholder, even behind the presentation flag: the caption names TDL's real
 * address, so any stock photograph here asserts something false. Until the shot arrives the frame is a compact
 * reservation naming the place and the format, not an empty 16:9 box; behind PRESENTATION_HIDE_EMPTY_FRAMES
 * the section is left out altogether. When the photograph lands, pass `src` and add a figcaption with the address.
 */
export function Office() {
  const place = `${company.address.street}, ${company.address.locality}`;
  if (!frameShown({})) return null;
  return (
    <Register id="office" title="The office" note={`${place}, ${company.address.region}`}>
      <PhotoFrame
        alt="Photograph of the Total Data Limited team at the Ilupeju office, to come"
        note={`Photograph to come: TDL’s own team at ${place}, ${company.address.region}.`}
        detail="16:9, at least 2,400 px wide."
        todo="Q27"
      />
    </Register>
  );
}
