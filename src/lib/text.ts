/**
 * A sentence-case name used mid-sentence: "Payroll management" → "payroll management", but "HR outsourcing"
 * stays "HR outsourcing". Only the first letter changes, and only when the first word is not an acronym, so
 * names keep their capitals ("Read about hr outsourcing" was the bug, TDL review 2026-10-17).
 */
export function inSentence(name: string): string {
  const first = name.split(/\s/, 1)[0] ?? "";
  if (first.length > 1 && first === first.toUpperCase()) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}
