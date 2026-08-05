import { oneOf, requiredText, requiredUrl } from "@/lib/validation";

const LINK_KINDS = ["link", "download"] as const;

// Shared link-record fields — the same shape (label/href/kind/sortOrder) is
// read identically in every content type's link sub-resource (portfolio,
// sketches, games, models3d, worldbuilding); kept here once instead of
// duplicated per action file.
export function parseLinkFields(formData: FormData) {
  const kindValue = str(formData.get("kind"));
  return {
    label: requiredText(formData.get("label"), "Label"),
    href: requiredUrl(formData.get("href"), "Link URL"),
    kind: kindValue ? oneOf(formData.get("kind"), LINK_KINDS, "Link type") : "link",
    sortOrder: num(formData.get("sortOrder")),
  };
}

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
