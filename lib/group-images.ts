export type MediaEntry = { url: string; order: number };

// Groups extra-gallery-image/video rows (already sorted by sortOrder) by their
// parent item id, carrying each row's sortOrder along as `order` — needed so
// GalleryModal can merge-sort images/videos against Content's own order value.
export function groupImagesByParent<T extends { url: string; sortOrder: number }>(
  rows: T[],
  parentIdOf: (row: T) => number
): Map<number, MediaEntry[]> {
  const map = new Map<number, MediaEntry[]>();
  for (const row of rows) {
    const id = parentIdOf(row);
    const entry: MediaEntry = { url: row.url, order: row.sortOrder };
    const list = map.get(id);
    if (list) list.push(entry);
    else map.set(id, [entry]);
  }
  return map;
}
