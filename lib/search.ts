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
