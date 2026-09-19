import { Register } from "@/components/layout/register";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { company } from "@/content/facts";

/**
 * One real photograph on the home page, near the close: TDL's own team or office at 69 Coker Road. The space
 * is reserved at 16:9, full content width, and stays visibly empty until the client supplies the shot
 * (CLIENT-QUESTIONS.md Q27). No placeholder, even behind the presentation flag: the caption names TDL's real
 * address, so any stock photograph here asserts something false. The empty frame is the honest state.
 */
export function Office() {
  const place = `${company.address.street}, ${company.address.locality}`;
  return (
    <Register id="office" title="The office" note={`${place}, ${company.address.region}`}>
      <figure>
        <PhotoFrame
          alt="Photograph of the Total Data Limited team at the Ilupeju office, to come"
          note={`Photograph to come: TDL’s own team at ${place}. Real people, real place.`}
          todo="Q27"
        />
        <figcaption className="data mt-3 text-olive">
          {company.name}, {place}, {company.address.region}.
        </figcaption>
      </figure>
    </Register>
  );
}
