// Shared ISO (`YYYY-MM-DD`) date formatting — used by `components/admin/DatePicker.tsx`
// (its trigger button) and by public display of a stored date column
// (WorldbuildingGrid/WorldbuildingBrowser). Kept out of `components/admin`
// so public, non-admin components don't import from the admin tree.

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parses an ISO (`YYYY-MM-DD`) value into its numeric parts, or `null` if malformed. */
export function parseIsoDate(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
}

export function formatIsoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Human-readable form of a stored ISO date, e.g. "Aug 10, 2026". Returns the
 * input unchanged if it isn't a parseable ISO date. */
export function formatDisplayDate(iso?: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso ?? "";
  return `${MONTH_NAMES[parsed.m]} ${parsed.d}, ${parsed.y}`;
}
