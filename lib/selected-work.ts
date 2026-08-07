import type { ResolvedHomeContent } from "@/lib/home-data";

export const SELECTED_WORK_DISPLAY_COUNT = 6;

const TYPE_LABELS: Record<ResolvedHomeContent["type"], string> = {
  portfolio: "Portfolio",
  sketch: "Sketch",
  model3d: "3D Work",
  worldbuilding: "Worldbuilding",
  game: "Game Design",
};

export type SelectedWorkDisplayItem = {
  key: string;
  title: string;
  summary: string | null;
  image: string | null;
  href: string | null;
  typeLabel: string;
  isPlaceholder: boolean;
};

export function buildSelectedWorkDisplayItems(
  items: readonly ResolvedHomeContent[]
): SelectedWorkDisplayItem[] {
  const real = items.slice(0, SELECTED_WORK_DISPLAY_COUNT).map((item) => ({
    key: `selection-${item.selectionId}`,
    title: item.title,
    summary: item.summary || null,
    image: item.image,
    href: item.href,
    typeLabel: TYPE_LABELS[item.type],
    isPlaceholder: false,
  }));

  return [
    ...real,
    ...Array.from({ length: SELECTED_WORK_DISPLAY_COUNT - real.length }, (_, index) => {
      const slot = real.length + index + 1;
      return {
        key: `placeholder-${slot}`,
        title: `Selected Work ${String(slot).padStart(2, "0")}`,
        summary: null,
        image: null,
        href: null,
        typeLabel: "Project Slot",
        isPlaceholder: true,
      };
    }),
  ];
}

export function wrapSelectedWorkIndex(index: number, count: number): number {
  return count ? ((index % count) + count) % count : 0;
}

export function selectedWorkPosition(index: number, activeIndex: number, count: number): -1 | 0 | 1 | null {
  if (!count) return null;
  if (index === activeIndex) return 0;
  if (index === wrapSelectedWorkIndex(activeIndex - 1, count)) return -1;
  if (index === wrapSelectedWorkIndex(activeIndex + 1, count)) return 1;
  return null;
}
