import Image from "next/image";
import { placeholdersEnabled } from "@/content/placeholders";
import type { Person } from "@/content/about";
import { Monogram } from "./monogram";

/**
 * A named person's portrait frame at 4:5. Real headshot when supplied (Q18); otherwise an initials monogram when
 * the presentation flag is on, or "Portrait to come". Never a stock or generated face — a face under a real name
 * manufactures a likeness.
 */
export function PersonFrame({ person, width = 200 }: { person: Person; width?: number }) {
  const height = Math.round(width * 1.25);
  if (person.portrait) {
    return (
      <Image
        src={person.portrait.src}
        alt={`${person.name}, ${person.role}`}
        width={person.portrait.width}
        height={person.portrait.height}
        style={{ width, height }}
        className="object-cover"
        sizes={`${width}px`}
      />
    );
  }
  if (placeholdersEnabled) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-ink" data-todo="Q18">
        <Monogram name={person.name} size={width} className="!bg-transparent" />
      </div>
    );
  }
  return (
    <div
      style={{ width, height }}
      className="flex items-center justify-center border border-olive"
      data-todo="Q18"
      role="img"
      aria-label={`Portrait of ${person.name}, to come`}
    >
      <span className="data px-3 text-center text-olive">Portrait to come</span>
    </div>
  );
}
