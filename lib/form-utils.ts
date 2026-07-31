export function parseCsv(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export function num(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Used for manual size inputs (built on NumberPicker, which always submits a number) —
// 0 is treated as "unset/auto" rather than a literal zero size.
export function numOrNull(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
