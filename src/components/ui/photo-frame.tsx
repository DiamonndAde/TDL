import Image from "next/image";
import { emptyFramesHidden, placeholders, placeholdersEnabled, type Placeholder, type PlaceholderKey } from "@/content/placeholders";

/**
 * A reserved space for a real photograph (AGENTS.md, Imagery). Three states:
 *  - `src` given: the real image at its aspect.
 *  - no `src`, PLACEHOLDER_IMAGES=true and a `placeholder` key: licensed stock with a visible
 *    "Placeholder — TDL photography required" label and a credit (registry: src/content/placeholders.ts).
 *  - otherwise: the reservation — a compact bordered note, not an empty box at the photograph's aspect. A large
 *    empty 16:9 reads as a broken image; a short bordered note reads as a deliberate gap. It names what belongs
 *    here and, where the frame is captioned with a place, the place (2026-09-19). `aspect` still applies once
 *    the image arrives, so the layout changes then by design.
 *  PRESENTATION_HIDE_EMPTY_FRAMES=true removes the reservation entirely. Use `frameShown()` where a wrapper
 *  (a figure, a grid column, a whole section) should go with it.
 */
export function frameShown({ src, placeholder }: { src?: unknown; placeholder?: PlaceholderKey }) {
  if (src) return true;
  if (placeholdersEnabled && placeholder && placeholder in placeholders) return true;
  return !emptyFramesHidden;
}

export function PhotoFrame({
  src,
  alt,
  aspect = "aspect-video",
  note,
  detail,
  todo,
  placeholder,
  placeholderPosition = "50% 50%",
  className = "",
}: {
  src?: { src: string; width: number; height: number };
  alt: string;
  aspect?: string;
  /** What belongs here, shown in the reservation, e.g. "Photograph to come: the office from Coker Road." */
  note: string;
  /** Second line of the reservation: the place, or the format the photograph needs. */
  detail?: string;
  /** CLIENT-QUESTIONS.md row. */
  todo: string;
  placeholder?: PlaceholderKey;
  /** CSS object-position for the placeholder crop, e.g. "50% 30%". */
  placeholderPosition?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative ${aspect} w-full overflow-hidden ${className}`}>
        <Image src={src.src} alt={alt} width={src.width} height={src.height} className="h-full w-full object-cover" sizes="(min-width: 80rem) 60rem, 100vw" />
      </div>
    );
  }
  const stock: Placeholder | null =
    placeholdersEnabled && placeholder ? (placeholders as Record<string, Placeholder>)[placeholder] ?? null : null;
  if (stock) {
    return (
      <div className={`relative ${aspect} w-full overflow-hidden border border-olive ${className}`} data-placeholder={placeholder}>
        <Image
          src={stock.file}
          alt={`Placeholder: ${stock.scene}`}
          width={stock.width}
          height={stock.height}
          className="h-full w-full object-cover"
          style={{ objectPosition: placeholderPosition }}
          sizes="(min-width: 80rem) 40rem, 100vw"
        />
        <p className="data absolute left-3 top-3 bg-ink px-2.5 py-1.5 text-paper">Placeholder — TDL photography required</p>
        <p className="data absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-olive">
          Photo: {stock.photographer}, Pexels
        </p>
      </div>
    );
  }
  if (emptyFramesHidden) return null;
  return (
    <div className={`h-full w-full border border-olive px-5 py-8 md:px-6 md:py-10 ${className}`} data-todo={todo}>
      <p className="data text-ink">{note}</p>
      {detail ? <p className="data mt-1.5 text-olive">{detail}</p> : null}
    </div>
  );
}
