/**
 * Initials monogram for a named person's frame when no real headshot exists yet and placeholders are on.
 * Never a face: a stock or generated face under a real name manufactures a likeness. Archivo Expanded on --ink
 * in --signal, sized to the frame. Honorifics are dropped ("Mr. Michael Kehinde" → MK).
 */
const HONORIFICS = new Set(["mr", "mrs", "ms", "miss", "dr", "prof", "engr", "chief", "alhaji", "alhaja", "barr", "esq"]);

export function initialsOf(name: string) {
  const words = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((w) => w && !HONORIFICS.has(w.toLowerCase()));
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function Monogram({ name, size = 88, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`display flex items-center justify-center bg-ink text-signal ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34), letterSpacing: "-0.01em" }}
    >
      {initialsOf(name)}
    </span>
  );
}
