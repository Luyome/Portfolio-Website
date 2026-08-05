// Lightweight, dependency-free fuzzy matching: a plain substring match first
// (the common case), falling back to an in-order subsequence match so typos
// or skipped words ("krup realm" matching "Krupni Central Realm") still hit.
export function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (t.includes(q)) return true;
  let ti = 0;
  for (const ch of q) {
    if (ch === " ") continue;
    const found = t.indexOf(ch, ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}

/**
 * Shared "all" + sorted-descending distinct-year filter option list —
 * the same normalization previously duplicated across Portfolio, Sketches,
 * 3D, and Archive (each rebuilding this from its own item list).
 */
export function yearOptions<T>(items: T[], yearOf: (item: T) => number): string[] {
  return ["all", ...Array.from(new Set(items.map(yearOf))).sort((a, b) => b - a).map(String)];
}

/**
 * Safely resolves a `?year=` URL param against this list's real, known year
 * values. An unknown or malformed value (typo, stale bookmark, tampered
 * query) falls back to "all" instead of silently rendering a confusing
 * filtered-empty grid for a year that was never a real option.
 */
export function resolveYearParam(initialYear: string | undefined, years: string[]): string {
  if (!initialYear) return "all";
  return years.includes(initialYear) ? initialYear : "all";
}
