import { Register } from "@/components/layout/register";
import { company } from "@/content/facts";

/**
 * One real photograph on the home page, near the close: TDL's own team or office at 69 Coker Road. The space
 * is reserved at 16:9, full content width, and stays visibly empty until the client supplies the shot
 * (CLIENT-QUESTIONS.md Q27). Never filled with stock or anything generated — AGENTS.md, Imagery.
 */
export function Office() {
  return (
    <Register id="office" title="The office" note={`${company.address.street}, ${company.address.locality}, ${company.address.region}`}>
      <figure>
        <div
          className="flex aspect-video w-full items-center justify-center border border-olive"
          data-todo="Q27"
          role="img"
          aria-label="Photograph of the Total Data Limited team at the Ilupeju office, to come"
        >
          <span className="data max-w-[36ch] px-4 text-center text-olive">
            Photograph to come: TDL&rsquo;s own team at {company.address.street}, {company.address.locality}. Real people,
            real place.
          </span>
        </div>
        <figcaption className="data mt-3 text-olive">
          {company.name}, {company.address.street}, {company.address.locality}, {company.address.region}.
        </figcaption>
      </figure>
    </Register>
  );
}
