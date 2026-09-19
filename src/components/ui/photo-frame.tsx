import Image from "next/image";
import { placeholders, placeholdersEnabled, type Placeholder, type PlaceholderKey } from "@/content/placeholders";

/**
 * A reserved space for a real photograph (AGENTS.md, Imagery). Three states:
 *  - `src` given: the real image.
 *  - no `src`, PLACEHOLDER_IMAGES=true and a `placeholder` key: licensed stock with a visible
 *    "Placeholder — TDL photography required" label. The registry is currently empty by decision, so this
 *    branch cannot be reached (see src/content/placeholders.ts).
 *  - otherwise: the empty frame, bordered, with the note of what belongs here.
 */
export function PhotoFrame({
  src,
  alt,
  aspect = "aspect-video",
  note,
  todo,
  placeholder,
  className = "",
}: {
  src?: { src: string; width: number; height: number };
  alt: string;
  aspect?: string;
  /** What belongs here, shown in the empty state. */
  note: string;
  /** CLIENT-QUESTIONS.md row. */
  todo: string;
  placeholder?: PlaceholderKey;
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
        <Image src={stock.file} alt={`Placeholder: ${stock.scene}`} width={stock.width} height={stock.height} className="h-full w-full object-cover" sizes="(min-width: 80rem) 60rem, 100vw" />
        <p className="data absolute left-3 top-3 bg-ink px-2.5 py-1.5 text-paper">Placeholder — TDL photography required</p>
        <p className="data absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-olive">
          Photo: {stock.photographer}, Pexels
        </p>
      </div>
    );
  }
  return (
    <div
      className={`flex ${aspect} w-full items-center justify-center border border-olive ${className}`}
      data-todo={todo}
      role="img"
      aria-label={alt}
    >
      <span className="data max-w-[36ch] px-4 text-center text-olive">{note}</span>
    </div>
  );
}
