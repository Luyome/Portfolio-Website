export type PublicContentType = "portfolio" | "sketch" | "model3d" | "worldbuilding" | "game";

const CONTENT_INDEX_PATH: Record<PublicContentType, string> = {
  portfolio: "/portfolio",
  sketch: "/sketches",
  model3d: "/3d",
  worldbuilding: "/worldbuilding",
  game: "/games",
};

export function resolveContentDetailHref(type: PublicContentType, contentId: number): string | null {
  if (!Number.isSafeInteger(contentId) || contentId <= 0) return null;
  return `${CONTENT_INDEX_PATH[type]}?item=${contentId}`;
}

export function parseContentItemId(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function findContentItemIndex(items: ReadonlyArray<{ id: number }>, contentId: number | null): number | null {
  if (contentId === null) return null;
  const index = items.findIndex((item) => item.id === contentId);
  return index >= 0 ? index : null;
}
