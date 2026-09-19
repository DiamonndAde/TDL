import { Register } from "@/components/layout/register";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { company } from "@/content/facts";

/**
 * One real photograph on the home page, near the close: TDL's own team or office at 69 Coker Road. The space
 * is reserved at 16:9, full content width, and stays visibly empty until the client supplies the shot
 * (CLIENT-QUESTIONS.md Q27). For client presentations only, PLACEHOLDER_IMAGES=true fills it with labelled,
 * licensed stock (src/content/placeholders.ts); production builds refuse that flag.
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
          placeholder="home-office"
        />
        <figcaption className="data mt-3 text-olive">
          {company.name}, {place}, {company.address.region}.
        </figcaption>
      </figure>
    </Register>
  );
}
